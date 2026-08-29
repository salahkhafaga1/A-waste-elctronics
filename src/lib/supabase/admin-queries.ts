import { createAdminClient } from './admin';
import { recordPointsTransaction } from './points';
import { SEED_CATEGORIES, SEED_ITEMS } from '@/constants/waste';
import { SEED_REWARDS } from '@/constants/rewards';
import type {
  CollectionRequest,
  RequestItem,
  Profile,
  Reward,
  Redemption,
  WasteCategory,
  WasteItem,
  RequestStatus,
  RedemptionStatus,
  UserRole,
} from '@/types/database';

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  collectedWasteKg: number;
  verifiedWasteKg: number;
  recycledWasteKg: number;
  totalPointsAwarded: number;
  pendingRedemptions: number;
}

export interface AdminFullRequest extends CollectionRequest {
  items: RequestItem[];
  user?: Profile | null;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const supabase = createAdminClient();

  try {
    // 1. Users count
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Collection requests
    const { data: requests } = await supabase
      .from('collection_requests')
      .select('status, estimated_weight, verified_weight, final_points');

    let totalRequests = 0;
    let pendingRequests = 0;
    let collectedWasteKg = 0;
    let verifiedWasteKg = 0;
    let recycledWasteKg = 0;
    let totalPointsAwarded = 0;

    if (requests && requests.length > 0) {
      totalRequests = requests.length;
      for (const req of requests) {
        if (req.status === 'pending') pendingRequests++;
        if (['collected', 'verified', 'recycled'].includes(req.status)) {
          collectedWasteKg += Number(req.verified_weight || req.estimated_weight || 0);
        }
        if (['verified', 'recycled'].includes(req.status)) {
          verifiedWasteKg += Number(req.verified_weight || req.estimated_weight || 0);
        }
        if (req.status === 'recycled') {
          recycledWasteKg += Number(req.verified_weight || req.estimated_weight || 0);
        }
        if (req.final_points) {
          totalPointsAwarded += Number(req.final_points);
        }
      }
    }

    // 3. Pending redemptions (cash payouts needing admin action)
    const { count: pendingRedemptionsCount } = await supabase
      .from('redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      totalUsers: usersCount || 1,
      totalRequests,
      pendingRequests,
      collectedWasteKg: Math.round(collectedWasteKg * 10) / 10,
      verifiedWasteKg: Math.round(verifiedWasteKg * 10) / 10,
      recycledWasteKg: Math.round(recycledWasteKg * 10) / 10,
      totalPointsAwarded,
      pendingRedemptions: pendingRedemptionsCount || 0,
    };
  } catch (error) {
    console.error('Error computing admin metrics:', error);
    return {
      totalUsers: 1,
      totalRequests: 0,
      pendingRequests: 0,
      collectedWasteKg: 0,
      verifiedWasteKg: 0,
      recycledWasteKg: 0,
      totalPointsAwarded: 0,
      pendingRedemptions: 0,
    };
  }
}

export async function getAllRequestsAdmin(filters?: {
  status?: string;
  search?: string;
}): Promise<AdminFullRequest[]> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('collection_requests')
      .select('*, items:request_items(*)')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data: requests, error } = await query;
    if (error || !requests) {
      console.error('Error fetching admin requests:', error);
      return [];
    }

    // Fetch user profiles for each request
    const userIds = Array.from(new Set(requests.map((r) => r.user_id)));
    let profilesMap: Record<string, Profile> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('clerk_user_id', userIds);

      if (profiles) {
        profilesMap = profiles.reduce((acc, p) => {
          acc[p.clerk_user_id] = p;
          return acc;
        }, {} as Record<string, Profile>);
      }
    }

    return requests.map((req) => ({
      ...req,
      items: req.items || [],
      user: profilesMap[req.user_id] || null,
    })) as AdminFullRequest[];
  } catch (err) {
    console.error('Exception fetching admin requests:', err);
    return [];
  }
}

export async function getAdminRequestDetails(requestId: string): Promise<AdminFullRequest | null> {
  const supabase = createAdminClient();

  try {
    const { data: request, error } = await supabase
      .from('collection_requests')
      .select('*, items:request_items(*)')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', request.user_id)
      .single();

    return {
      ...request,
      items: request.items || [],
      user: profile || null,
    } as AdminFullRequest;
  } catch (err) {
    console.error('Error fetching admin request details:', err);
    return null;
  }
}

export async function getAllRedemptionsAdmin(filters?: {
  status?: string;
  category?: string;
}): Promise<(Redemption & { user?: Profile | null })[]> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('redemptions')
      .select('*, reward:rewards(*)')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data: redemptions, error } = await query;
    if (error || !redemptions) {
      console.error('Error fetching admin redemptions:', error);
      return [];
    }

    // Attach user profile info
    const userIds = Array.from(new Set(redemptions.map((r) => r.user_id)));
    let profilesMap: Record<string, Profile> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('clerk_user_id', userIds);

      if (profiles) {
        profilesMap = profiles.reduce((acc, p) => {
          acc[p.clerk_user_id] = p;
          return acc;
        }, {} as Record<string, Profile>);
      }
    }

    return redemptions.map((r) => {
      let rewardObj = r.reward as Reward | undefined;
      if (!rewardObj) {
        rewardObj = SEED_REWARDS.find((sr) => sr.id === r.reward_id);
      }
      return {
        ...r,
        reward: rewardObj,
        user: profilesMap[r.user_id] || null,
      };
    });
  } catch (err) {
    console.error('Exception fetching admin redemptions:', err);
    return [];
  }
}

export async function getAllUsersAdmin(): Promise<Profile[]> {
  const supabase = createAdminClient();

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !profiles) {
      return [];
    }

    return profiles as Profile[];
  } catch (err) {
    console.error('Error fetching all users for admin:', err);
    return [];
  }
}

export async function getAllWasteCategoriesAdmin(): Promise<WasteCategory[]> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('waste_categories')
      .select('*')
      .order('name_ar', { ascending: true });

    if (error || !data || data.length === 0) {
      return SEED_CATEGORIES;
    }

    return data as WasteCategory[];
  } catch {
    return SEED_CATEGORIES;
  }
}

export async function getAllWasteItemsAdmin(): Promise<(WasteItem & { category?: WasteCategory })[]> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('waste_items')
      .select('*, category:waste_categories(*)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return SEED_ITEMS.map((item) => ({
        ...item,
        category: SEED_CATEGORIES.find((c) => c.id === item.category_id),
      }));
    }

    return data as (WasteItem & { category?: WasteCategory })[];
  } catch {
    return SEED_ITEMS.map((item) => ({
      ...item,
      category: SEED_CATEGORIES.find((c) => c.id === item.category_id),
    }));
  }
}

export async function getAllRewardsAdmin(): Promise<Reward[]> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return SEED_REWARDS;
    }

    return data as Reward[];
  } catch {
    return SEED_REWARDS;
  }
}
