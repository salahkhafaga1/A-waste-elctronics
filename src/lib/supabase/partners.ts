import { createAdminClient } from './admin';
import { SEED_PARTNERS } from '@/constants/partners';
import type {
  Partner,
  PartnerType,
  PartnerStatus,
  PickupAssignment,
  PickupStatus,
} from '@/types/database';

export async function getAllPartners(filters?: {
  type?: string;
  status?: string;
  governorate?: string;
}): Promise<Partner[]> {
  const supabase = createAdminClient();

  try {
    let query = supabase.from('partners').select('*').order('created_at', { ascending: false });

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.governorate && filters.governorate !== 'all') {
      query = query.eq('governorate', filters.governorate);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let filtered = SEED_PARTNERS;
      if (filters?.type && filters.type !== 'all') {
        filtered = filtered.filter((p) => p.type === filters.type);
      }
      if (filters?.governorate && filters.governorate !== 'all') {
        filtered = filtered.filter((p) => p.governorate === filters.governorate);
      }
      return filtered;
    }

    return data as Partner[];
  } catch (err) {
    console.warn('Using fallback seed partners:', err);
    return SEED_PARTNERS;
  }
}

export async function getCollectionPoints(governorate?: string): Promise<Partner[]> {
  return getAllPartners({
    type: 'collection_point',
    status: 'active',
    governorate: governorate || 'all',
  });
}

export async function getPartnerById(partnerId: string): Promise<Partner | null> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', partnerId)
      .single();

    if (error || !data) {
      return SEED_PARTNERS.find((p) => p.id === partnerId) || null;
    }

    return data as Partner;
  } catch {
    return SEED_PARTNERS.find((p) => p.id === partnerId) || null;
  }
}

export async function getPickupAssignmentByRequestId(
  requestId: string
): Promise<PickupAssignment | null> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('pickup_assignments')
      .select('*, partner:partners(*)')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PickupAssignment;
  } catch {
    return null;
  }
}

export async function getAllPickupAssignmentsAdmin(): Promise<PickupAssignment[]> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('pickup_assignments')
      .select('*, partner:partners(*), request:collection_requests(*)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as PickupAssignment[];
  } catch {
    return [];
  }
}
