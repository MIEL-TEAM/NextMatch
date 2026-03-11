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

  // Public & auth action routes - always allow
  if (publicRoutes.includes(pathname) || authActionRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 1. Admin Logic
  if (isAdmin) {
    if (isAdminRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // 2. Non-Admin trying to access Admin routes
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 3. Handle unauthenticated users
  if (!isLoggedIn) {
    const allowedRoutes = [
      ...unauthOnlyRoutes,
      ...registerSuccessRoutes,
    ];
    return allowedRoutes.includes(pathname)
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 4. Handle authenticated users (block login/register pages)
  const blockedRoutes = [
    ...unauthOnlyRoutes,
    ...registerSuccessRoutes,
  ];
  if (blockedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/members", nextUrl));
  }

  // 5. Profile completion check
  if (!user?.profileComplete && pathname !== "/complete-profile") {
    return NextResponse.redirect(new URL("/complete-profile", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt|manifest.json|browserconfig.xml).*)",
  ],
  runtime: "nodejs",
};
