export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS_AR: Record<AppRole, string> = {
  [ROLES.USER]: 'مستخدم',
  [ROLES.ADMIN]: 'مسؤول النظام',
};

export const ROLE_LABELS_EN: Record<AppRole, string> = {
  [ROLES.USER]: 'User',
  [ROLES.ADMIN]: 'Administrator',
};
