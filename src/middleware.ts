// Fixed middleware.ts - Admin isolation + optimized redirects
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

  // 🔥 PERFORMANCE FIX: Add pathname to headers for server components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);

  // ✅ ADMIN ISOLATION: Redirect admins to admin panel ONLY
  if (isAdmin) {
    if (isAdminRoute) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
    // ❌ Block admin from accessing user routes
    if (!isPublic && !isAuthRoutes) {
      return NextResponse.redirect(new URL("/admin", nextUrl), { status: 303 });
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ✅ Block non-admins from admin routes
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Early return for public routes
  if (isPublic) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Handle auth routes
  if (isAuthRoutes) {
    if (isLoggedIn) {
      // Redirect to members (non-admins only reach here)
      const membersUrl = new URL("/members", nextUrl);
      if (nextUrl.searchParams.toString()) {
        membersUrl.search = nextUrl.searchParams.toString();
      }
      return NextResponse.redirect(membersUrl, { status: 303 });
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
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

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt|manifest.json|browserconfig.xml).*)",
  ],
};
