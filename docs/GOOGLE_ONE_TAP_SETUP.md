# Google One Tap - Environment Setup & Validation

## ✅ Step 1: Verify Environment Variables

### Local Development (.env.local)

Create or update `/Users/User/Desktop/Miel-DatingApp/.env.local`:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"

# IMPORTANT: Must have NEXT_PUBLIC_ prefix for client-side access
NEXT_PUBLIC_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

**Note**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` should be the **same value** as `GOOGLE_CLIENT_ID`

### Production Environment (Vercel)

Add these environment variables in Vercel:
1. Go to: https://vercel.com/your-team/miel-dating-app/settings/environment-variables
2. Add:
   - `GOOGLE_CLIENT_ID` = Your Google Client ID
   - `GOOGLE_CLIENT_SECRET` = Your Google Client Secret
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Your Google Client ID (same as above)
3. Select: ✅ Production ✅ Preview ✅ Development
4. Click "Save"
5. **Redeploy** your application

---

## ✅ Step 2: Configure Google Cloud Console

### Required Settings

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Configure the following:

#### Authorized JavaScript origins:
```
# Local Development
http://localhost:3000
http://localhost:3001

# Production
https://miel-love.com
https://www.miel-love.com
```

#### Authorized redirect URIs:
```
# Local Development
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google

# Production
https://miel-love.com/api/auth/callback/google
https://www.miel-love.com/api/auth/callback/google
```

4. Click **Save**
5. Wait 5-10 minutes for changes to propagate

---

## ✅ Step 3: Test Locally

### 1. Start Development Server
```bash
cd /Users/User/Desktop/Miel-DatingApp
npm run dev
```

### 2. Open Browser Console
Navigate to: http://localhost:3000

Open DevTools (F12) and check console for:
```
[Google One Tap] Client ID found, initializing...
[Google One Tap] Initializing with client ID: YOUR_CLIENT_ID...
[Google One Tap] Initialized successfully
```

### 3. If You See Errors

**Error: "Client ID not found"**
- Check that `.env.local` exists and has `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Restart dev server: `Ctrl+C` then `npm run dev`

**Error: "Google script not loaded"**
- Check that the script tag is in `layout.tsx`:
  ```tsx
  <script src="https://accounts.google.com/gsi/client" async defer />
  ```

**Error: "Invalid client ID or domain not authorized"**
- Check Google Cloud Console Authorized JavaScript origins
- Make sure `http://localhost:3000` is added

**Error: "FedCM error"**
- This is normal after logout, the code handles it gracefully

---

## ✅ Step 4: Test in Production

### 1. Deploy to Production
```bash
# If using Vercel
vercel --prod

# Or push to main branch (if auto-deploy is enabled)
git push origin main
```

### 2. Verify Environment Variables
```bash
# Check Vercel environment variables
vercel env ls
```

Should show:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Production, Preview, Development)

### 3. Test on Production Site

Navigate to: https://miel-love.com

Open DevTools (F12) and run:
```javascript
// Check if environment variable is available
console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

// Check if Google script loaded
console.log('Google loaded:', !!window.google);
console.log('Google accounts:', !!window.google?.accounts?.id);
```

**Expected Output**:
```
Client ID: YOUR_CLIENT_ID.apps.googleusercontent.com
Google loaded: true
Google accounts: true
[Google One Tap] Client ID found, initializing...
[Google One Tap] Initialized successfully
```

### 4. Common Production Issues

**Issue: "Client ID: undefined"**
- Environment variable not set in Vercel
- Go to Vercel → Settings → Environment Variables
- Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Redeploy

**Issue: "Invalid client ID"**
- Production domain not in Google Cloud Console
- Add `https://miel-love.com` to Authorized JavaScript origins
- Wait 5-10 minutes for changes to propagate

**Issue: One Tap doesn't appear**
- User might have dismissed it before (stored in browser)
- Try in incognito/private mode
- Check console for "[Google One Tap] Not displayed" message

---

## ✅ Step 5: Handle FedCM Errors

The new implementation automatically handles FedCM `IdentityCredentialError` that occurs after logout. This is a browser-level error and is expected behavior.

**What happens**:
1. User signs in → One Tap works
2. User signs out → Browser remembers the credential
3. Page reload → FedCM throws error (trying to auto-select)
4. Code catches error → Silently handled, no impact on user

**Console output** (after logout):
```
[Google One Tap] FedCM error (expected after logout): NetworkError
```

This is normal and expected. The error is caught and logged but doesn't break the application.

---

## 🔍 Debugging Checklist

Run these checks if One Tap isn't working:

### Local Development
- [ ] `.env.local` file exists
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- [ ] Value matches your Google Client ID
- [ ] Dev server was restarted after adding variable
- [ ] `http://localhost:3000` is in Google Cloud Console origins
- [ ] Script tag is in `layout.tsx`
- [ ] No console errors in browser

### Production
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is in Vercel env variables
- [ ] Production domain is in Google Cloud Console origins
- [ ] Application was redeployed after adding env variable
- [ ] HTTPS is enabled (SSL certificate valid)
- [ ] No console errors in browser
- [ ] Tested in incognito mode (to rule out browser cache)

---

## 📝 Environment Variable Quick Reference

| Variable | Location | Purpose | Example |
|----------|----------|---------|---------|
| `GOOGLE_CLIENT_ID` | Server-side | OAuth authentication | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Server-side | OAuth authentication | `GOCSPX-abc123` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client-side | One Tap initialization | `123456.apps.googleusercontent.com` |

**Important**: 
- `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` should have the **same value**
- Only variables with `NEXT_PUBLIC_` prefix are accessible in the browser
- Server-side variables are NOT accessible in client components

---

## ✅ Success Indicators

When everything is working correctly, you should see:

### Console Logs (in order):
1. `[Google One Tap] Client ID found, initializing...`
2. `[Google One Tap] Initializing with client ID: [YOUR_ID]`
3. `[Google One Tap] Initialized successfully`

### Visual Indicators:
- Google One Tap prompt appears in top-right corner of page
- Shows your Google accounts
- Click on account → Redirects to `/members` page

### No Errors:
- No red errors in console
- No "Invalid client" warnings
- FedCM errors are caught and logged (not shown to user)

---

## 🆘 Still Not Working?

If you've followed all steps and it's still not working:

1. **Check Google Cloud Console Project Status**
   - Make sure OAuth consent screen is published
   - Verify your app is not in "Testing" mode (or add test users)

2. **Clear Browser Cache**
   ```bash
   # Chrome DevTools
   F12 → Application → Clear storage → Clear site data
   ```

3. **Check Third-Party Cookies**
   - Google One Tap requires third-party cookies
   - Browser: Settings → Privacy → Cookies → Allow all cookies

4. **Review Console Logs**
   - Look for any `[Google One Tap]` prefixed messages
   - Share the exact error message if asking for help

5. **Test Different Browser**
   - Some browsers block One Tap by default
   - Try Chrome, Firefox, Edge, Safari

---

**Need more help?** Check the full troubleshooting guide:
`/docs/GOOGLE_ONE_TAP_TROUBLESHOOTING.md`

