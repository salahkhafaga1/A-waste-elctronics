import { auth, currentUser } from '@clerk/nextjs/server';
import { getProfileByClerkId } from '@/lib/supabase/profiles';
import type { UserRole } from '@/types/database';
import { ROLES } from '@/constants/roles';

export async function getCurrentUserRole(): Promise<UserRole> {
  const { userId } = auth();

  if (!userId) {
    return ROLES.USER;
  }

  // 1. First check Clerk session/public metadata for fast server-side checks
  const user = await currentUser();
  const metadataRole = (user?.publicMetadata?.role || user?.privateMetadata?.role) as UserRole | undefined;

  if (metadataRole && (metadataRole === ROLES.USER || metadataRole === ROLES.ADMIN)) {
    return metadataRole;
  }

  // 2. Fallback to Supabase database profile
  try {
    const profile = await getProfileByClerkId(userId);
    if (profile?.role) {
      return profile.role;
    }
  } catch (error) {
    console.error('Failed to fetch user role from Supabase:', error);
  }

  return ROLES.USER;
}

export async function checkIsAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === ROLES.ADMIN;
}
