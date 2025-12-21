"use client";

import { useEffect } from "react";
import { useHasConsent } from "@/contexts/CookieConsentContext";

export function MarketingWrapper() {
  const hasMarketingConsent = useHasConsent("marketing");

  useEffect(() => {
    if (!hasMarketingConsent) {
      console.log("Marketing consent not granted");
      return;
    }

    const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

    if (!FB_PIXEL_ID) {
      console.warn("FB_PIXEL_ID not configured");
      return;
    }

    // Initialize Facebook Pixel
    const fbPixelScript = document.createElement("script");
    fbPixelScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${FB_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(fbPixelScript);

    // NoScript fallback
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1"/>
    `;
    document.body.appendChild(noscript);

    console.log("Facebook Pixel initialized with consent");

    return () => {
      // Cleanup
      const scripts = document.querySelectorAll("script");
      scripts.forEach((script) => {
        if (script.innerHTML.includes("fbq")) {
          script.remove();
        }
      });
    };
  }, [hasMarketingConsent]);

  // TikTok Pixel
  useEffect(() => {
    if (!hasMarketingConsent) return;

    const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

    if (!TIKTOK_PIXEL_ID) {
      console.warn("TIKTOK_PIXEL_ID not configured");
      return;
    }

    // Initialize TikTok Pixel
    const ttPixelScript = document.createElement("script");
    ttPixelScript.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${TIKTOK_PIXEL_ID}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(ttPixelScript);

    console.log("TikTok Pixel initialized with consent");

    return () => {
      // Cleanup
      const scripts = document.querySelectorAll("script");
      scripts.forEach((script) => {
        if (script.innerHTML.includes("TiktokAnalyticsObject")) {
          script.remove();
        }
      });
    };
  }, [hasMarketingConsent]);

  return null;
}

export function trackFBEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

export function trackTTEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(eventName, params);
  }
}

// TypeScript declarations
declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
    _fbq?: unknown;
    ttq?: {
      track: (eventName: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}
