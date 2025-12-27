# 🔍 OAUTH FLOW ANALYSIS - Critical Findings

## 🚨 **THE BUG IS FOUND!**

---

## 📊 **Step 1: Complete Flow Mapping**

### **Flow A: Register with Google (from `/register` page)**

```
[User on /register page]
       ↓
[RegisterForm.tsx renders]
  - activeStep === 0
  - Renders <SocialLogin /> component (line 219)
       ↓
[User clicks "Sign in with Google" button]
  - Component: src/app/(auth)/login/SocialLogin.tsx
  - Function: onClick("google")
  - Calls: signIn('google', { callbackUrl: "/members" })
       ↓
[Google OAuth (external)]
  - User authenticates with Google
  - Google verifies email
       ↓
[NextAuth receives OAuth callback]
  - File: src/auth.ts
  - Callback: signIn({ user, account, profile })
  - Lines 41-117
       ↓
[What happens in signIn callback:]
  1. Updates User with:
     - emailVerified: new Date() ✅
     - oauthVerified: true ✅
     - provider: "google" ✅
  2. Does NOT create Member ❌
  3. Does NOT check if Member exists ❌
  4. Returns true (allows sign-in)
       ↓
[NextAuth redirects to: /members]
  - Why? callbackUrl: "/members" (set in SocialLogin.tsx line 9)
  - No check for profileComplete
  - No check for Member existence
       ↓
[User lands on /members]
  - BUT: User has NO Member record! ❌
  - profileComplete: false ❌
  - User is INVISIBLE in members list ❌
       ↓
[❌ BUG: User never sees /complete-profile page]
[❌ BUG: completeSocialLoginProfile() is NEVER called]
[❌ BUG: Member record is NEVER created]
```

---

### **Flow B: Login with Google (from `/login` page)**

```
[User on /login page]
       ↓
[LoginForm.tsx renders]
  - Renders <SocialLogin /> component (line 120)
       ↓
[User clicks "Sign in with Google" button]
  - Component: src/app/(auth)/login/SocialLogin.tsx
  - Function: onClick("google")
  - Calls: signIn('google', { callbackUrl: "/members" })
       ↓
[EXACT SAME FLOW AS REGISTER]
  - Google OAuth
  - signIn callback updates User
  - Does NOT create Member
  - Redirects to /members
       ↓
[Same bug applies] ❌
```

---

### **Flow C: Expected Flow (What SHOULD happen)**

```
[User clicks "Sign in with Google"]
       ↓
[Google OAuth]
       ↓
[NextAuth signIn callback]
  - Update User (emailVerified, etc.)
       ↓
[Check: Does user have Member?] ⚠️ MISSING!
       ↓
  YES → [Redirect to /members] ✅
  NO  → [Redirect to /complete-profile] ⚠️ SHOULD DO THIS!
       ↓
[User fills dating profile form]
       ↓
[completeSocialLoginProfile() called]
       ↓
[Member created via upsert]
       ↓
[profileComplete = true]
       ↓
[Redirect to /members]
       ↓
[User visible in members list ✅]
```

---

## 🐛 **THE BUG - EXACT LOCATION**

### **File**: `src/app/(auth)/login/SocialLogin.tsx`

**Lines 7-11:**

```typescript
const onClick = (provider: "google" | "facebook") => {
  signIn(provider, {
    callbackUrl: "/members", // ❌ BUG: Always redirects to /members
  });
};
```

### **Problem:**

1. ✅ OAuth sign-in works
2. ✅ User is created/updated
3. ✅ emailVerified is set
4. ❌ **BUT: Always redirects to `/members`** regardless of whether user has a Member record
5. ❌ **User NEVER sees `/complete-profile` page**
6. ❌ **`completeSocialLoginProfile()` is NEVER called**
7. ❌ **Member record is NEVER created**
8. ❌ **User is INVISIBLE in members list**

---

## 🔍 **Step 2: Member Creation - WHERE It Happens**

### **Location 1: `registerUser()` - Credentials Registration**

**File**: `src/app/actions/authActions.ts` (lines 78-180)

```typescript
export async function registerUser(data: RegisterSchema) {
  // ... validation ...

  const user = await prisma.user.create({
    data: {
      // ... user fields ...
      profileComplete: true, // ✅ Set immediately
      member: {
        create: {
          // ... member fields ✅
        },
      },
    },
  });
}
```

**Called by**: `RegisterForm.tsx` when user completes all 4 steps
**Result**: ✅ Member created immediately, profileComplete: true

---

### **Location 2: `completeSocialLoginProfile()` - OAuth Profile Completion**

**File**: `src/app/actions/authActions.ts` (lines 325-403)

```typescript
export async function completeSocialLoginProfile(data: ProfileSchema) {
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      profileComplete: true, // ✅ Set here
      emailVerified: existingUser?.emailVerified || new Date(),
      member: {
        upsert: {
          create: {
            // ... member fields ✅
          },
          update: {
            // ... member fields
          },
        },
      },
    },
  });
}
```

**Called by**: `CompleteProfileForm.tsx` (line 25)
**Problem**: ❌ **THIS FUNCTION IS NEVER CALLED** because user never reaches `/complete-profile` page!

---

## 🔍 **Step 3: Redirect Logic Analysis**

### **NextAuth Callbacks** (`src/auth.ts`)

**signIn callback (lines 41-117):**

- ✅ Updates User
- ❌ Does NOT check if Member exists
- ❌ Does NOT redirect based on Member existence
- Returns `true` (allows sign-in)

**NO `redirect` callback:**

- NextAuth uses the `callbackUrl` from `signIn()` call
- Always redirects to `/members` ❌

---

### **Middleware** (`src/middleware.ts`)

**Lines 61-64:**

```typescript
if (unauthOnlyRoutes.includes(pathname)) {
  return NextResponse.redirect(new URL("/members", nextUrl), {
    status: 303,
  });
}
```

**Problem**: Authenticated users trying to access `/register` or `/login` are redirected to `/members`

- This is correct for normal flow
- But doesn't help OAuth users who need profile completion

---

### **Routes Configuration** (`src/routes.ts`)

```typescript
export const profileRoutes = ["/complete-profile"];
```

**Problem**: `profileRoutes` is defined but NOT used anywhere! ❌

---

## 🔍 **Step 4: Why Some Users Get Members and Others Don't**

### **Scenario 1: Credentials Registration** ✅

```
User fills RegisterForm (4 steps)
  ↓
Submits form
  ↓
registerUser() called
  ↓
Creates User + Member in one transaction
  ↓
profileComplete: true
  ↓
User visible in members list ✅
```

**Result**: ✅ WORKS

---

### **Scenario 2: OAuth Registration** ❌

```
User clicks "Sign in with Google"
  ↓
OAuth succeeds
  ↓
signIn callback updates User
  ↓
Redirects to /members (hardcoded)
  ↓
No Member created ❌
  ↓
profileComplete: false ❌
  ↓
User INVISIBLE in members list ❌
```

**Result**: ❌ BROKEN

---

## 🔍 **Step 5: Google One Tap Analysis**

**File**: `src/components/auth/GoogleOneTap.tsx`

**Not relevant to this bug:**

- Google One Tap uses the same OAuth flow
- Same issue would apply
- But doesn't appear to be actively used on register/login pages

---

## 🎯 **THE ROOT CAUSE**

### **The Bug in 3 Points:**

1. **Hardcoded callbackUrl**

   ```typescript
   signIn("google", { callbackUrl: "/members" });
   ```

   - Always redirects to `/members`
   - Does NOT check if profile is complete

2. **Missing redirect logic**

   - No `authorized` callback in NextAuth
   - No `redirect` callback in NextAuth
   - Middleware doesn't enforce profile completion

3. **Unreachable profile completion page**
   - `/complete-profile` exists ✅
   - `completeSocialLoginProfile()` function exists ✅
   - But users NEVER reach this page ❌

---

## 🔧 **THE FIX - What Needs to Change**

### **Option 1: Fix in SocialLogin.tsx** (SIMPLEST)

**Change:**

```typescript
// BEFORE:
signIn(provider, {
  callbackUrl: "/members", // ❌ Always /members
});

// AFTER:
signIn(provider, {
  callbackUrl: "/complete-profile", // ✅ Always complete profile first
});
```

**Issue**: This forces existing users (who already have Members) to go through profile completion again. Not ideal.

---

### **Option 2: Add authorized callback in auth.ts** (RECOMMENDED)

**Add to `src/auth.ts` callbacks:**

```typescript
callbacks: {
  async authorized({ auth, request }) {
    const { pathname } = request.nextUrl;
    const isLoggedIn = !!auth?.user;
    const hasProfile = auth?.user?.profileComplete;

    // If logged in but no profile, redirect to complete-profile
    if (isLoggedIn && !hasProfile && pathname !== "/complete-profile") {
      return Response.redirect(new URL("/complete-profile", request.nextUrl));
    }

    return true;
  },

  // ... existing callbacks ...
}
```

---

### **Option 3: Fix callbackUrl dynamically** (BEST)

**Change `SocialLogin.tsx`:**

```typescript
const onClick = async (provider: "google" | "facebook") => {
  // Let NextAuth handle redirect based on profileComplete
  // Don't specify callbackUrl - let middleware/callbacks decide
  signIn(provider);
};
```

**Add redirect callback in `auth.ts`:**

```typescript
async redirect({ url, baseUrl }) {
  // After OAuth, check if user needs profile completion
  const session = await getSession();

  if (session?.user && !session.user.profileComplete) {
    return `${baseUrl}/complete-profile`;
  }

  // Default to members for complete profiles
  return `${baseUrl}/members`;
}
```

---

## 📊 **Current Statistics Explained**

```
Total Users: 24
Total Members: 22
Missing: 2 users
```

**The 2 missing users:**

- ✅ Signed up via OAuth (Google or Facebook)
- ✅ User record created
- ✅ emailVerified set
- ❌ Never reached `/complete-profile` page
- ❌ Never called `completeSocialLoginProfile()`
- ❌ No Member record created
- ❌ profileComplete: false
- ❌ INVISIBLE in members list

---

## ✅ **Verification Checklist**

To verify this is the bug, check the 2 missing users:

```sql
-- Find users without members
SELECT
  u.id,
  u.email,
  u."emailVerified",
  u."profileComplete",
  u.provider,
  u."oauthVerified",
  a.provider AS "accountProvider"
FROM "User" u
LEFT JOIN "Member" m ON u.id = m."userId"
LEFT JOIN "Account" a ON u.id = a."userId"
WHERE m.id IS NULL;
```

**Expected result:**

- These 2 users have:
  - `emailVerified`: [Date] ✅
  - `profileComplete`: false ❌
  - `provider`: "google" or "facebook" ✅
  - `oauthVerified`: true ✅
  - `member`: NULL ❌

---

## 🎯 **Summary**

### **The Bug:**

OAuth users are redirected to `/members` immediately after sign-in, bypassing `/complete-profile` page, so `completeSocialLoginProfile()` is never called, and Member record is never created.

### **The Fix:**

Add proper redirect logic to send OAuth users to `/complete-profile` if they don't have a Member record yet.

### **Files to Change:**

1. `src/app/(auth)/login/SocialLogin.tsx` - Remove hardcoded callbackUrl OR change to `/complete-profile`
2. `src/auth.ts` - Add `redirect` callback to check `profileComplete`
3. `src/middleware.ts` - Optionally enforce profile completion

---

**Next Step: Show me which fix option you prefer, and I'll implement it with comprehensive logging.**
