import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected route patterns
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/request(.*)',
  '/requests(.*)',
  '/points(.*)',
  '/rewards/history(.*)',
  '/rewards/my-vouchers(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Enforce authentication on protected routes
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes and Clerk auto-proxy
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
