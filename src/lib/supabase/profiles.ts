import { createAdminClient } from './admin';
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database';

export async function getProfileByClerkId(clerkUserId: string): Promise<Profile | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      return null;
    }
    console.error('Error fetching profile from Supabase:', error);
    return null;
  }

  return data as Profile;
}

export async function syncUserProfile(params: {
  clerkUserId: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
}): Promise<Profile> {
  const supabase = createAdminClient();

  // Try to find existing profile
  const existing = await getProfileByClerkId(params.clerkUserId);

  if (existing) {
    // Check if email or name changed in Clerk
    if (
      (params.fullName && existing.full_name !== params.fullName) ||
      (params.email && existing.email !== params.email)
    ) {
      const updatePayload: ProfileUpdate = {
        full_name: params.fullName ?? existing.full_name,
        email: params.email || existing.email,
      };

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('clerk_user_id', params.clerkUserId)
        .select()
        .single();

      if (!updateError && updated) {
        return updated as Profile;
      }
    }
    return existing;
  }

  // Create new profile record
  const newProfile: ProfileInsert = {
    clerk_user_id: params.clerkUserId,
    email: params.email,
    full_name: params.fullName ?? null,
    phone: params.phone ?? null,
    role: 'user',
    points_balance: 0,
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile in Supabase:', error);
    throw new Error(`Failed to initialize user profile in database: ${error.message}`);
  }

  return data as Profile;
}

export async function updateUserProfile(
  clerkUserId: string,
  data: ProfileUpdate
): Promise<{ success: boolean; data?: Profile; error?: string }> {
  const supabase = createAdminClient();

  // Explicitly sanitize out privileged fields
  const safeData: ProfileUpdate = {};
  if (data.full_name !== undefined) safeData.full_name = data.full_name;
  if (data.phone !== undefined) safeData.phone = data.phone;

  const { data: updated, error } = await supabase
    .from('profiles')
    .update(safeData)
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: updated as Profile };
}
