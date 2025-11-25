# 🧪 Google One Tap Testing Guide

## ⚙️ Pre-Testing Setup

### 1. Verify Environment Variable

Check your `.env.local` file contains:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

**Run this command to verify:**

```bash
echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

If empty, add it to `.env.local`:

```bash
# Use the same value as GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID="<your-google-client-id>"
```

### 2. Restart Development Server

After adding the environment variable:

```bash
npm run dev
```

## ✅ Testing Scenarios

### Scenario 1: Guest User on Homepage

**Steps:**

1. Open browser in **Incognito/Private mode**
2. Navigate to `http://localhost:3000`
3. Wait 2-3 seconds

**Expected Result:**

- Google One Tap popup appears in top-right corner
- Shows "Sign in with Google" prompt

**If it doesn't appear:**

- Check browser console for errors
- Verify you're not logged in (no session cookie)
- Ensure NEXT_PUBLIC_GOOGLE_CLIENT_ID is set

---

### Scenario 2: Guest User on Login Page

**Steps:**

1. Open browser in **Incognito/Private mode**
2. Navigate to `http://localhost:3000/login`
3. Wait 2-3 seconds

**Expected Result:**

- Google One Tap popup appears
- Standard login form also visible

---

### Scenario 3: Already Authenticated User

**Steps:**

1. Sign in normally with Google OAuth
2. Navigate to any page

**Expected Result:**

- Google One Tap does NOT appear
- User stays logged in

---

### Scenario 4: Admin Route

**Steps:**

1. Open browser in **Incognito/Private mode**
2. Navigate to `http://localhost:3000/admin`

**Expected Result:**

- Google One Tap does NOT appear
- Even though user is not authenticated

---

### Scenario 5: Sign In with One Tap

**Steps:**

1. Open browser in **Incognito/Private mode**
2. Navigate to `http://localhost:3000`
3. Wait for One Tap popup
4. Click on your Google account
5. Wait for redirect

**Expected Result:**

- User is authenticated
- Redirected to `/members`
- Session cookie is set
- Database updated with:
  - `provider: "google"`
  - `oauthVerified: true`
  - `emailVerified: <timestamp>`
  - Trust score increased by 40 (for existing users)
  - Welcome email sent (for first-time users)

---

## 🔍 Debugging

### Check Browser Console

Open DevTools (F12) and look for:

```
// Success:
Google One Tap initialized

// Errors:
Google Client ID not found for One Tap
Failed to initialize Google One Tap: <error>
Google One Tap sign-in error: <error>
```

### Check Network Tab

1. Open DevTools → Network tab
2. Filter by "gsi"
3. Should see: `https://accounts.google.com/gsi/client` loaded successfully

### Check Cookies

1. Open DevTools → Application → Cookies
2. Look for:
   - `next-auth.session-token` (development)
   - `__Secure-next-auth.session-token` (production)

### Check Server Logs

Watch your terminal for:

```
// Success:
[signIn callback] Google OAuth user authenticated

// Errors:
signIn error: <error>
```

## 🐛 Common Issues

### Issue: One Tap Doesn't Appear

**Possible Causes:**

1. ❌ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` not set
2. ❌ Already logged in (session cookie exists)
3. ❌ On admin route
4. ❌ Google script blocked by ad blocker
5. ❌ Browser doesn't support One Tap

**Solutions:**

1. Verify environment variable
2. Clear cookies or use Incognito
3. Test on non-admin route
4. Disable ad blocker
5. Try Chrome/Edge (best support)

---

### Issue: "Invalid Client ID"

**Cause:** Mismatch between `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

**Solution:**

```bash
# Both should be EXACTLY the same
GOOGLE_CLIENT_ID="123-abc.apps.googleusercontent.com"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="123-abc.apps.googleusercontent.com"
```

---

### Issue: Sign In Fails

**Possible Causes:**

1. ❌ Google OAuth credentials expired/invalid
2. ❌ Database connection error
3. ❌ Email not verified with Google

**Solutions:**

1. Check Google Cloud Console credentials
2. Verify database is running
3. Use Google account with verified email

---

### Issue: Redirects to Wrong Page

**Cause:** `callbackUrl` parameter in GoogleOneTap.tsx

**Current Setting:**

```tsx
callbackUrl: "/members";
```

**To Change:** Edit `src/components/auth/GoogleOneTap.tsx` line 69

---

## 📊 Database Verification

After successful One Tap sign-in, check your database:

```sql
SELECT
  email,
  provider,
  oauthVerified,
  emailVerified,
  trustScore,
  hasSeenWelcomeMessage
FROM "User"
WHERE email = 'your-test-email@gmail.com';
```

**Expected Values:**

- `provider`: "google"
- `oauthVerified`: true
- `emailVerified`: (timestamp)
- `trustScore`: 40 (new user) or +40 (existing user)
- `hasSeenWelcomeMessage`: true (after welcome email sent)

---

## 🎯 Test Checklist

- [ ] One Tap appears for guest users
- [ ] One Tap does NOT appear when logged in
- [ ] One Tap does NOT appear on `/admin` routes
- [ ] Clicking account signs user in successfully
- [ ] User redirected to `/members` after sign-in
- [ ] Session cookie created
- [ ] Database updated correctly
- [ ] Trust score increased for existing users
- [ ] Welcome email sent for new users
- [ ] Provider field set to "google"
- [ ] No console errors
- [ ] No server errors
- [ ] Works in Chrome
- [ ] Works in Edge
- [ ] Works in Firefox
- [ ] Works in Safari

---

## 📝 Notes

- **Browser Support**: Best in Chrome/Edge, limited in Firefox/Safari
- **Mobile**: May not appear on all mobile browsers
- **Privacy**: One Tap respects Google's privacy settings
- **Frequency**: Google limits how often One Tap shows
- **Dismissal**: If user dismisses, may not show again for 24h

---

## 🆘 Still Having Issues?

1. Check `GOOGLE_ONE_TAP_IMPLEMENTATION.md` for detailed implementation notes
2. Review NextAuth logs in terminal
3. Verify Google Cloud Console settings
4. Check browser console for JavaScript errors
5. Test with different Google account
6. Try different browser
7. Clear all cookies and cache

---

**Last Updated**: November 25, 2025  
**Implementation Version**: 1.0  
**Status**: ✅ Ready for Testing
