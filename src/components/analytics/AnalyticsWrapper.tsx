/**
 * Analytics Integration Example
 * Shows how to conditionally load analytics based on cookie consent
 */

'use client';

import { useEffect } from 'react';
import { useHasConsent } from '@/contexts/CookieConsentContext';

/**
 * Analytics Wrapper Component
 * Place this in your root layout to initialize analytics based on consent
 * 
 * Usage in layout.tsx:
 * ```tsx
 * import { AnalyticsWrapper } from '@/components/analytics/AnalyticsWrapper';
 * 
 * <CookieConsentProvider>
 *   <AnalyticsWrapper />
 *   {children}
 * </CookieConsentProvider>
 * ```
 */
export function AnalyticsWrapper() {
  const hasAnalyticsConsent = useHasConsent('analytics');

  useEffect(() => {
    if (!hasAnalyticsConsent) {
      console.log('Analytics consent not granted');
      return;
    }

    // Initialize Google Analytics
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    
    if (!GA_MEASUREMENT_ID) {
      console.warn('GA_MEASUREMENT_ID not configured');
      return;
    }

    // Load gtag.js script
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gtagScript);

    // Initialize dataLayer
    const gtagConfigScript = document.createElement('script');
    gtagConfigScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_path: window.location.pathname,
        anonymize_ip: true,
      });
    `;
    document.head.appendChild(gtagConfigScript);

    console.log('Analytics initialized with consent');

    // Cleanup function
    return () => {
      // Remove scripts when consent is withdrawn
      const scripts = document.querySelectorAll('script[src*="googletagmanager"]');
      scripts.forEach(script => script.remove());
    };
  }, [hasAnalyticsConsent]);

  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = (event: CustomEvent) => {
      const preferences = event.detail;
      
      if (preferences.analytics) {
        console.log('Analytics consent granted - reloading page recommended');
        // Optionally reload to ensure clean state
        // window.location.reload();
      } else {
        console.log('Analytics consent withdrawn - cleaning up');
        // Clean up analytics cookies
        document.cookie.split(";").forEach(function(c) { 
          if (c.includes('_ga') || c.includes('_gid')) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          }
        });
      }
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    };
  }, []);

  return null;
}

/**
 * Track Page View
 * Call this function to track page views (e.g., in route changes)
 */
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
    });
  }
}

/**
 * Track Custom Event
 * Call this function to track custom events
 */
export function trackEvent(eventName: string, eventParams?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

