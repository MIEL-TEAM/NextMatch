// Fixed middleware.ts - Optimized for fewer redirects
import { NextResponse } from "next/server";
import { auth } from "./auth";
import { authRoutes, publicRoutes } from "./routes";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublic = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoutes = authRoutes.includes(nextUrl.pathname);
  const isProfileComplete = req.auth?.user.profileComplete;
  const isAdmin = req.auth?.user.role === "ADMIN";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Early returns for performance
  if (isPublic || isAdmin) {
    return NextResponse.next();
  }

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Handle auth routes
  if (isAuthRoutes) {
    if (isLoggedIn) {
      // ✅ Redirect to members with preserved search params if any
      const membersUrl = new URL("/members", nextUrl);
      if (nextUrl.searchParams.toString()) {
        membersUrl.search = nextUrl.searchParams.toString();
      }
      return NextResponse.redirect(membersUrl);
    }
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Handle incomplete profiles
  if (
    isLoggedIn &&
    !isProfileComplete &&
    nextUrl.pathname !== "/complete-profile"
  ) {
    return NextResponse.redirect(new URL("/complete-profile", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt|manifest.json|browserconfig.xml).*)",
  ],
};
