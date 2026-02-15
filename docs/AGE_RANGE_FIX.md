# Age Range Filter – Production-Safe Fix

## Problems Fixed

### 1. **Incorrect DB filtering**
- **Before**: `minDob = addYears(today, -maxAge - 1)` and `maxDob = addYears(today, -minAge)`  
  For age [25, 32] this included 33-year-olds.
- **After**: `minDob = addYears(today, -maxAge)`, `maxDob = addYears(today, -minAge)`  
  So age [25, 32] ⇒ `dateOfBirth` between (today − 32 years) and (today − 25 years). Filtering is correct at DB level.

### 2. **Infinite re-render / refetch loop**
- **Cause 1 – Slider**: `onChange` fired on every drag tick → `batchUpdate` on every tick → store update → new `preferences` reference → queryKey (object) changed → refetch → re-render → loop.
- **Cause 2 – queryKey**: Key was `["members", stableObj]` with an object. Any new `preferences` reference (e.g. after hydration or another update) produced a new object in the key → refetch even when values were unchanged.
- **Cause 3 – useEffect syncing**: Any `useEffect` that set age from URL/store and then wrote back to store could cause: set store → re-render → effect runs → set store again → loop.

### 3. **ageMin > ageMax**
- No guard; invalid ranges could be stored and used in the query.
- **After**: `normalizeAgeRange()` clamps to 18–100 and ensures `ageMin <= ageMax` in UI, store, and API.

---

## Fixes Applied

### 1. **DB (memberActions.ts)**
- Parse `ageRange` into `minAgeNum`, `maxAgeNum`.
- If `minAgeNum > maxAgeNum`, swap and clamp to 18–100.
- Birthdate bounds:
  - `minDob = addYears(currentDate, -maxAgeNum)` (oldest birth date = at most maxAge).
  - `maxDob = addYears(currentDate, -minAgeNum)` (youngest birth date = at least minAge).
- Prisma: `dateOfBirth: { gte: minDob, lte: maxDob }`.

### 2. **Slider (UnifiedFilterPanel.tsx)**
- **Local state while dragging**: `localAgeRange: [number, number] | null`.  
  Display value = `localAgeRange ?? [preferences.ageMin, preferences.ageMax]`.
- **onChange**: Only `setLocalAgeRange([v0, v1])` — no store or API calls.
- **onChangeEnd**: Call `onAgeRangeChange(min, max)` with `normalizeAgeRange(min, max)`, then `setLocalAgeRange(null)`.
- Result: One store update and one refetch per drag, not per tick.

### 3. **Store (searchPreferencesStore.ts)**
- **normalizeAgeRange(min, max)**: Clamp to 18–100 and ensure `min <= max`.
- **updatePreference("ageMin" | "ageMax")**: Normalize both ages, then **return early** if `state.preferences.ageMin === min && state.preferences.ageMax === max` to avoid no-op updates and new references.
- **batchUpdate**: If updates include age, normalize; if normalized range equals current range and the rest of `updates` is empty, return without setting state.
- Prevents unnecessary object recreation and duplicate refetches.

### 4. **React Query (useMembersQuery.ts)**
- **Primitive-only queryKey**:  
  `["members", genderKey, ageMin, ageMax, cityKey, interestsKey, withPhoto, orderByKey, pageNumber, pageSize, urlParamsString, lat, lon]`.
- Key depends only on primitive values (numbers, strings), not on the `preferences` object reference.
- When the store updates with the same age/gender/city/etc., the key is unchanged → no refetch, no loop.

---

## Why This Prevents the Infinite Loop

1. **Slider**: Store is updated only on **onChangeEnd**, so at most one update per drag.
2. **Store**: No update when normalized age range is unchanged (early return).
3. **queryKey**: Uses primitives; same values ⇒ same key ⇒ no refetch.
4. **No useEffect syncing**: Age comes only from store (and DB on hydration). Slider reads from store (or local state while dragging) and writes only on drag end. No effect that “syncs” age and writes back.

---

## Files Touched

| File | Change |
|------|--------|
| `src/app/actions/memberActions.ts` | Correct minDob/maxDob, parse age range, guard min ≤ max, clamp 18–100 |
| `src/components/search/UnifiedFilterPanel.tsx` | Local state during drag, `onChangeEnd` only for commit, `normalizeAgeRange` |
| `src/stores/searchPreferencesStore.ts` | `normalizeAgeRange`, early return when age unchanged, normalize in batchUpdate |
| `src/hooks/useMembersQuery.ts` | Primitive-only queryKey (no object in key) |

---

## Correct Prisma Filter (reference)

```ts
// ageMin = 25, ageMax = 32
const minDob = addYears(new Date(), -32); // oldest birth date
const maxDob = addYears(new Date(), -25); // youngest birth date

where: {
  dateOfBirth: {
    gte: minDob,
    lte: maxDob,
  },
}
```

---

## Safe Slider Pattern (reference)

```tsx
const [localAgeRange, setLocalAgeRange] = useState<[number, number] | null>(null);

<Slider
  value={localAgeRange ?? [preferences.ageMin, preferences.ageMax]}
  onChange={(v) => setLocalAgeRange([v[0], v[1]])}
  onChangeEnd={(v) => {
    const [min, max] = normalizeAgeRange(v[0], v[1]);
    onAgeRangeChange(min, max);
    setLocalAgeRange(null);
  }}
/>
```
