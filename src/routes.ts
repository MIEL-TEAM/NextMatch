// True public content pages - accessible to everyone
export const publicRoutes = [
  "/",
  "/contact",
  "/privacy",
  "/terms",
  "/faq",
  "/safety-tips",
];

// Entry points - only meaningful for logged-out users
export const unauthOnlyRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const mobileRoutes = [
  "/mobile/login",
  "/mobile/register",
  "/mobile/register/success",
];

// UI-only step after registration (allowed without session)
export const registerSuccessRoutes = ["/register/success"];

// Routes that MUST handle auth internally (middleware should NOT block)
export const authActionRoutes = [
  "/verify-email",
  "/complete-profile", // Allow access for email-verified users without session
];

// Profile completion
export const profileRoutes = ["/complete-profile"];
