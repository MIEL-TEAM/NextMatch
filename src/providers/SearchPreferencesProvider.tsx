/**
 * 🌊 SearchPreferencesProvider
 * 
 * Root-level component that hydrates search preferences store on app mount.
 * 
 * Usage:
 * Wrap your app layout with this provider:
 * 
 * <SearchPreferencesProvider>
 *   <YourApp />
 * </SearchPreferencesProvider>
 * 
 * This ensures:
 * - Preferences are loaded from DB on user login
 * - Store is reset on user logout
 * - Preferences persist across page navigation
 * - Preferences persist across browser reload
 */

"use client";

import { ReactNode } from "react";
import { useSearchPreferencesHydration } from "@/hooks/useSearchPreferencesHydration";

interface SearchPreferencesProviderProps {
  children: ReactNode;
}

export function SearchPreferencesProvider({
  children,
}: SearchPreferencesProviderProps) {
  // This hook handles all hydration logic
  useSearchPreferencesHydration();

  // Provider just wraps children - hydration happens via hook
  return <>{children}</>;
}
