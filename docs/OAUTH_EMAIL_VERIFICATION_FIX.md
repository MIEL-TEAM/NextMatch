# 🔧 OAuth Email Verification Fix

## 📋 Summary

**Problem**: OAuth users (Google/Facebook) should have `emailVerified` automatically set because OAuth providers verify emails on their end.

**Solution**: The Miel app already has robust OAuth email verification implemented in `src/auth.ts`. This document explains how it works and how to maintain it.

---

## ✅ Current Status

### Production Database

```
Total OAuth users: 4
With emailVerified: 4 ✅
Without emailVerified: 0 ✅

✅ ALL OAUTH USERS ARE VERIFIED!
```

**The system is working correctly!**

---

## 🔍 How It Works

### 1. OAuth Sign-In Flow

**File**: `src/auth.ts` (lines 41-100)

When a user signs in with Google or Facebook:

```typescript
async signIn({ user, account }) {
  if (account?.provider === "google" || account?.provider === "facebook") {
    // ✅ Automatically set emailVerified
    await prisma.user.update({
      where: { email: user.email },
      data: {
        emailVerified: new Date(),  // ✅ OAuth providers verify emails
        provider: account.provider,
        oauthVerified: true,
        trustScore: +40  // Bonus for OAuth verification
      }
    });
  }
}
```

**What happens:**

1. User clicks "Sign in with Google"
2. Google authenticates user
3. Google confirms email is verified
4. Our `signIn` callback sets `emailVerified: new Date()`
5. User is marked as verified ✅

---

### 2. Profile Completion

**File**: `src/app/actions/authActions.ts` (completeSocialLoginProfile)

When user completes their dating profile:

```typescript
await prisma.user.update({
  where: { id: session.user.id },
  data: {
    profileComplete: true,
    emailVerified: session.user.emailVerified || new Date(), // ✅ Safety check
    member: {
      upsert: {
        /* create member profile */
      },
    },
  },
});
```

**Safety check**: If `emailVerified` somehow wasn't set during sign-in, it's set here as a fallback.

---

### 3. Credentials (Email/Password) Flow

**Important**: Credentials users have a **different** verification flow:

```typescript
// Credentials users start with emailVerified: null
// They receive a verification email
// Clicking the link sets emailVerified: new Date()
```

**DO NOT** auto-verify credentials users!

---

## 🛠️ Maintenance Scripts

### Check OAuth Users

See which OAuth users have/don't have `emailVerified`:

```bash
npm run check-oauth
```

**Output:**

```
📊 Total OAuth users: 4
✅ OAuth users WITH emailVerified: 4
❌ OAuth users WITHOUT emailVerified: 0
```

---

### Fix OAuth Users

If you find OAuth users with `emailVerified: null`, fix them:

```bash
npm run fix-oauth-verify
```

**What it does:**

- Finds all OAuth users with `emailVerified: null`
- Sets `emailVerified: new Date()` for each
- Verifies the fix

**Output:**

```
🔧 Fixing OAuth users with null emailVerified...
📊 Found 2 OAuth users to fix
  - user1@gmail.com (google)
  - user2@gmail.com (facebook)
🔄 Updating users...
  ✅ Fixed: user1@gmail.com (google)
  ✅ Fixed: user2@gmail.com (facebook)
✅ All OAuth users fixed!
```

---

## 🧪 Testing

### Test 1: New OAuth User Registration

1. **Clear cookies** (or use incognito)
2. **Navigate to** `/login`
3. **Click** "Sign in with Google"
4. **Complete** Google authentication
5. **Check console logs**:
   ```
   🔵 [OAUTH] google sign-in: user@gmail.com
   ✅ emailVerified set for user@gmail.com (google)
   ```
6. **Check database**:
   ```sql
   SELECT email, "emailVerified", "oauthVerified", provider
   FROM "User"
   WHERE email = 'user@gmail.com';
   ```
   **Expected:**
   ```
   email: user@gmail.com
   emailVerified: 2025-01-15 10:30:00  ✅
   oauthVerified: true                  ✅
   provider: google                     ✅
   ```

---

### Test 2: OAuth User Completes Profile

1. **Continue from Test 1** (after Google sign-in)
2. **Fill in** dating profile (gender, DOB, city, etc.)
3. **Submit** the form
4. **Check console logs**:
   ```
   📝 [SOCIAL] Completing profile for: user@gmail.com
   ✅ [SOCIAL] Profile completed successfully:
      emailVerified: true  ✅
      hasMember: true      ✅
      profileComplete: true ✅
   ```
5. **Check database**:
   ```sql
   SELECT u.email, u."emailVerified", u."profileComplete", m.name
   FROM "User" u
   LEFT JOIN "Member" m ON u.id = m."userId"
   WHERE u.email = 'user@gmail.com';
   ```
   **Expected:**
   ```
   email: user@gmail.com
   emailVerified: 2025-01-15 10:30:00  ✅
   profileComplete: true                ✅
   member.name: John Doe                ✅
   ```

---

### Test 3: Existing OAuth User Re-Login

1. **Logout** from the app
2. **Click** "Sign in with Google" again
3. **Google authenticates** (may be instant if still logged in to Google)
4. **Check console logs**:
   ```
   🔵 [OAUTH] google sign-in: user@gmail.com
   ✅ emailVerified set for user@gmail.com (google)
   ```
5. **User should be logged in** with all data intact

---

### Test 4: Credentials User (NOT Affected)

1. **Register** with email/password
2. **Check database**:
   ```
   emailVerified: null  ✅ (correct - awaiting verification)
   passwordHash: [hash] ✅
   oauthVerified: false ✅
   ```
3. **Click email verification link**
4. **Check database**:
   ```
   emailVerified: 2025-01-15 11:00:00  ✅
   ```

**OAuth fix does NOT affect credentials users!**

---

## 🚨 Troubleshooting

### Issue 1: OAuth User Has `emailVerified: null`

**Symptoms:**

- User signed in with Google/Facebook
- Database shows `emailVerified: null`

**Possible Causes:**

1. User registered **before** the fix was implemented
2. Database migration issue
3. Sign-in callback error

**Solution:**

```bash
# Check the issue
npm run check-oauth

# Fix it
npm run fix-oauth-verify

# Verify
npm run check-oauth
```

---

### Issue 2: Credentials User Auto-Verified

**Symptoms:**

- User registered with email/password
- `emailVerified` is set immediately (should be `null`)

**Possible Cause:**

- Bug in `signIn` callback

**Check:**

```typescript
// In src/auth.ts
if (account?.provider === "credentials") {
  // ❌ This should NOT set emailVerified
  // ✅ Only set provider and oauthVerified: false
}
```

---

### Issue 3: Missing Console Logs

**Symptoms:**

- OAuth sign-in works but no logs appear

**Check:**

1. **Console log level** in production
2. **Logging service** (Vercel, etc.)
3. **Browser console** (for client-side)

**Solution:**

- Check Vercel logs: `vercel logs <deployment-url>`
- Check local logs: `npm run dev` and watch terminal

---

## 📊 Database Queries

### Check OAuth Users

```sql
SELECT
  u.email,
  u."emailVerified",
  u."oauthVerified",
  u.provider,
  a.provider AS "accountProvider"
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
WHERE a.provider IN ('google', 'facebook')
ORDER BY u.email;
```

### Find OAuth Users Missing Verification

```sql
SELECT
  u.email,
  u."emailVerified",
  a.provider
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
WHERE a.provider IN ('google', 'facebook')
  AND u."emailVerified" IS NULL;
```

### Count by Provider

```sql
SELECT
  a.provider,
  COUNT(*) AS total,
  COUNT(u."emailVerified") AS verified,
  COUNT(*) - COUNT(u."emailVerified") AS "notVerified"
FROM "Account" a
LEFT JOIN "User" u ON a."userId" = u.id
WHERE a.provider IN ('google', 'facebook')
GROUP BY a.provider;
```

---

## 🔐 Security Notes

1. **OAuth providers verify emails** - Google/Facebook guarantee email ownership
2. **Trust score bonus** - OAuth users get +40 trust score (out of 100)
3. **No password required** - OAuth users have `passwordHash: null` (correct)
4. **Credentials separate** - Email/password users have separate verification flow

---

## 📝 Code Files

### Main Files

- `src/auth.ts` - NextAuth configuration, sign-in callback
- `src/auth.config.ts` - OAuth providers (Google, Facebook, Credentials)
- `src/app/actions/authActions.ts` - completeSocialLoginProfile

### Scripts

- `scripts/check-oauth-users.ts` - Check OAuth verification status
- `scripts/fix-oauth-emailverified.ts` - Fix missing emailVerified

### Tests

- Run: `npm run check-oauth` - See current status
- Run: `npm run fix-oauth-verify` - Fix any issues

---

## ✅ Checklist: OAuth Email Verification

- [x] `signIn` callback sets `emailVerified` for OAuth users
- [x] `completeSocialLoginProfile` has safety check
- [x] Console logs for debugging
- [x] Migration script available
- [x] Documentation complete
- [x] All production OAuth users verified

---

## 🎯 Summary

**The Miel app correctly handles OAuth email verification:**

1. ✅ OAuth users auto-verified on sign-in
2. ✅ Safety check during profile completion
3. ✅ Credentials users have separate flow
4. ✅ Logging for debugging
5. ✅ Scripts for maintenance

**No further changes needed!** The system is working as intended.

If issues arise, use:

```bash
npm run check-oauth      # Check status
npm run fix-oauth-verify # Fix issues
```

**Last Updated**: January 2025  
**Status**: ✅ Working correctly in production
