## ✅ Quick Fix Applied to `next.config.ts`

I've added the necessary **Permissions-Policy** header to allow FedCM to work properly.

### What was added:

```typescript
{
  source: "/:path*",
  headers: [
    {
      key: "Permissions-Policy",
      value: "identity-credentials-get=*, publickey-credentials-get=*",
    },
  ],
}
```

This tells the browser to allow FedCM API calls across your entire site.

---

## 🚀 Next Steps:

### 1. Deploy to Production

```bash
# If using Vercel
vercel --prod

# Or push to main branch
git add next.config.ts
git commit -m "fix: Add Permissions-Policy header for FedCM CORS"
git push origin main
```

### 2. Verify the Fix

After deployment, open production site and check:

**A. Check the Header is Applied:**

```javascript
// Open DevTools Console on production
fetch(window.location.href)
  .then((r) => r.headers.get("permissions-policy"))
  .then(console.log);
// Should show: "identity-credentials-get=*, publickey-credentials-get=*"
```

**B. Check Google One Tap Works:**

- Clear browser cache
- Visit homepage (logged out)
- Google One Tap should appear without CORS errors
- Check console for: `[Google One Tap] Initialized successfully`

---

## 🔍 If CORS Error Persists

If the error continues after deploying:

### Option 1: Check CSP in Vercel Dashboard

1. Go to: Vercel → Your Project → Settings → Headers
2. Make sure there are no conflicting CSP headers

### Option 2: Temporarily Disable FedCM

Edit `src/components/auth/GoogleOneTap.tsx`:

```typescript
window.google.accounts.id.initialize({
  client_id: clientId,
  callback: async ({ credential }) => { ... },
  use_fedcm_for_prompt: false, // ← Set to false temporarily
});
```

This will use the old authentication method (still works, just uses cookies).

### Option 3: Check Browser Console for Specific Error

The exact error message will tell us what's wrong:

**Common CORS Errors:**

1. **"Refused to connect to 'https://accounts.google.com/gsi/fedcm.json'"**

   - Fix: Add Permissions-Policy header (already done above)

2. **"NotAllowedError: The 'identity-credentials-get' feature is not enabled"**

   - Fix: Add `allow="identity-credentials-get"` to iframe (if using iframes)

3. **"NetworkError: Failed to fetch"**
   - Fix: Check Google Cloud Console domain authorization

---

## 📝 Summary

✅ **Fixed**: Added Permissions-Policy header to `next.config.ts`  
🚀 **Action Required**: Deploy to production  
⏱️ **Time to Fix**: 5-10 minutes after deployment

The CORS error should be resolved once you deploy this change!
