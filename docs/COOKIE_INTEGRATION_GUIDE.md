# Cookie Consent System - Quick Integration Guide

## ✅ What's Been Implemented

### 1. Core System Files

- ✅ **Types**: `/src/types/cookies.ts` - All TypeScript types and constants
- ✅ **Utilities**: `/src/lib/cookies/cookieUtils.ts` - Cookie management functions
- ✅ **Copy**: `/src/lib/cookies/cookieCopy.ts` - Hebrew text content
- ✅ **Context**: `/src/contexts/CookieConsentContext.tsx` - React Context provider
- ✅ **API**: `/src/app/api/cookies/route.ts` - Server-side endpoints

### 2. UI Components

- ✅ **Banner**: `/src/components/cookies/CookieConsentBanner.tsx`
- ✅ **Modal**: `/src/components/cookies/CookiePreferencesModal.tsx`
- ✅ **Manager**: `/src/components/cookies/CookieConsentManager.tsx`
- ✅ **Index**: `/src/components/cookies/index.ts` - Main exports

### 3. Integration

- ✅ **Layout**: Cookie system integrated in `/src/app/layout.tsx`
- ✅ **Footer**: "Manage Cookies" link added to `/src/components/FooterMainPage.tsx`

### 4. Helper Tools

- ✅ **Hooks**: `/src/hooks/useConditionalScript.ts` - Conditional script loading
- ✅ **Analytics Example**: `/src/components/analytics/AnalyticsWrapper.tsx`
- ✅ **Marketing Example**: `/src/components/marketing/MarketingWrapper.tsx`

### 5. Documentation

- ✅ **Main Docs**: `/docs/cookie-consent-system.md` - Complete documentation
- ✅ **This Guide**: Quick reference for integration

---

## 🚀 How to Use

### Basic Usage (Already Working!)

The system is already integrated and will show a cookie banner on first visit. Users can:
1. Click "Accept All" to enable all cookies
2. Click "Manage Preferences" to customize settings
3. Click "Manage Cookies" in the footer to change preferences later

### Adding Analytics (Optional)

1. **Add your Google Analytics ID to `.env.local`:**
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. **Import and use the Analytics Wrapper in your layout:**
   ```tsx
   // In src/app/layout.tsx (add to body)
   import { AnalyticsWrapper } from '@/components/analytics/AnalyticsWrapper';
   
   <CookieConsentProvider initialPreferences={cookieConsent}>
     <AnalyticsWrapper />
     {children}
     <CookieConsentManager />
   </CookieConsentProvider>
   ```

3. **Track custom events anywhere:**
   ```tsx
   import { trackEvent } from '@/components/analytics/AnalyticsWrapper';
   
   // In your component
   trackEvent('button_click', { button_name: 'sign_up' });
   ```

### Adding Marketing Pixels (Optional)

1. **Add your pixel IDs to `.env.local`:**
   ```env
   NEXT_PUBLIC_FB_PIXEL_ID=123456789
   NEXT_PUBLIC_TIKTOK_PIXEL_ID=ABC123XYZ
   ```

2. **Import and use the Marketing Wrapper:**
   ```tsx
   // In src/app/layout.tsx (add to body)
   import { MarketingWrapper } from '@/components/marketing/MarketingWrapper';
   
   <CookieConsentProvider initialPreferences={cookieConsent}>
     <AnalyticsWrapper />
     <MarketingWrapper />
     {children}
     <CookieConsentManager />
   </CookieConsentProvider>
   ```

---

## 🔧 Customization

### Change Text/Copy

Edit `/src/lib/cookies/cookieCopy.ts`:

```typescript
export const cookieConsentCopy = {
  banner: {
    title: 'Your new title here',
    description: 'Your new description',
    // ...
  },
};
```

### Change Colors

The system uses Miel's design tokens. To customize:

1. **Banner** - Edit `/src/components/cookies/CookieConsentBanner.tsx`:
   ```tsx
   // Change orange to your color
   className="bg-gradient-to-r from-orange-500 to-orange-600"
   ```

2. **Modal** - Edit `/src/components/cookies/CookiePreferencesModal.tsx`:
   ```tsx
   // Customize button styles
   className="bg-orange-500 hover:bg-orange-600"
   ```

### Add More Cookie Categories

1. Update types in `/src/types/cookies.ts`:
   ```typescript
   export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';
   
   export interface CookiePreferences {
     necessary: boolean;
     analytics: boolean;
     marketing: boolean;
     preferences: boolean; // New category
     // ...
   }
   ```

2. Add copy in `/src/lib/cookies/cookieCopy.ts`:
   ```typescript
   preferences: {
     title: 'עוגיות העדפות',
     description: 'תיאור העדפות...',
     toggle: 'אישור עוגיות העדפות',
   },
   ```

3. Add to modal categories in `/src/components/cookies/CookiePreferencesModal.tsx`

---

## 🧪 Testing

### Test the Banner

1. Open the app in an incognito/private window
2. You should see the cookie banner at the bottom
3. Test both "Accept All" and "Manage Preferences" buttons

### Test the Modal

1. Click "Manage Preferences" from the banner
2. Toggle different categories on/off
3. Click "Save Preferences"
4. Verify toast notification appears

### Test Footer Link

1. Accept or reject cookies
2. Scroll to footer
3. Click "ניהול עוגיות" (Manage Cookies)
4. Modal should open

### Verify Storage

1. Open DevTools → Application → Cookies
2. Look for `miel_cookie_consent` cookie
3. Check it contains JSON with your preferences
4. Also check localStorage as fallback

---

## 📝 API Endpoints

The system provides REST endpoints:

### Get Preferences
```bash
GET /api/cookies
```

### Update Preferences
```bash
POST /api/cookies
Content-Type: application/json

{
  "analytics": true,
  "marketing": false
}
```

### Clear Preferences
```bash
DELETE /api/cookies
```

---

## 🎯 Using in Your Components

### Check if User Consented

```tsx
'use client';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

function MyComponent() {
  const { hasConsented, preferences } = useCookieConsent();
  
  if (!hasConsented) {
    return <div>Please accept cookies to continue</div>;
  }
  
  return <div>Welcome!</div>;
}
```

### Check Specific Category

```tsx
'use client';
import { useHasConsent } from '@/contexts/CookieConsentContext';

function AnalyticsComponent() {
  const canUseAnalytics = useHasConsent('analytics');
  
  if (!canUseAnalytics) {
    return null;
  }
  
  return <AnalyticsDashboard />;
}
```

### Open Modal Programmatically

```tsx
'use client';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

function SettingsPage() {
  const { openPreferencesModal } = useCookieConsent();
  
  return (
    <button onClick={openPreferencesModal}>
      Cookie Settings
    </button>
  );
}
```

### Server-Side Check

```tsx
import { getServerConsentCookie, hasConsent } from '@/lib/cookies/cookieUtils';

export default async function Page() {
  const preferences = await getServerConsentCookie();
  const canTrack = hasConsent(preferences, 'analytics');
  
  return (
    <div>
      {canTrack ? 'Tracking enabled' : 'Tracking disabled'}
    </div>
  );
}
```

---

## 🎨 Design System Match

The cookie consent system uses:

- **Colors**: Orange (`#F97316`) from Miel's theme
- **Fonts**: Reddit Sans and Rubik (from Miel's config)
- **Components**: NextUI Card, Button, Switch
- **Animations**: Framer Motion (smooth, modern)
- **Layout**: RTL (Hebrew), responsive, mobile-first

---

## ⚠️ Important Notes

1. **SSR Support**: The system works with server-side rendering
2. **No Flash**: Initial preferences loaded server-side to prevent flash
3. **localStorage Fallback**: Used if cookies are blocked
4. **Version Control**: Cookie version tracks policy updates
5. **Clean State**: Old versions auto-invalidated

---

## 🐛 Troubleshooting

### Banner Not Showing
- Clear cookies and localStorage
- Check in incognito mode
- Verify `CookieConsentManager` is in layout

### Preferences Not Saving
- Check browser console for errors
- Verify cookie is not blocked
- Check localStorage as fallback

### Modal Not Opening
- Ensure component is wrapped in `CookieConsentProvider`
- Check for JavaScript errors
- Verify import paths

### Scripts Not Loading
- Check consent is granted for that category
- Verify environment variables are set
- Check browser console for script errors

---

## 📞 Need Help?

See the full documentation at `/docs/cookie-consent-system.md` or contact the development team.

---

## ✨ Features Summary

✅ GDPR compliant consent management  
✅ Beautiful, animated UI matching Miel's design  
✅ Hebrew RTL support  
✅ Server-side rendering compatible  
✅ Type-safe TypeScript implementation  
✅ Secure cookie storage  
✅ Granular category control  
✅ Analytics & marketing integration examples  
✅ Footer management link  
✅ API endpoints for programmatic access  
✅ Comprehensive documentation  

**The system is production-ready and fully integrated! 🎉**

