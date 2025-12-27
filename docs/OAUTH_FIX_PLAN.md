# 🔧 OAuth Fix Plan - Complete Implementation

## 🎯 **Fix Strategy: Option 3 (redirect callback)**

**Recommended approach** with clean separation of concerns, minimal performance impact, and proper NextAuth patterns.

---

## 📋 **Changes Required**

### **Change 1: Update SocialLogin.tsx**
**File**: `src/app/(auth)/login/SocialLogin.tsx`

**Current code** (lines 7-11):
```typescript
const onClick = (provider: "google" | "facebook") => {
  signIn(provider, {
    callbackUrl: "/members",  // ❌ Hardcoded
  });
};
```

**New code**:
```typescript
const onClick = (provider: "google" | "facebook") => {
  console.log(`🔵 [OAUTH] ${provider} button clicked`);
  
  // Don't specify callbackUrl - let redirect callback decide
  signIn(provider);
};
```

**Why:**
- Remove hardcoded redirect
- Let NextAuth `redirect` callback handle routing
- Add logging for debugging

---

### **Change 2: Add redirect callback to auth.ts**
**File**: `src/auth.ts`

**Location**: Inside `callbacks` object (after `session` callback, before closing brace)

**Add this code** (around line 147, after `session` callback):

```typescript
async redirect({ url, baseUrl }) {
  console.log("🔄 [OAUTH] Redirect callback triggered:", {
    url,
    baseUrl,
  });

  // Handle relative URLs
  if (url.startsWith("/")) {
    const fullUrl = new URL(url, baseUrl);
    console.log("  ↳ Relative URL converted:", fullUrl.href);
    url = fullUrl.href;
  }

  // Check if user has completed profile
  try {
    const session = await auth();
    
    if (session?.user) {
      console.log("  ↳ User session found:", {
        email: session.user.email,
        profileComplete: session.user.profileComplete,
      });

      // If profile not complete, redirect to complete-profile page
      if (!session.user.profileComplete) {
        const completeProfileUrl = `${baseUrl}/complete-profile`;
        console.log("  ✅ [OAUTH] Redirecting to complete-profile (no Member)");
        return completeProfileUrl;
      }

      // Profile is complete, redirect to members
      console.log("  ✅ [OAUTH] Redirecting to members (has Member)");
      return `${baseUrl}/members`;
    }

    // No session (shouldn't happen), fallback to members
    console.log("  ⚠️  No session found, fallback to members");
    return `${baseUrl}/members`;
  } catch (error) {
    console.error("  ❌ [OAUTH] Redirect callback error:", error);
    return `${baseUrl}/members`;
  }
},
```

**Why:**
- Check `profileComplete` status after OAuth
- Route new users (no Member) to `/complete-profile`
- Route returning users (has Member) to `/members`
- Add comprehensive logging

---

### **Change 3: Update middleware.ts (optional but recommended)**
**File**: `src/middleware.ts`

**Current code** (lines 61-65):
```typescript
if (unauthOnlyRoutes.includes(pathname)) {
  return NextResponse.redirect(new URL("/members", nextUrl), {
    status: 303,
  });
}
```

**Add this BEFORE the above code** (around line 61):

```typescript
/* =========================
   PROFILE COMPLETION
========================= */
// Allow authenticated users to access complete-profile if needed
if (isLoggedIn && pathname === "/complete-profile") {
  console.log("🔄 [MIDDLEWARE] Allowing access to /complete-profile");
  return NextResponse.next();
}

// If user is authenticated but profile not complete, enforce completion
if (
  isLoggedIn &&
  !user?.profileComplete &&
  pathname !== "/complete-profile" &&
  !publicRoutes.includes(pathname) &&
  !authActionRoutes.includes(pathname)
) {
  console.log("🔄 [MIDDLEWARE] Enforcing profile completion:", {
    email: user?.email,
    profileComplete: user?.profileComplete,
  });
  return NextResponse.redirect(new URL("/complete-profile", nextUrl), {
    status: 303,
  });
}
```

**Why:**
- Enforce profile completion app-wide (safety net)
- Prevent incomplete profiles from accessing main app
- Allow access to `/complete-profile` page

---

## 🧪 **Testing Plan**

### **Test 1: New OAuth User (PRIMARY TEST)**

**Steps:**
1. Clear cookies / use incognito
2. Go to `/register`
3. Click "Sign in with Google"
4. Complete Google authentication
5. **Expected**: Redirected to `/complete-profile`
6. Fill in dating profile form (gender, DOB, city, etc.)
7. Submit form
8. **Expected**: Redirected to `/members`
9. **Expected**: User visible in members list

**Verify in database:**
```sql
SELECT 
  u.id,
  u.email,
  u."emailVerified",
  u."profileComplete",
  u."oauthVerified",
  m.id AS "memberId",
  m.name AS "memberName"
FROM "User" u
LEFT JOIN "Member" m ON u.id = m."userId"
WHERE u.email = 'your-test-email@gmail.com';
```

**Expected result:**
- `emailVerified`: [Date] ✅
- `profileComplete`: true ✅
- `oauthVerified`: true ✅
- `memberId`: [exists] ✅
- `memberName`: [your name] ✅

**Console logs to watch for:**
```
🔵 [OAUTH] google button clicked
🔵 [OAUTH] google sign-in: your-email@gmail.com
✅ emailVerified set for your-email@gmail.com (google)
🔄 [OAUTH] Redirect callback triggered
↳ User session found: { email: "...", profileComplete: false }
✅ [OAUTH] Redirecting to complete-profile (no Member)
📝 [SOCIAL] Completing profile for: your-email@gmail.com
✅ [SOCIAL] Profile completed successfully
↳ emailVerified: true
↳ hasMember: true
↳ profileComplete: true
```

---

### **Test 2: Returning OAuth User**

**Steps:**
1. User who already has Member record
2. Logout
3. Go to `/login`
4. Click "Sign in with Google"
5. Complete Google authentication
6. **Expected**: Redirected directly to `/members` (skip profile completion)

**Console logs to watch for:**
```
🔵 [OAUTH] google button clicked
🔵 [OAUTH] google sign-in: existing-user@gmail.com
🔄 [OAUTH] Redirect callback triggered
↳ User session found: { email: "...", profileComplete: true }
✅ [OAUTH] Redirecting to members (has Member)
```

---

### **Test 3: Register Flow (from /register)**

**Same as Test 1**, but starting from `/register` page instead of `/login`.

**Expected**: Identical behavior.

---

### **Test 4: Credentials User (NOT affected)**

**Steps:**
1. Register with email/password (full 4-step form)
2. **Expected**: Member created immediately
3. **Expected**: Redirect to `/register/success` then `/members`
4. **Expected**: User visible in members list

**Verify this flow is NOT broken by OAuth changes.**

---

### **Test 5: Middleware Enforcement**

**Steps:**
1. New OAuth user completes Google auth
2. **Expected**: Redirected to `/complete-profile`
3. Try to navigate to `/members` manually (type in URL)
4. **Expected**: Middleware redirects back to `/complete-profile`
5. Complete profile form
6. **Expected**: Now can access `/members`

**This tests the middleware safety net.**

---

## 📊 **Expected Outcomes**

### **Before Fix:**
```
Total Users: 24
Total Members: 22
Missing: 2 OAuth users
```

### **After Fix:**
```
Total Users: 24
Total Members: 24 ✅
Missing: 0 ✅

All OAuth users have Member records!
```

---

## 🚨 **Potential Issues & Solutions**

### **Issue 1: Session not available in redirect callback**

**Symptom:** `session` is `null` in redirect callback

**Solution:**
```typescript
// Use direct database query instead
const user = await prisma.user.findUnique({
  where: { email: profile.email },
  select: { profileComplete: true },
});

if (!user?.profileComplete) {
  return `${baseUrl}/complete-profile`;
}
```

---

### **Issue 2: Infinite redirect loop**

**Symptom:** User stuck between `/members` and `/complete-profile`

**Solution:**
- Ensure `/complete-profile` is in `profileRoutes` array
- Middleware should NOT redirect from `/complete-profile`
- Check for `pathname !== "/complete-profile"` in middleware

---

### **Issue 3: Returning users see profile form**

**Symptom:** Users with existing Members are redirected to `/complete-profile`

**Solution:**
- Ensure `profileComplete` is correctly set in database
- Check JWT token has `profileComplete` field
- Verify session callback includes `profileComplete`

**Database fix:**
```sql
-- Ensure all users with Members have profileComplete = true
UPDATE "User" u
SET "profileComplete" = true
FROM "Member" m
WHERE u.id = m."userId"
  AND u."profileComplete" = false;
```

---

## 🔄 **Rollback Plan**

If the fix causes issues, revert these changes:

### **Revert SocialLogin.tsx:**
```typescript
const onClick = (provider: "google" | "facebook") => {
  signIn(provider, {
    callbackUrl: "/members",
  });
};
```

### **Remove redirect callback from auth.ts:**
- Delete the `redirect` callback we added

### **Revert middleware.ts:**
- Remove the profile completion enforcement code

---

## 📝 **Documentation Updates**

After implementing the fix, update:

1. **OAUTH_FLOW_ANALYSIS.md** - Mark as "FIXED"
2. **OAUTH_FLOW_DIAGRAM.md** - Add "After Fix" diagram
3. **Create OAUTH_FIX_IMPLEMENTATION.md** - Document what was changed

---

## ✅ **Implementation Checklist**

- [ ] Update `SocialLogin.tsx` (remove hardcoded callbackUrl)
- [ ] Add `redirect` callback to `auth.ts`
- [ ] Update `middleware.ts` (profile completion enforcement)
- [ ] Test new OAuth user flow
- [ ] Test returning OAuth user flow
- [ ] Test credentials user flow (not broken)
- [ ] Verify console logs appear
- [ ] Check database: all OAuth users have Members
- [ ] Run: `npm run check-oauth`
- [ ] Run: `npm run check-prod`
- [ ] Update documentation

---

## 🎯 **Success Criteria**

**The fix is successful when:**

1. ✅ New OAuth users are redirected to `/complete-profile`
2. ✅ After completing profile, Member record is created
3. ✅ `profileComplete` is set to `true`
4. ✅ User appears in members list
5. ✅ Returning OAuth users skip profile completion
6. ✅ Credentials users are not affected
7. ✅ All console logs appear as expected
8. ✅ Database shows 24 users, 24 members (0 missing)

---

**Ready to implement? Let me know and I'll make all the changes with full logging! 🚀**

