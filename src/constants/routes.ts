export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  REQUEST: '/request',
  REQUEST_SUCCESS: '/request/success',
  REQUESTS: '/requests',
  REQUEST_DETAIL: (id: string) => `/requests/${id}`,
  POINTS: '/points',
  REWARDS: '/rewards',
  REWARD_DETAIL: (id: string) => `/rewards/${id}`,
  MY_VOUCHERS: '/rewards/my-vouchers',
  DASHBOARD: '/dashboard',
  DASHBOARD_PROFILE: '/dashboard/profile',
  ADMIN: '/admin',
  UNAUTHORIZED: '/unauthorized',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.REWARDS,
  ROUTES.UNAUTHORIZED,
  '/rewards(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/api/health',
];

export const PROTECTED_ROUTES = [
  '/dashboard(.*)',
  '/admin(.*)',
  '/request(.*)',
  '/requests(.*)',
  '/points(.*)',
  '/rewards/my-vouchers(.*)',
];

export const ADMIN_ROUTES = [
  '/admin(.*)',
];
