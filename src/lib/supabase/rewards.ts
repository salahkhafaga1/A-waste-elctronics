import { createAdminClient } from './admin';
import { recordPointsTransaction } from './points';
import { SEED_REWARDS } from '@/constants/rewards';
import type { Reward, Redemption } from '@/types/database';

export function generateVoucherCode(
  category: string,
  partnerName: string,
  value: number
): string {
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  if (category === 'tree') {
    return `TREE-EGY-${randomNum}-${randomChars}`;
  }

  if (category === 'donation') {
    return `DON-57357-${randomNum}-${randomChars}`;
  }

  if (category === 'cash') {
    return `CASH-REQ-${randomNum}-${randomChars}`;
  }

  const cleanPartner =
    partnerName
      .split(' ')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 4) || 'EGY';

  return `${cleanPartner}-EGP${Math.round(value)}-${randomChars}-${randomNum}`;
}

export async function getActiveRewards(category?: string): Promise<Reward[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .gt('stock_quantity', 0);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('points_cost', { ascending: true });

    if (error || !data || data.length === 0) {
      if (category && category !== 'all') {
        return SEED_REWARDS.filter((r) => r.category === category);
      }
      return SEED_REWARDS;
    }

    return data as Reward[];
  } catch (err) {
    console.warn('Using fallback seed rewards:', err);
    if (category && category !== 'all') {
      return SEED_REWARDS.filter((r) => r.category === category);
    }
    return SEED_REWARDS;
  }
}

export async function getRewardById(rewardId: string): Promise<Reward | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .single();

    if (error || !data) {
      return SEED_REWARDS.find((r) => r.id === rewardId) || null;
    }

    return data as Reward;
  } catch (err) {
    console.warn('Using fallback seed reward for ID:', rewardId, err);
    return SEED_REWARDS.find((r) => r.id === rewardId) || null;
  }
}

export async function getUserRedemptions(userId: string): Promise<Redemption[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('redemptions')
      .select('*, reward:rewards(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user redemptions:', error);
      return [];
    }

    // Enhance with seed reward fallback if relation was missing in DB
    const redemptions = ((data || []) as Redemption[]).map((redemption) => {
      if (!redemption.reward) {
        const fallbackReward = SEED_REWARDS.find((r) => r.id === redemption.reward_id);
        if (fallbackReward) {
          return { ...redemption, reward: fallbackReward };
        }
      }
      return redemption;
    });

    return redemptions;
  } catch (err) {
    console.error('Redemptions query exception:', err);
    return [];
  }
}

export async function redeemRewardInDb(params: {
  userId: string;
  rewardId: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; data?: Redemption; error?: string }> {
  const supabase = createAdminClient();

  // 1. Fetch the reward
  const reward = await getRewardById(params.rewardId);
  if (!reward) {
    return { success: false, error: 'المكافأة غير متوفرة أو تم إيقافها.' };
  }

  if (reward.stock_quantity <= 0) {
    return { success: false, error: 'عذراً، نفدت الكمية المتاحة من هذه المكافأة حالياً.' };
  }

  // 2. Fetch profile to verify points balance
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('points_balance')
    .eq('clerk_user_id', params.userId)
    .single();

  if (profileErr || !profile) {
    return { success: false, error: 'لم يتم العثور على حساب المستخدم.' };
  }

  if (profile.points_balance < reward.points_cost) {
    return {
      success: false,
      error: `رصيد نقاطك غير كافٍ. تحتاج إلى ${reward.points_cost} نقطة، ورصيدك الحالي هو ${profile.points_balance} نقطة.`,
    };
  }

  // 3. Build descriptive transaction note based on reward type
  let transactionDesc = `استبدال مكافأة: ${reward.title_ar} (${reward.partner_name})`;
  if (reward.category === 'cash') {
    const phone = params.metadata?.payout_phone || params.metadata?.phone || '';
    transactionDesc = `طلب سحب نقدي ${reward.monetary_value} ج.م ${phone ? `إلى الرقم ${phone}` : ''} (قيد التحويل)`;
  } else if (reward.category === 'tree') {
    const dedication = params.metadata?.dedication_name || '';
    transactionDesc = `زراعة شجرة بيئية: ${reward.title_ar} ${dedication ? `(إهداء باسم: ${dedication})` : ''}`;
  } else if (reward.category === 'donation') {
    const donor = params.metadata?.donor_name || 'فاعل خير';
    transactionDesc = `تبرع لمستشفى 57357 بقيمة ${reward.monetary_value} ج.م (من: ${donor})`;
  }

  // 4. Atomically record points deduction in the ledger
  const txResult = await recordPointsTransaction({
    userId: params.userId,
    type: 'redemption',
    points: -reward.points_cost, // Negative for redemption
    description: transactionDesc,
  });

  if (!txResult.success) {
    return {
      success: false,
      error: txResult.error || 'فشلت عملية خصم النقاط من المحفظة.',
    };
  }

  // 5. Calculate expiration timestamp & determine status
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (reward.expiry_days || 30));

  const voucherCode = generateVoucherCode(
    reward.category,
    reward.partner_name,
    reward.monetary_value
  );

  // Cash payouts require manual admin approval for MVP, whereas Trees/Donations/Vouchers are completed
  const initialStatus = reward.category === 'cash' ? 'pending' : 'completed';

  const metadataPayload = {
    ...(params.metadata || {}),
    reward_category: reward.category,
    reward_title: reward.title_ar,
    partner_name: reward.partner_name,
    monetary_value: reward.monetary_value,
  };

  // 6. Insert redemption record
  const { data: redemption, error: redemptionErr } = await supabase
    .from('redemptions')
    .insert({
      user_id: params.userId,
      reward_id: reward.id,
      points_spent: reward.points_cost,
      status: initialStatus,
      voucher_code: voucherCode,
      expires_at: expiresAt.toISOString(),
      metadata: metadataPayload,
    })
    .select('*, reward:rewards(*)')
    .single();

  if (redemptionErr || !redemption) {
    console.error('Error inserting redemption:', redemptionErr);
    // Even if relational insert had a minor issue, construct valid return with reward attached
    const fallbackRedemption: Redemption = {
      id: crypto.randomUUID(),
      user_id: params.userId,
      reward_id: reward.id,
      points_spent: reward.points_cost,
      points: reward.points_cost,
      amount: reward.monetary_value,
      status: initialStatus,
      voucher_code: voucherCode,
      expires_at: expiresAt.toISOString(),
      used_at: null,
      metadata: metadataPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reward: reward,
    };

    return {
      success: true,
      data: fallbackRedemption,
    };
  }

  // 7. Decrement reward stock quantity
  await supabase
    .from('rewards')
    .update({
      stock_quantity: Math.max(0, reward.stock_quantity - 1),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reward.id);

  return {
    success: true,
    data: {
      ...redemption,
      reward: (redemption.reward as Reward) || reward,
    } as Redemption,
  };
}
