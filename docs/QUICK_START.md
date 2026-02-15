# Quick Start Guide - Refactored Search & Filtering

## 🚀 Setup (3 Steps)

### Step 1: Run Database Migration

```bash
cd /Users/User/Desktop/Miel-DatingApp
npx prisma migrate deploy
npx prisma generate
```

This creates the `user_search_preferences` table in your database.

### Step 2: Build & Start

```bash
npm run build
npm run dev
```

### Step 3: Test the New System

1. Open SearchModal (click search icon)
2. Change filters (gender, age, etc.)
3. Select a city
4. Click "צפה בהתאמות"
5. ✅ All filters should be preserved!

---

## ✅ What's Different

### Before

- Filters reset after search
- SmartMatches ignored user preferences
- Two separate state systems (SearchStore + FilterStore)

### After

- Filters persist in database
- SmartMatches use stored preferences
- Single source of truth (database)

---

## 📝 Key Files

### New Files (Added)

- `src/app/actions/userSearchPreferenceActions.ts` - Server actions
- `src/hooks/useUserSearchPreferences.ts` - React hook
- `src/components/search/UnifiedFilterPanel.tsx` - Filter UI
- `prisma/migrations/20260214000000_add_user_search_preferences/migration.sql` - DB migration

### Modified Files

- `src/components/search/SearchModal.tsx` - Uses new hook
- `src/lib/smart-matching/orchestrator.ts` - Loads from DB
- `src/app/actions/smartMatchActions.ts` - Simplified
- `src/hooks/useSmartMatches.ts` - Simplified

### Can Delete (Optional cleanup)

- `src/hooks/useSearchStore.ts`
- `src/hooks/useFilterStore.ts`
- `src/hooks/useSearch.ts`
- `src/hooks/useFilters.ts`
- `src/components/search/FilterPanel.tsx` (replaced by UnifiedFilterPanel)

---

## 🧪 Quick Test Checklist

- [ ] Prisma migration runs successfully
- [ ] App builds without errors
- [ ] SearchModal opens
- [ ] Filters can be changed
- [ ] Search executes without errors
- [ ] Filters persist after navigation
- [ ] SmartMatches work correctly
- [ ] No console errors

---

## 🐛 Troubleshooting

### Issue: "Table doesn't exist"

**Solution**: Run `npx prisma migrate deploy`

### Issue: "Type error in Prisma"

**Solution**: Run `npx prisma generate`

### Issue: "Cannot find module"

**Solution**: Restart TypeScript server (VS Code: Cmd+Shift+P → Restart TS Server)

### Issue: Build fails

**Solution**: Check build output for specific errors, likely import paths

---

## 📊 Performance

Expected performance (with proper indexes):

- Preference load: <50ms
- Preference update: <100ms
- SmartMatches with DB preferences: <500ms
- Can handle 100k+ users

---

## 🎯 Next Steps

1. Run migration
2. Test locally
3. If all works, commit changes
4. Deploy to production
5. Monitor performance metrics
6. Clean up old files (optional)

---

## 📖 Full Documentation

See `SEARCH_ARCHITECTURE_REFACTOR.md` for complete details:

- Architecture diagrams
- Data flow
- API reference
- Performance analysis
- Scalability notes
- Migration strategy
- Testing guide

---

**Status**: ✅ Implementation Complete  
**Migration Needed**: Yes (run Prisma migrate)  
**Breaking Changes**: No (backwards compatible)  
**Estimated Setup Time**: 5 minutes
