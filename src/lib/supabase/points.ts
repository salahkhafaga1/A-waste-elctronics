import { createAdminClient } from './admin';
import type { PointsTransaction, PointsSummary, TransactionType } from '@/types/database';

export async function getUserPointsLedger(userId: string): Promise<PointsTransaction[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching points transactions:', error);
      return [];
    }

    return (data || []) as PointsTransaction[];
  } catch (err) {
    console.error('Points ledger query exception:', err);
    return [];
  }
}

export async function getUserPointsSummary(userId: string): Promise<PointsSummary> {
  const ledger = await getUserPointsLedger(userId);

  let totalEarned = 0;
  let totalSpent = 0;

  for (const tx of ledger) {
    if (tx.points > 0) {
      totalEarned += tx.points;
    } else {
      totalSpent += Math.abs(tx.points);
    }
  }

  const currentBalance = ledger.length > 0 ? ledger[0].balance_after : 0;

  return {
    currentBalance,
    totalEarned,
    totalSpent,
    transactionCount: ledger.length,
  };
}

export async function recordPointsTransaction(params: {
  userId: string;
  requestId?: string | null;
  type: TransactionType;
  points: number;
  description: string;
}): Promise<{ success: boolean; data?: PointsTransaction; error?: string }> {
  try {
    const supabase = createAdminClient();

    // 1. If it's a request award, prevent duplicate points award for the same request
    if (params.requestId && params.type === 'collection') {
      const { data: existingAward } = await supabase
        .from('points_transactions')
        .select('id')
        .eq('request_id', params.requestId)
        .eq('type', 'collection')
        .maybeSingle();

      if (existingAward) {
        return {
          success: false,
          error: 'تم بالفعل صرف وإيداع نقاط هذا الطلب مسبقاً لمنع التكرار.',
        };
      }
    }

    // 2. Insert transaction (atomic balance calculation & sync handled by DB trigger)
    const { data, error } = await supabase
      .from('points_transactions')
      .insert({
        user_id: params.userId,
        request_id: params.requestId || null,
        type: params.type,
        points: params.points,
        description: params.description,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error recording points transaction in Supabase:', error);
      return {
        success: false,
        error: error?.message || 'فشلت عملية تسجيل المعاملة في محفظة النقاط.',
      };
    }

    return {
      success: true,
      data: data as PointsTransaction,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function awardPointsForVerifiedRequest(params: {
  requestId: string;
  verifiedWeight: number;
  finalPoints: number;
  adminNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // 1. Fetch request
  const { data: req, error: reqErr } = await supabase
    .from('collection_requests')
    .select('*')
    .eq('id', params.requestId)
    .single();

  if (reqErr || !req) {
    return { success: false, error: 'الطلب غير موجود.' };
  }

  // 2. Update request status to verified
  const { error: updateErr } = await supabase
    .from('collection_requests')
    .update({
      status: 'verified',
      verified_weight: params.verifiedWeight,
      final_points: params.finalPoints,
      notes: params.adminNotes ? `${req.notes ? req.notes + ' | ' : ''}${params.adminNotes}` : req.notes,
    })
    .eq('id', params.requestId);

  if (updateErr) {
    return { success: false, error: 'تعذر تحديث حالة الطلب في قاعدة البيانات.' };
  }

  // 3. Record collection points transaction into ledger
  const txResult = await recordPointsTransaction({
    userId: req.user_id,
    requestId: params.requestId,
    type: 'collection',
    points: params.finalPoints,
    description: `نقاط معتمدة مقابل تسليم مخلفات إلكترونية (طلب #${params.requestId.slice(0, 8)})`,
  });

  if (!txResult.success) {
    return { success: false, error: txResult.error };
  }

  return { success: true };
}
