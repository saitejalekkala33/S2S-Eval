import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes, including sign-in, sign-up, and the root (landing) page
const isPublicRoute = createRouteMatcher(['/sign-in(.)', '/sign-up(.)']);

export default clerkMiddleware((auth, request) => {
  console.log(request.nextUrl.pathname);
  if (!isPublicRoute(request)) {
    // Protect non-public routes
    // auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};