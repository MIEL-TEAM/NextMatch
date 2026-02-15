# 🚀 Deployment Checklist - Search & Filtering Refactor

## ✅ Pre-Deployment Checklist

### 1. Database Migration
- [ ] Review migration file: `prisma/migrations/20260214000000_add_user_search_preferences/migration.sql`
- [ ] Run in development: `npx prisma migrate deploy`
- [ ] Verify table created: `npx prisma studio` → check user_search_preferences table
- [ ] Verify indexes created: Check PostgreSQL indexes
- [ ] Generate Prisma client: `npx prisma generate`

### 2. Code Compilation
- [ ] Run build: `npm run build`
- [ ] Fix any TypeScript errors
- [ ] No linter warnings
- [ ] All imports resolve correctly

### 3. Local Testing
- [ ] Start dev server: `npm run dev`
- [ ] Open SearchModal
- [ ] Change each filter type:
  - [ ] Gender selection
  - [ ] Age range slider
  - [ ] City autocomplete
  - [ ] Interests selection
  - [ ] With photo toggle
  - [ ] Order by dropdown
- [ ] Click "צפה בהתאמות"
- [ ] Verify URL contains all filters
- [ ] Navigate to /members
- [ ] Verify filters work
- [ ] Navigate to /smart-matches
- [ ] Verify SmartMatches respect preferences
- [ ] Refresh page
- [ ] Verify preferences persist
- [ ] Check browser console for errors
- [ ] Check server console for errors

### 4. Database Verification
- [ ] Open Prisma Studio: `npx prisma studio`
- [ ] Find your test user
- [ ] Verify user_search_preferences row exists
- [ ] Verify all fields populated correctly
- [ ] Check updatedAt timestamp updates

### 5. Performance Testing
- [ ] Open React Query DevTools
- [ ] Verify queries cached properly
- [ ] Test optimistic updates (instant UI)
- [ ] Verify no unnecessary re-renders
- [ ] Check network tab (minimal API calls)

---

## 🚀 Production Deployment Checklist

### Phase 1: Database Migration (Critical - Do First)

```bash
# 1. Backup production database first!
pg_dump -h [host] -U [user] -d [database] > backup_$(date +%Y%m%d).sql

# 2. Run migration in production
# Set DATABASE_URL to production
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy

# 3. Verify migration succeeded
npx prisma studio
# Check user_search_preferences table exists

# 4. Generate production Prisma client
npx prisma generate
```

**⚠️ CRITICAL**: Database migration must complete successfully before deploying application code!

### Phase 2: Application Deployment

```bash
# 1. Build application
npm run build

# 2. Run tests (if you have them)
npm test

# 3. Deploy to production
# (your deployment command here)
# e.g., vercel deploy --prod
#      or git push heroku main
#      or docker build && docker push
```

### Phase 3: Post-Deployment Verification

- [ ] Check application starts without errors
- [ ] Test SearchModal opens
- [ ] Test filter changes save to database
- [ ] Test SmartMatches load correctly
- [ ] Monitor error logs for issues
- [ ] Check database connections (no connection leaks)
- [ ] Verify performance metrics (response times < 100ms)

### Phase 4: Monitoring

- [ ] Set up database monitoring
- [ ] Monitor user_search_preferences table size
- [ ] Monitor query performance
- [ ] Monitor cache hit rates (React Query)
- [ ] Set up alerts for errors

---

## 🧪 Testing Scenarios

### Scenario 1: New User (Cold Start)
1. Create new account
2. Open SearchModal
3. **Expected**: Default preferences created automatically
4. **Verify**: Can change all filters
5. **Verify**: Filters persist after search

### Scenario 2: Existing User (Warm Start)
1. Login with existing account
2. Open SearchModal
3. **Expected**: Previously saved preferences loaded
4. **Verify**: Changes update database
5. **Verify**: SmartMatches use saved preferences

### Scenario 3: Filter Persistence
1. Change multiple filters
2. Search
3. Navigate away
4. Return to search
5. **Expected**: Filters still set correctly

### Scenario 4: SmartMatches Integration
1. Set specific preferences (e.g., female only, age 25-35)
2. Go to SmartMatches
3. **Expected**: Only see matches fitting preferences
4. **Verify**: Check match profiles match criteria

### Scenario 5: Cross-Device Sync
1. Set preferences on Device A
2. Login on Device B
3. **Expected**: Same preferences loaded
4. Change on Device B
5. Check Device A
6. **Expected**: Changes reflected

---

## 🐛 Rollback Plan

If something goes wrong in production:

### Option 1: Application Rollback (Recommended)
```bash
# 1. Rollback to previous application version
git revert [commit-hash]
# or
vercel rollback

# 2. Database table will remain (harmless)
# Old code won't use it, continues using old system

# 3. Fix issues locally, redeploy when ready
```

### Option 2: Full Rollback (Nuclear Option)
```bash
# 1. Rollback application first
# 2. Then rollback database migration
npx prisma migrate resolve --rolled-back 20260214000000_add_user_search_preferences

# 3. Drop table manually if needed
# psql -c "DROP TABLE user_search_preferences CASCADE;"
```

**⚠️ WARNING**: Full rollback loses all saved preferences!

---

## 📊 Success Metrics

Monitor these metrics post-deployment:

### Performance Metrics
- [ ] Preference load time < 50ms (p99)
- [ ] Preference update time < 100ms (p99)
- [ ] SmartMatches load time < 500ms (p99)
- [ ] No increase in error rate
- [ ] React Query cache hit rate > 80%

### Business Metrics
- [ ] Filter usage increases (users actually use filters)
- [ ] SmartMatches engagement improves
- [ ] Search completion rate (users complete search)
- [ ] Filter persistence reduces abandonment

### Technical Metrics
- [ ] Database connection pool stable
- [ ] No memory leaks
- [ ] Query performance stable
- [ ] Cache invalidation working correctly

---

## 🆘 Troubleshooting Guide

### Issue: Migration Fails

**Symptoms**: `prisma migrate deploy` errors

**Solutions**:
1. Check database connection: `npx prisma db pull`
2. Check for conflicting tables: `DROP TABLE IF EXISTS user_search_preferences;`
3. Check permissions: User needs CREATE TABLE permission
4. Check syntax: Review migration.sql for errors

### Issue: Preferences Not Saving

**Symptoms**: Changes don't persist, revert to defaults

**Solutions**:
1. Check server logs for errors
2. Verify `updateUserSearchPreferences` is called
3. Check database: `SELECT * FROM user_search_preferences WHERE userId='xxx'`
4. Verify network tab shows POST request succeeding
5. Check React Query DevTools for mutation status

### Issue: SmartMatches Ignore Preferences

**Symptoms**: SmartMatches show wrong candidates

**Solutions**:
1. Verify preferences exist in database
2. Check orchestrator loads preferences: Add console.log
3. Verify cache was invalidated: Check smart_match_cache table
4. Force cache refresh: Delete cache manually
5. Check retrieval uses preferences correctly

### Issue: Performance Degradation

**Symptoms**: Slow load times, high database load

**Solutions**:
1. Check database indexes exist: `\d user_search_preferences`
2. Monitor query times: Enable Prisma query logging
3. Check connection pool: Prisma connection limit
4. Review slow query log: PostgreSQL
5. Add read replicas if needed

### Issue: TypeScript Errors

**Symptoms**: Build fails with type errors

**Solutions**:
1. Regenerate Prisma client: `npx prisma generate`
2. Restart TypeScript server: VS Code command
3. Clear node_modules: `rm -rf node_modules && npm install`
4. Check import paths: Verify all imports resolve
5. Update @prisma/client: `npm update @prisma/client`

---

## 📞 Support Contacts

**Before deploying**:
- Review all documentation in `/docs` folder
- Test thoroughly in development
- Have rollback plan ready

**After deploying**:
- Monitor logs for 1 hour
- Check metrics dashboard
- Be ready to rollback if needed

**If issues arise**:
1. Check this troubleshooting guide first
2. Review server logs
3. Check database state
4. Consider rollback if critical

---

## ✅ Final Checklist

Before marking as "DONE":

- [ ] All code compiles without errors
- [ ] Database migration tested in development
- [ ] All manual tests passed
- [ ] Documentation reviewed
- [ ] Rollback plan prepared
- [ ] Monitoring set up
- [ ] Team notified of changes
- [ ] Production backup created
- [ ] Migration deployed to production
- [ ] Application deployed to production
- [ ] Post-deployment tests passed
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] Users can search successfully

---

**Status**: Ready for Deployment ✅

**Risk Level**: Low (backwards compatible, can rollback)

**Estimated Downtime**: 0 minutes (rolling deployment)

**Estimated Setup Time**: 15-30 minutes total

---

**Good luck with the deployment! 🚀**
