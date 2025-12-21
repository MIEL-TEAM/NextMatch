# Google One Tap Not Working in Production - Troubleshooting Guide

## Common Issues & Solutions

### 1. ❌ Missing Environment Variable

**Problem**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is not set in production

**Check**:

```javascript
// In GoogleOneTap.tsx line 26-30
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
if (!clientId) {
  console.warn("Google Client ID not found for One Tap");
  return;
}
```

**Solution**:

- Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in your production environment (Vercel/Netlify/etc.)
- **Important**: Must start with `NEXT_PUBLIC_` to be accessible in the browser
- Check: Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = your Google Client ID

---

### 2. ❌ Authorized JavaScript Origins Not Configured

**Problem**: Google Cloud Console doesn't have your production domain whitelisted

**Solution**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: **APIs & Services → Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   ```
   https://miel-love.com
   https://www.miel-love.com
   ```
6. Under **Authorized redirect URIs**, add:
   ```
   https://miel-love.com/api/auth/callback/google
   https://www.miel-love.com/api/auth/callback/google
   ```
7. Click **Save**

---

### 3. ❌ Cookie Consent Blocking Script Loading

**Problem**: The Google script is loaded before cookie consent is given

**Current Setup**: The script is loaded in `layout.tsx`:

```tsx
<script src="https://accounts.google.com/gsi/client" async defer />
```

**This is OK** because Google One Tap is an authentication feature, not tracking, so it doesn't need cookie consent. However, if you want to be extra compliant, you can:

**Solution**: Keep as is (authentication doesn't require cookie consent) OR add conditional loading

---

### 4. ❌ Script Loading Race Condition

**Problem**: The component tries to use `window.google` before the script is loaded

**Current Code**:

```javascript
if (!window.google) {
  const handleScriptLoad = () => initGoogleOneTap(clientId);
  window.addEventListener("google-loaded", handleScriptLoad, {
    once: true,
  });
  return;
}
```

**Issue**: The event `"google-loaded"` is never fired because there's no code that fires it!

**Solution**: Add the onload handler to the script in layout.tsx:

```tsx
// Replace this in src/app/layout.tsx:
<script src="https://accounts.google.com/gsi/client" async defer />

// With this:
<script
  src="https://accounts.google.com/gsi/client"
  async
  defer
  onLoad={() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('google-loaded'));
    }
  }}
/>
```

**Better Solution**: Use a proper script component

---

### 5. ❌ HTTPS Required

**Problem**: Google One Tap only works on HTTPS domains (not HTTP)

**Check**:

- Production must use HTTPS
- Localhost works on HTTP for development
- If using custom domain, ensure SSL certificate is properly configured

---

### 6. ❌ Third-Party Cookies Blocked

**Problem**: Users have third-party cookies blocked in their browser

**Symptoms**:

- Google One Tap prompt doesn't appear
- Works in incognito/private mode
- No console errors

**Solutions**:

- This is a browser setting issue, not a code issue
- Google One Tap requires third-party cookies
- Provide alternative sign-in button for users with blocked cookies

---

## ✅ Recommended Fix for Miel

Let me provide you with an improved implementation:

### Step 1: Update GoogleOneTap.tsx

Replace the script loading logic with a more robust solution:

```tsx
"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
            auto_select?: boolean;
          }) => void;
          prompt: (
            notification?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void
          ) => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("Google Client ID not found for One Tap");
      return;
    }

    // Check if user already has a session
    const hasSession =
      document.cookie.includes("next-auth.session-token") ||
      document.cookie.includes("__Secure-next-auth.session-token");

    if (hasSession) return;

    // Wait for Google script to load
    const initGoogleOneTap = () => {
      if (!window.google?.accounts?.id) {
        console.warn("Google script not loaded");
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              await signIn("google", {
                id_token: credential,
                redirect: true,
                callbackUrl: "/members",
              });
            } catch (err) {
              console.error("Google One Tap sign-in error:", err);
            }
          },
          cancel_on_tap_outside: false,
          auto_select: false,
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.warn("Google One Tap not displayed:", notification);
          }
          if (notification.isSkippedMoment()) {
            console.log("User closed Google One Tap");
          }
        });
      } catch (err) {
        console.error("Failed to initialize Google One Tap:", err);
      }
    };

    // Check if script is already loaded
    if (window.google?.accounts?.id) {
      initGoogleOneTap();
    } else {
      // Wait for script to load (with timeout)
      const checkGoogleLoaded = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogleLoaded);
          initGoogleOneTap();
        }
      }, 100);

      // Clear interval after 10 seconds
      setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
    }
  }, []);

  return null;
}
```

### Step 2: Keep layout.tsx script as is

The current implementation is fine:

```tsx
<script src="https://accounts.google.com/gsi/client" async defer />
```

---

## 🔍 Debugging Checklist

Run these checks in production:

### 1. Check Environment Variable

```javascript
// Open browser console on production site
console.log("Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
// Should NOT be undefined
```

### 2. Check Script Loading

```javascript
// In browser console
console.log("Google loaded:", !!window.google);
console.log("Google accounts:", !!window.google?.accounts?.id);
```

### 3. Check Console Errors

- Open DevTools → Console
- Look for any Google-related errors
- Common errors:
  - "idpiframe_initialization_failed"
  - "popup_closed_by_user"
  - "access_denied"

### 4. Check Network Tab

- Open DevTools → Network
- Filter: "google"
- Look for `accounts.google.com/gsi/client` - should load successfully (200 OK)

### 5. Test Cookie Access

```javascript
// In browser console
document.cookie.split(";").forEach((c) => console.log(c.trim()));
```

---

## 🚀 Quick Production Fix Commands

### For Vercel:

```bash
# Add environment variable
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID production

# Redeploy
vercel --prod
```

### For other platforms:

Add the environment variable in your deployment platform's dashboard and redeploy.

---

## ⚠️ Important Notes

1. **Client ID vs Client Secret**:

   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Used in browser (public)
   - `GOOGLE_CLIENT_SECRET` - Used server-side only (private)

2. **Same Client ID for both**:

   - `GOOGLE_CLIENT_ID` = Same value
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Same value

3. **Production Domain**:
   - Must be whitelisted in Google Cloud Console
   - Must use HTTPS
   - www and non-www should both be added

---

Would you like me to:

1. ✅ Implement the improved GoogleOneTap.tsx
2. ✅ Add better error logging
3. ✅ Create a fallback UI for when One Tap fails
