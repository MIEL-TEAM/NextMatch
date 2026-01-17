# Mobile Routes

This directory contains mobile-optimized routes for the Miel dating app.

## Structure

```
/mobile
├── login/page.tsx         # Mobile login route (/mobile/login)
├── register/page.tsx      # Mobile register route (/mobile/register)
└── layout.tsx            # Mobile-specific layout (clean, no nav)
```

## Routes

### `/mobile/login`
- Renders `MobileLoginPage` from `@/mobile/auth`
- Full-screen mobile-optimized login form
- No desktop navigation or sidebars
- Safe-area padding for notch/home indicator

### `/mobile/register`
- Renders `MobileRegisterPage` from `@/mobile/auth`
- Multi-step mobile-optimized registration
- Progress indicator and smooth scrolling
- Draft auto-save functionality

## Layout

The `layout.tsx` provides a clean wrapper that:
- Removes the standard `MielLayout` wrapper
- Allows mobile pages to control their own full-screen layout
- No interference with mobile-specific styling

## Device Detection

Use the utilities in `@/lib/deviceDetection` to:
- Detect mobile user agents (server-side)
- Check viewport size (client-side)
- Auto-redirect users based on device

### Example: Auto-redirect from desktop to mobile

```tsx
// In src/app/(auth)/login/page.tsx
import DeviceRedirect from "@/components/auth/DeviceRedirect";

export default function LoginPage() {
  return (
    <>
      <DeviceRedirect enabled={true} />
      <LoginForm />
    </>
  );
}
```

### Example: Manual routing based on device

```tsx
// In any component
import { isMobileViewport } from "@/lib/deviceDetection";

const isMobile = isMobileViewport();
const loginRoute = isMobile ? "/mobile/login" : "/login";
```

## Navigation

Users can navigate to mobile routes:
1. **Direct URL**: Visit `/mobile/login` or `/mobile/register`
2. **Auto-redirect**: Add `<DeviceRedirect enabled={true} />` to desktop pages
3. **Manual links**: Update navigation to conditionally link to mobile routes

## Testing

### Desktop Browser
- Visit `/login` or `/register` (desktop version)
- Visit `/mobile/login` or `/mobile/register` (mobile version)

### Mobile Device
- Visit `/mobile/login` or `/mobile/register`
- Or enable auto-redirect for seamless mobile experience

### Responsive Testing
```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone, Pixel, etc.)
4. Visit /mobile/login or /mobile/register
```

## Features Preserved

✅ All validation logic (Zod schemas)
✅ Form submission and error handling
✅ Toast notifications
✅ Social login (Google, Facebook)
✅ Draft auto-save (registration)
✅ Multi-step navigation (registration)
✅ Router redirects on success

## Notes

- Desktop routes (`/login`, `/register`) remain untouched
- Mobile routes are completely separate
- No shared state between mobile and desktop routes (except localStorage draft)
- Safe-area CSS variables work automatically on supported devices
