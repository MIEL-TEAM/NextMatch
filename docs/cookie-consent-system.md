# Cookie Consent System - Miel Dating App

A professional, fully-featured cookie consent system built with Next.js, TypeScript, and Framer Motion, designed specifically for Miel's high-end, modern UX.

## 🎯 Features

- ✅ **Professional UI/UX** - Matches Miel's design system with smooth animations
- ✅ **GDPR Compliant** - Proper consent management for EU regulations
- ✅ **Hebrew RTL Support** - Native right-to-left layout and text
- ✅ **SSR Compatible** - Server-side rendering support for Next.js
- ✅ **Type-Safe** - Full TypeScript implementation
- ✅ **Secure Storage** - HTTPOnly-false, Secure, SameSite=Strict cookies
- ✅ **Granular Control** - Manage necessary, analytics, and marketing cookies
- ✅ **Responsive Design** - Mobile and desktop optimized
- ✅ **Smooth Animations** - Framer Motion powered transitions
- ✅ **localStorage Fallback** - Redundancy if cookies are blocked

## 📂 File Structure

```
src/
├── types/
│   └── cookies.ts                          # TypeScript types and constants
├── lib/
│   └── cookies/
│       ├── cookieUtils.ts                   # Cookie utility functions
│       └── cookieCopy.ts                    # Hebrew copy text
├── contexts/
│   └── CookieConsentContext.tsx             # React Context provider
├── components/
│   └── cookies/
│       ├── CookieConsentBanner.tsx          # Main banner component
│       ├── CookiePreferencesModal.tsx       # Preferences modal
│       ├── CookieConsentManager.tsx         # Manager wrapper
│       └── index.ts                         # Exports
├── hooks/
│   └── useConditionalScript.ts              # Conditional script loading
└── app/
    └── api/
        └── cookies/
            └── route.ts                     # API endpoints
```

## 🚀 Usage

### Basic Setup (Already Integrated)

The cookie consent system is already integrated into `layout.tsx`:

```tsx
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import { CookieConsentManager } from '@/components/cookies';
import { getServerConsentCookie } from '@/lib/cookies/cookieUtils';

export default async function RootLayout({ children }) {
  const cookieConsent = await getServerConsentCookie();
  
  return (
    <html>
      <body>
        <CookieConsentProvider initialPreferences={cookieConsent}>
          {children}
          <CookieConsentManager />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
```

### Using Cookie Consent in Components

```tsx
'use client';

import { useCookieConsent, useHasConsent } from '@/components/cookies';

function MyComponent() {
  const { 
    preferences, 
    hasConsented, 
    acceptAll, 
    rejectAll,
    openPreferencesModal 
  } = useCookieConsent();
  
  const canUseAnalytics = useHasConsent('analytics');
  
  return (
    <div>
      {hasConsented ? 'User has made a choice' : 'No consent yet'}
      {canUseAnalytics && <AnalyticsComponent />}
      <button onClick={openPreferencesModal}>Manage Cookies</button>
    </div>
  );
}
```

### Conditional Script Loading

```tsx
'use client';

import { useConditionalScript, useAnalytics } from '@/hooks/useConditionalScript';

function Analytics() {
  // Automatically loads only if user consented to analytics
  useAnalytics('GA_MEASUREMENT_ID');
  
  // Or load custom scripts
  useConditionalScript({
    id: 'custom-analytics',
    src: 'https://example.com/analytics.js',
    category: 'analytics',
    async: true,
  });
  
  return null;
}
```

### Server-Side Usage

```tsx
import { getServerConsentCookie, hasConsent } from '@/lib/cookies/cookieUtils';

export async function MyServerComponent() {
  const preferences = await getServerConsentCookie();
  const canTrack = hasConsent(preferences, 'analytics');
  
  return (
    <div>
      {canTrack && <ServerAnalytics />}
    </div>
  );
}
```

## 🎨 Customization

### Update Copy/Text

Edit `/src/lib/cookies/cookieCopy.ts` to change Hebrew text:

```typescript
export const cookieConsentCopy = {
  banner: {
    title: 'Your custom title',
    description: 'Your custom description',
    // ...
  },
  // ...
};
```

### Styling

The components use Tailwind CSS and NextUI. Modify the class names in:
- `CookieConsentBanner.tsx` - Banner styling
- `CookiePreferencesModal.tsx` - Modal styling

### Add New Cookie Categories

1. Update `CookieCategory` type in `types/cookies.ts`
2. Add to `CookiePreferences` interface
3. Update modal categories in `CookiePreferencesModal.tsx`
4. Update copy in `cookieCopy.ts`

## 🔒 Security

- **Secure Flag**: Enabled in production (HTTPS)
- **SameSite**: Strict
- **HTTPOnly**: False (allows client-side reading)
- **Max-Age**: 1 year (365 days)
- **Version Control**: Automatic invalidation on policy updates

## 📱 Responsive Design

- **Mobile**: Full-width banner, stacked buttons
- **Tablet**: Optimized layout
- **Desktop**: Side-by-side buttons, wider modal

## 🎭 Animations

Built with Framer Motion:
- **Banner**: Slide up with spring physics
- **Modal**: Scale and fade with backdrop blur
- **Category Cards**: Staggered entrance animations
- **Buttons**: Hover effects and scale transforms

## 🔌 API Endpoints

### GET `/api/cookies`
Retrieve current cookie preferences

```bash
curl https://miel-love.com/api/cookies
```

### POST `/api/cookies`
Update cookie preferences

```bash
curl -X POST https://miel-love.com/api/cookies \
  -H "Content-Type: application/json" \
  -d '{"analytics": true, "marketing": false}'
```

### DELETE `/api/cookies`
Clear cookie preferences

```bash
curl -X DELETE https://miel-love.com/api/cookies
```

## 🧪 Testing

### Test Scenarios

1. **First Visit**: Banner should appear
2. **Accept All**: All categories should be enabled
3. **Reject All**: Only necessary cookies enabled
4. **Custom Preferences**: Save specific choices
5. **Page Reload**: Preferences should persist
6. **Footer Link**: Open modal from footer
7. **Modal Close**: Should not save if closed without action
8. **localStorage Fallback**: Works if cookies blocked

### Manual Testing

1. Clear browser cookies
2. Visit the site
3. Banner should appear
4. Test each action (Accept, Reject, Manage)
5. Check browser DevTools > Application > Cookies
6. Verify `miel_cookie_consent` cookie exists

## 📊 Analytics Integration Example

```tsx
// In your layout or analytics component
'use client';

import { useEffect } from 'react';
import { useHasConsent } from '@/components/cookies';

export function AnalyticsWrapper() {
  const hasAnalyticsConsent = useHasConsent('analytics');
  
  useEffect(() => {
    if (hasAnalyticsConsent) {
      // Initialize your analytics
      console.log('Analytics initialized');
      
      // Example: Google Analytics
      // window.gtag('config', 'GA_MEASUREMENT_ID');
    }
  }, [hasAnalyticsConsent]);
  
  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = (event: CustomEvent) => {
      console.log('Consent changed:', event.detail);
    };
    
    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    };
  }, []);
  
  return null;
}
```

## 🌐 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Notes

- The banner appears on first visit only
- Users can change preferences anytime via footer
- Preferences are stored for 1 year
- Server-side rendering respects consent state
- All components are client-side rendered (`'use client'`)

## 🎯 Future Enhancements

- [ ] Cookie categories audit log
- [ ] A/B testing integration
- [ ] Multi-language support (currently Hebrew only)
- [ ] Admin dashboard for consent analytics
- [ ] Consent rate tracking
- [ ] Cookie scanning tool

## 💡 Best Practices

1. **Always check consent** before loading third-party scripts
2. **Use conditional rendering** for analytics components
3. **Listen to consent changes** via `cookieConsentChanged` event
4. **Test in incognito** to simulate first-time visitors
5. **Update version** in `types/cookies.ts` when policy changes

## 🤝 Contributing

When making changes:
1. Update TypeScript types first
2. Test in both SSR and client-side contexts
3. Verify RTL layout in Hebrew
4. Check mobile responsive design
5. Run linter and fix any errors

## 📞 Support

For issues or questions about the cookie consent system, contact the Miel development team.

---

Built with ❤️ for Miel Dating App

