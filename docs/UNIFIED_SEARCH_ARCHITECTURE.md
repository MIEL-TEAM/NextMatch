# 🏗️ Unified Search System - Complete Architecture

**Version**: 2.0 - Production Grade  
**Single Source of Truth**: UserSearchPreference (Database)

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                   UNIFIED SEARCH ARCHITECTURE                       │
│                   Single Source of Truth: Database                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1: DATABASE (Single Source of Truth)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────┐            │
│  │  UserSearchPreference (Prisma Model)              │            │
│  ├───────────────────────────────────────────────────┤            │
│  │  - userId: String (unique, indexed)               │            │
│  │  - gender: String[]                               │            │
│  │  - ageMin: Int                                    │            │
│  │  - ageMax: Int                                    │            │
│  │  - city: String?                                  │            │
│  │  - interests: String[]                            │            │
│  │  - withPhoto: Boolean                             │            │
│  │  - orderBy: String                                │            │
│  │  - updatedAt: DateTime                            │            │
│  └───────────────────────────────────────────────────┘            │
│                        ↑           ↓                                │
│                    Write       Read (on hydration)                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↑           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 2: SERVER ACTIONS (API Gateway)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  getUserSearchPreferences(userId)                                  │
│  ├─ Fetches from DB                                               │
│  ├─ Creates defaults if not exists                                │
│  └─ Returns UserSearchPreference                                  │
│                                                                     │
│  updateUserSearchPreferences(userId, updates)                      │
│  ├─ Upserts to DB                                                 │
│  ├─ Invalidates smart_match_cache                                 │
│  ├─ Revalidates /members and /smart-matches                       │
│  └─ Returns updated preferences                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↑           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 3: CLIENT STATE (Zustand Cache)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────┐            │
│  │  SearchPreferencesStore (Zustand)                 │            │
│  ├───────────────────────────────────────────────────┤            │
│  │  State:                                           │            │
│  │  ├─ preferences: SearchPreferences | null        │            │
│  │  ├─ userId: string | null                        │            │
│  │  ├─ isLoading: boolean                           │            │
│  │  ├─ isHydrated: boolean                          │            │
│  │  └─ isSyncing: boolean                           │            │
│  │                                                   │            │
│  │  Actions:                                         │            │
│  │  ├─ hydrate(userId)                              │            │
│  │  │   └─ Loads from DB → populates store         │            │
│  │  ├─ updatePreference(key, value)                 │            │
│  │  │   ├─ Optimistic update                        │            │
│  │  │   ├─ Persist to DB                            │            │
│  │  │   └─ Rollback on error                        │            │
│  │  ├─ batchUpdate(updates)                         │            │
│  │  │   └─ Efficient multi-field update             │            │
│  │  └─ setRuntimeLocation(lat, lon)                 │            │
│  │       └─ Temporary location (not persisted)      │            │
│  └───────────────────────────────────────────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 4: HYDRATION (Auto-Loading)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SearchPreferencesProvider (wraps app)                             │
│      ↓                                                             │
│  useSearchPreferencesHydration()                                   │
│      ├─ Watches session state                                     │
│      ├─ On user login → hydrate(userId)                           │
│      ├─ On user logout → reset()                                  │
│      └─ Prevents duplicate hydration                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 5: CONSUMERS (React Components & Hooks)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │  SearchModal           │  │  /members Page         │           │
│  ├────────────────────────┤  ├────────────────────────┤           │
│  │  • Reads from store    │  │  • useMembersQuery     │           │
│  │  • Updates via actions │  │  • Reads from store    │           │
│  │  • Auto-persists to DB │  │  • Executes queries    │           │
│  └────────────────────────┘  └────────────────────────┘           │
│                                                                     │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │  SmartMatches          │  │  Filter UI             │           │
│  ├────────────────────────┤  ├────────────────────────┤           │
│  │  • useSmartMatches     │  │  • UnifiedFilterPanel  │           │
│  │  • Reads from store    │  │  • Reads from store    │           │
│  │  • Auto-invalidates    │  │  • Updates via actions │           │
│  └────────────────────────┘  └────────────────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 6: URL (Read-Only Reflection)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  URL reflects current filter state for:                            │
│  ✅ Shareability (copy/paste links)                                │
│  ✅ Browser back/forward navigation                                │
│  ✅ Deep linking                                                    │
│                                                                     │
│  BUT URL is NOT source of truth:                                   │
│  ❌ Does not control store state                                   │
│  ❌ Does not override DB preferences                               │
│  ❌ Does not trigger re-hydration                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### User Login Flow
```
User logs in
    ↓
SessionProvider updates
    ↓
SearchPreferencesProvider detects session
    ↓
Calls hydrate(userId)
    ↓
Fetches UserSearchPreference from DB
    ↓
Populates SearchPreferencesStore
    ↓
Sets isHydrated = true
    ↓
Components re-render with user preferences
    ↓
Queries execute with DB preferences
```

### Filter Change Flow
```
User changes filter in UI
    ↓
Component calls updatePreference(key, value)
    ↓
Store updates immediately (optimistic)
    ↓
Component re-renders with new value
    ↓
Background: updateUserSearchPreferences() called
    ↓
DB updated via Prisma
    ↓
smart_match_cache invalidated
    ↓
/members path revalidated
    ↓
React Query refetches with new preferences
    ↓
If error: Store rolls back to previous value
```

### Search Execution Flow
```
User clicks "צפה/י בהתאמות"
    ↓
SearchModal.executeSearch()
    ↓
Reads current preferences from store
    ↓
Builds URL params from preferences
    ↓
router.push(/members?gender=female&city=נתניה...)
    ↓
/members page mounts
    ↓
useMembersQuery reads from store (not URL!)
    ↓
Executes query with normalized city name
    ↓
Results displayed
    ↓
URL reflects state (for sharing/bookmarking)
```

### Cross-Tab Sync Flow
```
Tab 1: User changes city to "נתניה"
    ↓
Tab 1: Store updates + persists to DB
    ↓
Tab 2: User navigates to /members
    ↓
Tab 2: Store hydrates from DB
    ↓
Tab 2: Sees "נתניה" in preferences ✅
    ↓
Both tabs now synchronized via DB
```

---

## 🎯 Key Features

### 1. Single Source of Truth
```typescript
// BEFORE: Multiple sources
localStorage.getItem('citySearch')    // Source 1
useFilterStore().filters.city         // Source 2
searchParams.get('city')              // Source 3

// AFTER: Single source
const city = useSearchPreferencesStore(state => state.preferences?.city)
// Hydrated from: UserSearchPreference table (DB)
```

### 2. Optimistic Updates
```typescript
updatePreference("city", "תל אביב")
// ↓ Immediate: UI updates instantly
// ↓ Background: Saves to DB
// ↓ On error: Rolls back to previous value
```

### 3. City Normalization
```typescript
// User selects: "נתניה, ישראל" (Google Places format)
// Stored in DB: "נתניה, ישראל"
// Query uses: "נתניה" (extracted before comma)

WHERE city ILIKE '%נתניה%'  // ✅ Finds matches
```

### 4. Selector Optimization
```typescript
// BEFORE: Re-renders on ANY store change
const store = useSearchPreferencesStore()

// AFTER: Re-renders only when gender changes
const gender = useSearchPreferencesStore(selectGender)
```

---

## 🔐 State Persistence Guarantees

| Scenario | Before | After |
|----------|--------|-------|
| **Page reload** | ❌ Lost (unless in URL) | ✅ Preserved (from DB) |
| **Browser close/open** | ❌ Lost | ✅ Preserved (from DB) |
| **Tab switch** | ❌ Inconsistent | ✅ Synchronized (via DB) |
| **Device switch** | ❌ Lost | ✅ Preserved (future: sync) |
| **User logout** | ❌ Persists incorrectly | ✅ Cleared properly |
| **User switch** | ❌ Shows wrong user data | ✅ Switches correctly |

---

## 🚀 Performance Optimizations

### Database Query Optimization
```sql
-- City filter uses normalized string
WHERE city ILIKE '%נתניה%'  -- Uses index

-- Age filter uses indexed dateOfBirth
WHERE dateOfBirth >= '1991-01-01' AND dateOfBirth <= '2006-01-01'

-- Gender filter uses indexed field
WHERE gender IN ('female')

-- Compound query is fully indexed
WHERE 
  dateOfBirth >= $1 AND dateOfBirth <= $2
  AND gender IN ($3)
  AND city ILIKE $4
```

### React Re-render Optimization
```typescript
// Selective subscription with selectors
const gender = useSearchPreferencesStore(selectGender)
// Component only re-renders when gender changes, not on every store update

// Batch updates
batchUpdate({ ageMin: 25, ageMax: 35, city: "תל אביב" })
// Single DB write, single re-render
```

### Cache Strategy
```typescript
// Smart match cache invalidation
updateUserSearchPreferences(userId, updates)
  ↓
await prisma.smartMatchCache.deleteMany({ where: { userId } })
  ↓
Next smart match fetch will recompute with new preferences
```

---

## 📊 Scalability

### For 100k+ Users

**Database**:
- ✅ Indexed queries (no full table scans)
- ✅ Efficient upsert operations
- ✅ Proper cache invalidation

**Client**:
- ✅ Minimal state (only current user preferences)
- ✅ Selector-based re-renders
- ✅ Optimistic updates (perceived performance)

**Server**:
- ✅ Server actions (edge-ready)
- ✅ Batch database operations
- ✅ Revalidation paths (ISR-friendly)

---

## 🐛 Error Handling

### Network Failure
```typescript
updatePreference("city", "חיפה")
  ↓ Store updates immediately (optimistic)
  ↓ Background save fails
  ↓ Store rolls back to previous value
  ↓ User sees error toast
```

### Hydration Failure
```typescript
hydrate(userId)
  ↓ DB fetch fails
  ↓ Store falls back to default preferences
  ↓ Sets error state
  ↓ User can still use app with defaults
```

### Race Conditions
```typescript
// Multiple rapid updates
updatePreference("ageMin", 20)
updatePreference("ageMin", 25)
updatePreference("ageMin", 30)
  ↓ Store updates immediately for each
  ↓ Last write wins in DB
  ↓ Final state: ageMin = 30 ✅
```

---

## ✅ Production Checklist

### Database
- [x] UserSearchPreference table created
- [x] userId index exists
- [x] Default values configured
- [x] Cascade delete on user deletion

### Backend
- [x] getUserSearchPreferences implemented
- [x] updateUserSearchPreferences implemented
- [x] Cache invalidation works
- [x] Revalidation paths configured

### Frontend
- [x] SearchPreferencesStore created
- [x] Hydration hook implemented
- [x] Provider wraps app
- [x] All components use store

### Integration
- [x] SearchModal refactored
- [x] /members page refactored
- [x] SmartMatches integrated
- [x] URL sync works

### Testing
- [x] Unit tests for store actions
- [x] Integration tests for hydration
- [x] E2E tests for full flow
- [x] Performance benchmarks

---

## 📚 Code Examples

### Reading from Store
```typescript
// In any component
import { useSearchPreferencesStore } from "@/stores/searchPreferencesStore";

function MyComponent() {
  const preferences = useSearchPreferencesStore(state => state.preferences);
  const isHydrated = useSearchPreferencesStore(state => state.isHydrated);
  
  if (!isHydrated) return <Loading />;
  
  return <div>City: {preferences?.city}</div>;
}
```

### Updating Preferences
```typescript
// In filter component
const updatePreference = useSearchPreferencesStore(state => state.updatePreference);

function handleCityChange(city: string) {
  updatePreference("city", city);
  // ✅ Instantly updates UI
  // ✅ Automatically saves to DB
  // ✅ Invalidates smart match cache
}
```

### Batch Updates
```typescript
// When multiple fields change together
const batchUpdate = useSearchPreferencesStore(state => state.batchUpdate);

function handleAgeRangeChange(min: number, max: number) {
  batchUpdate({ ageMin: min, ageMax: max });
  // ✅ Single DB write
  // ✅ Single re-render
}
```

---

**Architecture Status**: ✅ Production Ready  
**Documentation Status**: ✅ Complete  
**Ready to Deploy**: 🚀 Yes
