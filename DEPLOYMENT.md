# 🚀 Deployment Guide

## Database Migrations

**IMPORTANT:** Database migrations are NOT run automatically during Vercel deployment to avoid timeout issues with Neon database.

### After Each Deployment:

1. **Manually run migrations** via Vercel CLI or locally:

```bash
# Option 1: Via script
bash scripts/migrate-production.sh

# Option 2: Direct command
npx prisma migrate deploy
```

2. **Verify migrations**:

```bash
npx prisma migrate status
```

### Why Manual Migrations?

- **Neon Database Timeouts:** Neon's advisory locks can timeout during build
- **Build Speed:** Keeps Vercel builds fast and reliable
- **Control:** Allows reviewing migrations before applying
- **Safety:** Prevents accidental destructive migrations

### Current Pending Migrations:

Check with:
```bash
npx prisma migrate status
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Run `npx prisma migrate deploy` manually
- [ ] Verify migrations with `npx prisma migrate status`
- [ ] Test new features in production
- [ ] Monitor error logs

## Environment Variables

Ensure these are set in Vercel:
- `DATABASE_URL` (Neon connection string)
- `DIRECT_URL` (Neon direct connection)
- `NEXTAUTH_SECRET`
- `UPLOADTHING_SECRET`
- `CRON_SECRET`
- All other required env vars

## Cron Jobs

Configured in `vercel.json`:
- Daily birthdays (9:00 AM)
- Subscription renewal (6:00 AM)
- Daily digest (7:00 PM)
- Profile nudge (10:00 AM)
- Re-engagement (11:00 AM)
- Seasonal campaigns (6:00 PM Friday)
- A/B test check (hourly)
- **Audio cleanup (3:00 AM)** ← NEW!

## Troubleshooting

### Migration Timeouts
If migrations timeout:
1. Try again (Neon can be slow sometimes)
2. Use direct connection URL instead of pooled
3. Run during low-traffic hours

### Build Failures
- Check Vercel logs
- Verify all env vars are set
- Check for TypeScript errors locally first

### Database Issues
- Verify Neon database is active
- Check connection string is correct
- Ensure IP allowlist includes Vercel IPs (if configured)
