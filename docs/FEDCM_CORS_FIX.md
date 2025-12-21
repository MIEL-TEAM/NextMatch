# FedCM CORS Error - Production Fix

## 🔴 Error: CORS error with FedCM

This error occurs when the browser blocks FedCM requests due to security policies.

---

## ✅ Solution 1: Update Content Security Policy (CSP)

If your production site uses CSP headers, you need to allow FedCM connections.

### Check if you have CSP
Open DevTools on production → Network → Click on your main HTML document → Look for `Content-Security-Policy` header

### Fix: Update your CSP headers

Add these directives to your CSP:

```
connect-src 'self' https://accounts.google.com https://*.google.com https://*.gstatic.com;
```

#### If using Next.js middleware or headers:

**Option A: In `next.config.ts`**

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "connect-src 'self' https://accounts.google.com https://*.google.com https://*.gstatic.com",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
              "frame-src 'self' https://accounts.google.com",
              "style-src 'self' 'unsafe-inline'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

**Option B: In Vercel Dashboard**

1. Go to: Project → Settings → Headers
2. Add custom header:
   - Key: `Content-Security-Policy`
   - Value: `connect-src 'self' https://accounts.google.com https://*.google.com https://*.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; frame-src 'self' https://accounts.google.com`

---

## ✅ Solution 2: Disable FedCM Temporarily (Quick Fix)

If you need a quick fix while configuring CSP, temporarily disable FedCM:

```typescript
// In GoogleOneTap.tsx
window.google.accounts.id.initialize({
  client_id: clientId,
  callback: async ({ credential }) => { ... },
  use_fedcm_for_prompt: false, // ← Disable FedCM temporarily
});
```

**Note**: This is a temporary workaround. You should fix the CSP to use FedCM properly.

---

## ✅ Solution 3: Check Google Cloud Console

Ensure your production domain is whitelisted:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, verify you have:
   ```
   https://miel-love.com
   https://www.miel-love.com
   ```
4. Under **Authorized redirect URIs**, verify you have:
   ```
   https://miel-love.com/api/auth/callback/google
   https://www.miel-love.com/api/auth/callback/google
   ```
5. Click **Save** and wait 5-10 minutes

---

## ✅ Solution 4: Check for Cross-Origin Iframes

If you're using Google One Tap inside an iframe:

```html
<!-- Add this attribute to the iframe -->
<iframe src="..." allow="identity-credentials-get"></iframe>
```

---

## 🔍 Debugging the CORS Error

### Step 1: Check Console Error Details

Open Chrome DevTools on production and look for the exact error:

```
NetworkError: Failed to execute 'get' on 'CredentialsContainer': 
Refused to connect to 'https://accounts.google.com/gsi/fedcm.json' 
because it violates the document's Content Security Policy.
```

### Step 2: Verify FedCM Request

In DevTools → Network → Filter "fedcm" → Check if request is being blocked

### Step 3: Check Current CSP

Run this in console:
```javascript
console.log(document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content);
```

---

## 🚀 Recommended Fix for Miel Production

I'll create a proper CSP configuration for you:

