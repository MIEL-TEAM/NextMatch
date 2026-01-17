import type { ReactNode } from "react";

type MobileLayoutProps = {
  children: ReactNode;
};

/**
 * Mobile-specific layout for authentication pages
 * Removes the MielLayout wrapper and provides clean full-screen experience
 */
export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="mobile-auth-layout">
      {children}
    </div>
  );
}
