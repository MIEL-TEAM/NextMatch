import { NextResponse } from "next/server";
import { auth } from "./auth";
import {
  publicRoutes,
  unauthOnlyRoutes,
  registerSuccessRoutes,
  authActionRoutes,
} from "./routes";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const isAdmin = user?.role === "ADMIN";
  const isAdminRoute = pathname.startsWith("/admin");

  /* =========================
     ADMIN ISOLATION
  ========================= */
  if (isAdmin) {
    if (isAdminRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin", nextUrl), { status: 303 });
  }

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl), { status: 303 });
  }

  /* =========================
     PUBLIC ROUTES
  ========================= */
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  /* =========================
     AUTH ACTION ROUTES
     (Handled internally)
  ========================= */
  if (authActionRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  /* =========================
     AUTH REQUIRED
  ========================= */
  if (!isLoggedIn) {
    // Allow unauth users only on specific routes
    if (unauthOnlyRoutes.includes(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", nextUrl), { status: 303 });
  }

  /* =========================
     PROFILE COMPLETION ENFORCEMENT
  ========================= */
  // Allow authenticated users to access complete-profile
  if (isLoggedIn && pathname === "/complete-profile") {
    return NextResponse.next();
  }

  // If user is authenticated but profile not complete, enforce completion
  if (
    isLoggedIn &&
    !user?.profileComplete &&
    pathname !== "/complete-profile" &&
    !publicRoutes.includes(pathname) &&
    !authActionRoutes.includes(pathname)
  ) {
    return NextResponse.redirect(new URL("/complete-profile", nextUrl), {
      status: 303,
    });
  }

  /* =========================
     AUTHENTICATED USER ROUTES
     Logged-in users should not access auth pages
  ========================= */
  if (unauthOnlyRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/members", nextUrl), {
      status: 303,
    });
  }

  if (registerSuccessRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/members", nextUrl), {
      status: 303,
    });
  }

  // All other routes: allow access
  // Onboarding enforcement happens in Server Components
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt|manifest.json|browserconfig.xml).*)",
  ],
};
