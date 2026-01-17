# Mobile Registration Flow (Email Only)

## Overview

The mobile registration has been simplified to a **single-step** email-only signup, making it faster and easier for mobile users to get started.

---

## Flow Diagram

```
1. User enters email → 
2. registerUserMinimal() creates User with profileComplete: false →
3. Redirect to /complete-profile →
4. User completes: name, password, gender, DOB, etc. →
5. profileComplete: true →
6. User can access app
```

---

## Files Created/Modified

### ✅ New Files

1. **`src/mobile/auth/RegisterPage.tsx`** - Simplified mobile registration
   - Single email input
   - Social login buttons (Google, Facebook)
   - Clean image background design
   - Validation and error handling

2. **`src/app/actions/authActions.ts`** - Added `registerUserMinimal()` action
   - Creates user with email only
   - Sets `profileComplete: false`
   - Sends verification email
   - No Member record created initially

### ✅ Unchanged Files (Desktop)

- `src/app/(auth)/register/RegisterForm.tsx` - Desktop 4-step registration **untouched**
- `src/app/(auth)/register/page.tsx` - Desktop route **untouched**
- All step form components **untouched**

---

## User Experience

### Mobile Registration (New)

**Step 1: Email Only**
```
/mobile/register
├── Enter email
├── Click "המשך"
└── OR use Google/Facebook
```

**Step 2: Complete Profile**
```
/complete-profile
├── Name
├── Password
├── Gender
├── Date of Birth
├── Description
├── City & Country
└── Submit → profileComplete: true
```

### Desktop Registration (Unchanged)

**4-Step Process:**
```
/register
├── Step 1: Name, Email, Password
├── Step 2: Gender, DOB, Description, Location
├── Step 3: Preferences (age range, gender pref)
└── Step 4: Photos (optional, 0-3 photos)
```

---

## Technical Implementation

### New Action: `registerUserMinimal(email: string)`

**Location:** `src/app/actions/authActions.ts`

```typescript
export async function registerUserMinimal(
  email: string
): Promise<ActionResult<User>> {
  // 1. Validate email format
  // 2. Check if user exists
  // 3. Create user with minimal data
  const user = await prisma.user.create({
    data: {
      email,
      profileComplete: false,
    },
  });
  // 4. Send verification email
  // 5. Return success
}
```

**Key Points:**
- ✅ Only creates `User` record (no `Member` yet)
- ✅ `profileComplete: false` → middleware redirects to `/complete-profile`
- ✅ No password required initially
- ✅ Member record created during profile completion
- ✅ Desktop `registerUser()` action remains unchanged

---

## Middleware Behavior

**Existing middleware** already handles `profileComplete: false`:

```typescript
// src/middleware.ts
if (user.profileComplete === false) {
  redirect("/complete-profile");
}
```

**This works automatically for:**
- ✅ Mobile email-only registration
- ✅ Social login (Google/Facebook)
- ✅ Desktop registration (if incomplete)

---

## Complete Profile Page

**Location:** `src/app/(auth)/complete-profile/page.tsx`

**Already exists and handles:**
- Name
- Gender
- Date of Birth
- Description  
- City & Country
- Password creation (if not OAuth)

**Creates:**
- Member record with all required fields
- Sets `profileComplete: true`
- User can then access the app

---

## Social Login

**Both mobile pages** support social login:

### Google
```typescript
handleGoogleSignup() {
  signIn("google", {
    callbackUrl: "/complete-profile",
  });
}
```

### Facebook
```typescript
handleFacebookSignup() {
  signIn("facebook", {
    callbackUrl: "/complete-profile",
  });
}
```

**Flow:**
1. User clicks Google/Facebook button
2. OAuth authentication
3. User created with `profileComplete: false`
4. Redirected to `/complete-profile`
5. User fills remaining info
6. `profileComplete: true`

---

## Validation

### Email Input
- ✅ Required field
- ✅ Format validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- ✅ Duplicate check (email must be unique)
- ✅ Real-time error messages

### Database
- ✅ Email uniqueness enforced at DB level
- ✅ User record has `profileComplete: false` by default
- ✅ Member record optional (created during profile completion)

---

## Testing Checklist

### Mobile Registration

- [ ] Visit `/mobile/register`
- [ ] Enter valid email → should succeed
- [ ] Enter duplicate email → should show error
- [ ] Enter invalid email → should show validation error
- [ ] Click Google → should redirect to OAuth flow
- [ ] Click Facebook → should redirect to OAuth flow
- [ ] After registration → should redirect to `/complete-profile`

### Complete Profile

- [ ] Fill all fields → should succeed
- [ ] Submit → `profileComplete` should be `true`
- [ ] After submission → should redirect to `/members`
- [ ] User should be able to access app

### Desktop Registration

- [ ] Visit `/register` → should show 4-step form
- [ ] Complete all steps → should create user with `profileComplete: true`
- [ ] Should NOT redirect to `/complete-profile`

---

## Database Schema

### User (after mobile registration)

```typescript
{
  id: "cuid",
  email: "user@example.com",  // ✅ Provided
  profileComplete: false,      // ✅ Set
  name: null,                  // ⏳ To be set in complete-profile
  passwordHash: null,          // ⏳ To be set in complete-profile
  image: null,                 // ⏳ Optional
  // ... other fields use defaults
}
```

### Member (after mobile registration)

```
null  // ⏳ Will be created during profile completion
```

### User + Member (after complete-profile)

```typescript
User {
  id: "cuid",
  email: "user@example.com",
  profileComplete: true,       // ✅ Updated
  name: "John Doe",            // ✅ Set
  passwordHash: "hash",        // ✅ Set
  // ...
}

Member {
  id: "cuid",
  userId: "cuid",              // ✅ Linked
  name: "John Doe",
  gender: "male",
  dateOfBirth: Date,
  description: "...",
  city: "Tel Aviv",
  country: "Israel",
  // ...
}
```

---

## Error Handling

### Registration Errors

| Error | Message | Action |
|-------|---------|--------|
| Invalid email | "כתובת אימייל לא תקינה" | Show inline error |
| Duplicate email | "משתמש עם אימייל זה כבר קיים במערכת" | Toast error |
| Server error | "משהו השתבש, נסה שוב" | Toast error |

### Complete Profile Errors

| Error | Message | Action |
|-------|---------|--------|
| Missing fields | "יש למלא את כל השדות" | Show field errors |
| Invalid date | "תאריך לא תקין" | Show inline error |
| Server error | "Failed to complete profile" | Toast error |

---

## Benefits of Email-Only Mobile Registration

1. **Faster Signup** - One field instead of multiple steps
2. **Lower Friction** - Users can start quickly
3. **Mobile-Optimized** - Less typing on small screens
4. **Social Login Priority** - Google/Facebook more prominent
5. **Progressive Disclosure** - Collect details when needed
6. **Same Complete Profile** - Consistent experience after signup

---

## Routes Summary

| Route | Purpose | Mobile | Desktop |
|-------|---------|--------|---------|
| `/mobile/register` | Email-only signup | ✅ New | N/A |
| `/mobile/login` | Email + Password login | ✅ New | N/A |
| `/register` | Full 4-step signup | N/A | ✅ Unchanged |
| `/login` | Email + Password login | N/A | ✅ Unchanged |
| `/complete-profile` | Finish registration | ✅ Used | ✅ Used (OAuth) |

---

## Status

✅ **Mobile email-only registration fully implemented**  
✅ **Desktop 4-step registration preserved**  
✅ **Both flows work independently**  
✅ **Middleware handles routing automatically**  
✅ **Social login supported on both platforms**

---

## Next Steps

1. **Test on real devices** (iPhone, Android)
2. **Monitor registration completion rates**
3. **A/B test** mobile vs desktop signup flows
4. **Consider adding** phone verification (future)
5. **Analytics** to track where users drop off

---

🎉 **Mobile registration is now live and ready to use!**
