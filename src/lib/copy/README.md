# MIEL Copy System

A context-aware, gender-aware copy system for the MIEL dating app.

## Overview

This system allows MIEL to speak to users in the right tone—personal when it matters, neutral when it doesn't—without cluttering components with gender logic.

## Architecture

```
lib/copy/
  ├── index.ts              # Main export
  ├── useCopy.ts            # React hook for components
  ├── engine.ts             # Core logic (gender detection, variant selection)
  ├── contexts.ts           # Copy context definitions
  ├── types.ts              # TypeScript types
  └── copy-data/
      ├── index.ts          # Copy registry
      ├── interests.ts      # Interests page copy
      ├── onboarding.ts     # Onboarding copy
      └── empty-states.ts   # Empty state copy
```

## Key Principles

### 1. Components Don't Know About Gender

❌ **Wrong:**

```tsx
function MyComponent({ user }) {
  return <h1>{user.gender === "male" ? "ברוך הבא" : "ברוכה הבאה"}</h1>;
}
```

✅ **Right:**

```tsx
function MyComponent() {
  const { t } = useCopy("onboarding");
  return <h1>{t("welcome.header")}</h1>;
}
```

### 2. Context Determines Tone

Copy behavior is controlled by **context**, not by manual decisions in components.

**Contexts:**

- `onboarding` - Personal, welcoming (gendered allowed)
- `interests` - Personal, identity-focused (gendered allowed)
- `encouragement` - Warm support (gendered allowed)
- `empty_state` - Neutral, informative (always neutral)
- `system` - System messages (always neutral)
- `settings` - Functional UI (always neutral)
- `legal` - Terms, privacy (always neutral)

### 3. Always Has Neutral Fallback

Every copy entry **must** have a `neutral` variant. Gendered variants (`male`, `female`) are optional.

```typescript
{
  "interests.header": {
    neutral: "מה עושה לכם טוב?",    // Required
    male: "מה עושה לך טוב?",        // Optional
    female: "מה עושה לך טוב?",      // Optional
  }
}
```

If gender is unavailable or context doesn't allow gendered copy, the system returns `neutral`.

## Usage

### Basic Usage

```tsx
import { useCopy } from "@/lib/copy";

function InterestsPage() {
  const { t } = useCopy("interests"); // Specify context

  return (
    <div>
      <h1>{t("interests.header")}</h1>
      <p>{t("interests.subtitle")}</p>
    </div>
  );
}
```

### How It Works Internally

1. **Component calls `useCopy('interests')`**

   - Hook gets user session
   - Detects gender from session (male/female/null)

2. **Component calls `t('interests.header')`**

   - Engine checks if `interests` context allows gendered copy (yes)
   - If gender exists and variant exists, returns gendered version
   - Otherwise, returns neutral version

3. **No gender logic in component** ✅

## Adding New Copy

### Step 1: Choose Context

Decide which context fits the copy's purpose:

- Is it personal/emotional? → `onboarding`, `interests`, `encouragement`
- Is it informative/functional? → `empty_state`, `system`, `settings`
- Is it legal? → `legal`

### Step 2: Add to Copy Data

```typescript
// lib/copy/copy-data/interests.ts
export const interestsCopy: Record<string, CopyVariants> = {
  "interests.new_key": {
    neutral: "נטריאלי", // Required
    male: "זכר", // Optional
    female: "נקבה", // Optional
  },
};
```

### Step 3: Use in Component

```tsx
const { t } = useCopy("interests");
return <div>{t("interests.new_key")}</div>;
```

## Decision Flow

```
Component requests copy
         ↓
   useCopy hook detects gender from session
         ↓
   Engine receives: (variants, context, gender)
         ↓
   Check: Does context allow gendered copy?
         ↓
    NO → Return neutral
    YES → Check: Do we have gender + variant?
           ↓
       YES → Return gendered variant
        NO → Return neutral
```

## Current Implementation Status

### ✅ Implemented Screens (3)

1. **Interests Page** - Header + subtitle (gender-aware)
2. **Register Success Page** - Header + subtitle + CTA (gender-aware)
3. **Members Empty State** - Message + submessage (neutral only)

### 📦 Ready for Expansion

The system is ready to scale:

- Add new copy to `copy-data/` files
- Import in components with `useCopy(context)`
- No changes to engine or infrastructure needed

## Why This Approach?

### ✅ Scalable

- Add hundreds of copy entries without touching core logic
- Works for any language (not just Hebrew)

### ✅ Maintainable

- Copy is centralized, not scattered across components
- Easy to audit and update

### ✅ Type-Safe

- TypeScript ensures copy keys exist
- Contexts are strongly typed

### ✅ Clean Components

- Components focus on UI, not copy logic
- Gender detection is abstracted away

### ✅ Product-Driven

- Context rules are defined once, applied everywhere
- Product team controls tone through contexts

## Technical Details

### Gender Detection

```typescript
CopyEngine.detectGender(user);
// Returns: 'male' | 'female' | null
```

Checks `user.gender` field from session:

- "male" / "m" → `male`
- "female" / "f" → `female`
- Anything else → `null`

### Context Rules

Defined in `contexts.ts`:

```typescript
export const CONTEXT_RULES = {
  onboarding: { allowGendered: true }, // Personal
  interests: { allowGendered: true }, // Personal
  empty_state: { allowGendered: false }, // Always neutral
  // ...
};
```

## Best Practices

### ✅ DO:

- Use `useCopy(context)` for all new UI text
- Write neutral variant first
- Add gendered variants only for emotional/personal contexts
- Keep context consistent within a component

### ❌ DON'T:

- Hardcode Hebrew text in components
- Add gender checks in components (`if (gender === 'male')`)
- Use gendered copy in system/functional contexts
- Mix multiple contexts in one component

## Examples

### Example 1: Personal Copy (Gendered)

```tsx
// Interests page - emotional, identity-focused
const { t } = useCopy("interests");

return (
  <>
    <h1>{t("interests.header")}</h1>
    {/* Returns:
      - Male user: "מה עושה לך טוב?"
      - Female user: "מה עושה לך טוב?"
      - Unknown: "מה עושה לכם טוב?"
    */}
  </>
);
```

### Example 2: System Copy (Always Neutral)

```tsx
// Empty state - informative, not personal
const { t } = useCopy('empty_state');

return (
  <EmptyState message={t('members.no_results.header')} />
  {/* Always returns: "לא נמצאו תוצאות בטווח הגילאים שנבחר"
      (Passive voice, gender-neutral)
  */}
);
```

## Future Enhancements

### Phase 2 (Future)

- Add more screens (premium, profile, AI assistant)
- Add more copy entries
- Add localization support (English, etc.)

### Phase 3 (Future)

- Optional: User preference override ("always use neutral")
- Optional: Non-binary gender support
- Optional: A/B testing integration

## Questions?

This is foundational infrastructure. It's designed to:

- Scale for years
- Stay invisible when working correctly
- Make product decisions easy

For questions or suggestions, contact the product team.
