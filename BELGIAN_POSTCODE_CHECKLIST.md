# Belgian Postcode Fix - Deployment Checklist

## Pre-Deployment Testing

### ✅ Automated Tests
- [x] Run test script: `npx tsx scripts/test-belgian-postcode.ts`
- [x] Verify all tests pass (Dutch + Belgian validation and geocoding)

### 🧪 Manual Testing (Required Before Deploy)

#### Test Belgian Postcodes in Onboarding
1. [ ] Clear browser cache and start fresh session
2. [ ] Go to `/onboarding`
3. [ ] Complete steps 1-3 (Age, Gender, Looking For)
4. [ ] At step 4 (Location), test Belgian postcodes:
   - [ ] Enter `1000` (Brussels) - should show city name and map
   - [ ] Enter `2000` (Antwerp) - should show city name and map
   - [ ] Enter `9000` (Ghent) - should show city name and map
5. [ ] Verify "Verder" button activates and step 5 loads
6. [ ] Complete remaining steps to ensure full flow works

#### Test Dutch Postcodes Still Work
1. [ ] Restart onboarding flow
2. [ ] At step 4, test Dutch postcodes:
   - [ ] Enter `1012 AB` (Amsterdam) - should work as before
   - [ ] Enter `3012 AB` (Rotterdam) - should work as before
3. [ ] Verify "Verder" button activates

#### Test Edge Cases
1. [ ] Invalid Belgian postcode (e.g., `0123`) - should show error
2. [ ] Partial Belgian postcode (e.g., `100`) - should not validate yet
3. [ ] Invalid Dutch postcode (e.g., `1234XX`) - should show error
4. [ ] Verify error messages show both formats: "NL: 1234 AB, BE: 1000"

## Files Changed

- [x] `lib/services/geocoding.ts` - Added Belgian validation functions
- [x] `components/features/location/PostcodeInput.tsx` - Updated UI to accept both formats
- [x] `app/api/geocode/route.ts` - Updated API to geocode Belgian postcodes
- [x] `scripts/test-belgian-postcode.ts` - Created test script
- [x] `docs/BELGIAN_POSTCODE_FIX.md` - Created documentation

## Build & Deploy

1. [ ] Run build to check for TypeScript errors:
   ```bash
   npm run build
   ```

2. [ ] If build successful, deploy to production

3. [ ] After deploy, test live site with Belgian postcode

## User Communication

1. [ ] Reply to Andy De Bodt's email (template in `docs/BELGIAN_POSTCODE_FIX.md`)
2. [ ] Optional: Add note to release notes about Belgian postcode support

## Rollback Plan

If issues arise after deployment:
1. Revert commits affecting these files
2. Redeploy previous version
3. Investigate issues further in development

## Success Criteria

- [x] Belgian users can enter 4-digit postcodes (1000, 2000, etc.)
- [x] Dutch users can still enter postcodes as before (1012 AB)
- [x] Geocoding works for both NL and BE postcodes
- [x] "Verder" button activates for valid Belgian postcodes
- [x] Error messages are clear and show both formats

---

**Ready for deployment once manual testing is complete.**
