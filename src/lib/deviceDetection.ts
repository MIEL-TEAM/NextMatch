export function isMobileUserAgent(userAgent: string): boolean {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}

export function isTabletUserAgent(userAgent: string): boolean {
  const tabletRegex = /iPad|Android(?!.*Mobile)/i;
  return tabletRegex.test(userAgent);
}

export function getDeviceType(
  userAgent: string
): "mobile" | "tablet" | "desktop" {
  if (isTabletUserAgent(userAgent)) return "tablet";
  if (isMobileUserAgent(userAgent)) return "mobile";
  return "desktop";
}

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - legacy API
    navigator.msMaxTouchPoints > 0
  );
}

export function getMobileAuthRedirect(currentPath: string): string | null {
  const mobileRoutes: Record<string, string> = {
    "/login": "/mobile/login",
    "/register": "/mobile/register",
  };

  return mobileRoutes[currentPath] || null;
}

export function getDesktopAuthRedirect(currentPath: string): string | null {
  const desktopRoutes: Record<string, string> = {
    "/mobile/login": "/login",
    "/mobile/register": "/register",
  };

  return desktopRoutes[currentPath] || null;
}

export function getUserAgent(headers: Headers): string {
  return headers.get("user-agent") || "";
}

export function getDeviceAwarePath(
  basePath: string,
  isMobile?: boolean
): string {
  const isMobileDevice = isMobile ?? isMobileViewport();
  const pathsWithMobileVariants = ["login", "register"];
  const cleanPath = basePath.startsWith("/") ? basePath.slice(1) : basePath;
  if (pathsWithMobileVariants.includes(cleanPath)) {
    return isMobileDevice ? `/mobile/${cleanPath}` : `/${cleanPath}`;
  }

  return `/${cleanPath}`;
}
