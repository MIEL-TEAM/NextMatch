/**
 * useConditionalScript Hook
 * Dynamically loads scripts based on cookie consent
 */

'use client';

import { useEffect } from 'react';
import { useHasConsent } from '@/contexts/CookieConsentContext';
import type { CookieCategory } from '@/types/cookies';

interface ScriptConfig {
  id: string;
  src: string;
  category: CookieCategory;
  async?: boolean;
  defer?: boolean;
  innerHTML?: string;
  onLoad?: () => void;
}

/**
 * Hook to conditionally load external scripts based on cookie consent
 * 
 * @example
 * ```tsx
 * // In your component:
 * useConditionalScript({
 *   id: 'google-analytics',
 *   src: 'https://www.googletagmanager.com/gtag/js?id=GA_ID',
 *   category: 'analytics',
 *   async: true,
 * });
 * ```
 */
export function useConditionalScript(config: ScriptConfig) {
  const hasConsent = useHasConsent(config.category);

  useEffect(() => {
    // Don't load if no consent
    if (!hasConsent) {
      return;
    }

    // Check if script already exists
    const existingScript = document.getElementById(config.id);
    if (existingScript) {
      return;
    }

    // Create and append script
    const script = document.createElement('script');
    script.id = config.id;
    
    if (config.src) {
      script.src = config.src;
    }
    
    if (config.async) {
      script.async = true;
    }
    
    if (config.defer) {
      script.defer = true;
    }
    
    if (config.innerHTML) {
      script.innerHTML = config.innerHTML;
    }
    
    if (config.onLoad) {
      script.onload = config.onLoad;
    }

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById(config.id);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [hasConsent, config]);
}

/**
 * Hook to initialize analytics only when consented
 * 
 * @example
 * ```tsx
 * useAnalytics('GA_MEASUREMENT_ID');
 * ```
 */
export function useAnalytics(measurementId: string) {
  const hasConsent = useHasConsent('analytics');

  useEffect(() => {
    if (!hasConsent) return;

    // Initialize Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [hasConsent, measurementId]);
}

/**
 * Hook to initialize marketing pixels only when consented
 * 
 * @example
 * ```tsx
 * useMarketingPixels();
 * ```
 */
export function useMarketingPixels() {
  const hasConsent = useHasConsent('marketing');

  useEffect(() => {
    if (!hasConsent) return;

    // Initialize Facebook Pixel, TikTok Pixel, etc.
    console.log('Marketing pixels initialized');

    // Example: Facebook Pixel
    // !function(f,b,e,v,n,t,s)
    // {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    // n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    // if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    // n.queue=[];t=b.createElement(e);t.async=!0;
    // t.src=v;s=b.getElementsByTagName(e)[0];
    // s.parentNode.insertBefore(t,s)}(window, document,'script',
    // 'https://connect.facebook.net/en_US/fbevents.js');
    // fbq('init', 'YOUR_PIXEL_ID');
    // fbq('track', 'PageView');
  }, [hasConsent]);
}

