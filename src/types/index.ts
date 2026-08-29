export * from './database';

export interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

export interface UserSessionData {
  userId: string;
  email?: string;
  fullName?: string;
  role: 'user' | 'admin';
}
