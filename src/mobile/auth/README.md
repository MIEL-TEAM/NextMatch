# Mobile Authentication Pages

This folder contains mobile-first versions of the authentication pages for the Miel dating app.

## Files

- `LoginPage.tsx` - Mobile-optimized login page
- `RegisterPage.tsx` - Mobile-optimized multi-step registration page

## Key Features

### Mobile-First Design
- Full-height scrollable containers
- Safe-area padding for notch/home indicator
- Centered content with max-width 420px
- Touch-friendly input heights (56px / 14 tailwind units)
- No horizontal overflow

### Preserved Functionality
- All validation logic from desktop versions
- Form submission and error handling
- Toast notifications
- Draft auto-save for registration (1 hour expiry)
- Multi-step registration flow with progress indicator
- Social login integration (Google, Facebook)

### Mobile-Specific Optimizations
- Keyboard-aware layout (no content obscured)
- Proper input types and autocomplete attributes
- Active state feedback (scale on button press)
- Smooth scroll to top on step navigation
- Responsive font sizes (4xl for headlines on mobile)
- Legal links at bottom with proper spacing

### Safe Area Support
Uses CSS environment variables for safe areas:
```css
paddingTop: "env(safe-area-inset-top)"
paddingBottom: "env(safe-area-inset-bottom)"
```

## Usage

These components are standalone and do not affect the desktop versions in `src/app/(auth)`.

To use in a mobile-specific route:
```tsx
import MobileLoginPage from "@/mobile/auth/LoginPage";
import MobileRegisterPage from "@/mobile/auth/RegisterPage";
```

## Dependencies

Reuses existing components:
- `UserDetailsForm` from `/src/app/(auth)/register/UserDetailsForm.tsx`
- `ProfileForm` from `/src/app/(auth)/register/ProfileForm.tsx`
- `PreferencesForm` from `/src/app/(auth)/register/PreferencesForm.tsx`
- `PhotoUploadForm` from `/src/app/(auth)/register/PhotoUploadForm.tsx`
- `SocialLogin` from `/src/app/(auth)/login/SocialLogin.tsx`

Reuses existing logic:
- Validation schemas from `@/lib/schemas/loginSchema` and `@/lib/schemas/registerSchema`
- Auth actions from `@/app/actions/authActions`
- Error handling from `@/lib/util`

## Notes

- No desktop code was modified or removed
- All existing form logic is preserved
- Mobile-specific styling does not affect desktop layouts
- Draft auto-save uses same localStorage key as desktop for continuity
