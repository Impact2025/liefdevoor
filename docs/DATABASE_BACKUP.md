# Database Backup & Recovery Strategy

## 🎯 Waarom Backups Kritiek Zijn

**Scenario's die je redden:**
- 💥 Accidental data deletion
- 🐛 Buggy migration destroys data
- 🔥 Database server failure
- 🚨 Security breach/ransomware
- 👤 Human error (wrong DELETE query)

**Zonder backups = permanent data loss = game over!**

---

## 📊 Backup Strategy - 3-2-1 Rule

✅ **3** copies of data (production + 2 backups)
✅ **2** different storage types (database + file storage)
✅ **1** offsite copy (geografisch gescheiden)

---

## 🛠️ Neon Database Backups (Aanbevolen)

### Automated Daily Backups

**Neon biedt:**
- ✅ Automated daily backups (gratis!)
- ✅ Point-in-time recovery (PITR)
- ✅ 7 days retention (free tier)
- ✅ 30 days retention (paid tier)

### Enable Automated Backups

1. **Neon Dashboard:**
   ```
   Project → Settings → Backups → Enable
   ```

2. **Configure Schedule:**
   ```
   Frequency: Daily
   Time: 02:00 UTC (off-peak hours)
   Retention: 7 days (free) / 30 days (paid)
   ```

3. **Verify:**
   ```
   Check Backups tab voor eerste backup (next dag)
   ```

---

## 🔄 Manual Backup (Critical Data)

### Weekly Manual Snapshot

```bash
#!/bin/bash
# backup.sh - Manual database backup script

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${BACKUP_DATE}.sql"

# Backup database
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to cloud storage (choose one):

# Option 1: AWS S3
aws s3 cp ${BACKUP_FILE}.gz s3://your-backup-bucket/

# Option 2: Google Cloud Storage
gsutil cp ${BACKUP_FILE}.gz gs://your-backup-bucket/

# Option 3: Backblaze B2 (goedkoop!)
b2 upload-file your-bucket-name ${BACKUP_FILE}.gz ${BACKUP_FILE}.gz

# Cleanup local file
rm ${BACKUP_FILE}.gz

echo "✅ Backup completed: ${BACKUP_FILE}.gz"
```

### Add to Cron (Linux/Mac)

```bash
# Run backup every Sunday at 3 AM
0 3 * * 0 /path/to/backup.sh
```

---

## 🚀 Recovery Procedures

### Scenario 1: Recent Data Loss (< 24 hours)

**Use Neon Point-in-Time Recovery:**

1. **Neon Dashboard:**
   ```
   Project → Backups → Point-in-Time Recovery
   ```

2. **Select Time:**
   ```
   Choose timestamp BEFORE the incident
   Example: "2025-12-12 10:30:00 UTC"
   ```

3. **Create Branch:**
   ```
   Creates new branch with data from that time
   Test recovery before applying to main
   ```

4. **Verify & Promote:**
   ```
   - Connect to recovery branch
   - Verify data is correct
   - Promote branch to main (if correct)
   ```

**Time:** ~5-15 minutes

---

### Scenario 2: Older Data Loss (> 7 days)

**Use Manual Backup:**

```bash
# 1. Download backup from cloud storage
aws s3 cp s3://your-backup-bucket/backup_20251201.sql.gz .

# 2. Decompress
gunzip backup_20251201.sql.gz

# 3. Create new database for testing
createdb recovery_test

# 4. Restore to test database
psql recovery_test < backup_20251201.sql

# 5. Verify data
psql recovery_test -c "SELECT COUNT(*) FROM users;"

# 6. If correct, restore to production
# ⚠️ WARNING: This will overwrite current data!
psql $DATABASE_URL < backup_20251201.sql
```

**Time:** ~30-60 minutes (depending on database size)

---

### Scenario 3: Partial Data Recovery

**Recover specific tables:**

```sql
-- Extract specific table from backup
pg_restore -t users -t matches backup_file.sql

-- Or use SQL:
COPY users FROM '/path/to/users_backup.csv' CSV HEADER;
```

---

## 🧪 Testing Backups (CRITICAL!)

**Test backups MONTHLY - backup zonder test = geen backup!**

### Monthly Restore Test

```bash
#!/bin/bash
# test_restore.sh

# 1. Get latest backup
LATEST_BACKUP=$(aws s3 ls s3://your-backup-bucket/ | sort | tail -n 1 | awk '{print $4}')

# 2. Download
aws s3 cp s3://your-backup-bucket/$LATEST_BACKUP .

# 3. Create test database
createdb restore_test

# 4. Restore
gunzip -c $LATEST_BACKUP | psql restore_test

# 5. Verify critical tables
psql restore_test -c "
  SELECT
    'users' as table, COUNT(*) as count FROM users
  UNION ALL
  SELECT 'matches', COUNT(*) FROM matches
  UNION ALL
  SELECT 'messages', COUNT(*) FROM messages;
"

# 6. Cleanup
dropdb restore_test
rm $LATEST_BACKUP

echo "✅ Restore test completed successfully"
```

---

## 📋 Backup Checklist

### Daily (Automated)
- ☐ Verify Neon automated backup ran
- ☐ Check backup dashboard for errors

### Weekly (Manual)
- ☐ Run manual backup script
- ☐ Verify upload to cloud storage
- ☐ Check backup file size (should be similar to previous weeks)

### Monthly
- ☐ Test restore procedure
- ☐ Verify all critical data is recoverable
- ☐ Document any issues found
- ☐ Update recovery procedures if needed

### Quarterly
- ☐ Review backup retention policy
- ☐ Audit cloud storage costs
- ☐ Test disaster recovery plan
- ☐ Update documentation

---

## 💾 Backup Storage Recommendations

### Primary: Neon Automated Backups
- ✅ Free with Neon
- ✅ Automated, no maintenance
- ✅ Point-in-time recovery
- ⚠️ Limited retention (7-30 days)

### Secondary: Cloud Storage

**AWS S3 (Best for AWS users)**
```bash
Cost: ~$0.023/GB/month
Pros: Reliable, integrates with AWS ecosystem
Cons: Can get expensive at scale
```

**Backblaze B2 (Goedkoopst!)**
```bash
Cost: ~$0.005/GB/month (4-5x cheaper than S3!)
Pros: Very cheap, S3-compatible API
Cons: Slower than S3, less features
Setup: https://www.backblaze.com/b2/cloud-storage.html
```

**Google Cloud Storage**
```bash
Cost: ~$0.020/GB/month
Pros: Good for Google Cloud users
```

---

## 🚨 Disaster Recovery Plan

### If Database Completely Lost

**Priority 1: Stop all writes immediately**
```typescript
// Add to all API routes temporarily
if (process.env.DISASTER_RECOVERY_MODE === 'true') {
  return NextResponse.json({ error: 'Maintenance mode' }, { status: 503 })
}
```

**Priority 2: Assess damage**
- What was lost?
- When did it happen?
- Latest usable backup?

**Priority 3: Communicate**
```markdown
Email to users:
"We're experiencing technical difficulties.
 Your data is safe - we're working on recovery.
 ETA: 2 hours. Updates at: status.yoursite.com"
```

**Priority 4: Execute recovery**
1. Create new Neon database
2. Restore from latest backup
3. Verify data integrity
4. Test critical flows
5. Switch DNS/connection string
6. Remove maintenance mode

**Priority 5: Post-mortem**
- Document what happened
- Fix root cause
- Improve backup strategy
- Update runbook

---

## 📊 Monitoring Backups

### Healthcheck Script

```bash
#!/bin/bash
# backup_healthcheck.sh

# Check last Neon backup
LAST_BACKUP=$(neon backup list --project-id YOUR_PROJECT_ID --output json | jq -r '.[0].created_at')
HOURS_AGO=$(( ($(date +%s) - $(date -d "$LAST_BACKUP" +%s)) / 3600 ))

if [ $HOURS_AGO -gt 30 ]; then
  echo "⚠️ WARNING: Last backup was $HOURS_AGO hours ago!"
  # Send alert (email, Slack, Discord)
  curl -X POST $SLACK_WEBHOOK_URL -d "{\"text\": \"Database backup is outdated!\"}"
fi
```

### Add to Cron
```bash
# Check every 6 hours
0 */6 * * * /path/to/backup_healthcheck.sh
```

---

## 🎯 Recovery Time Objectives (RTO)

**Target recovery times:**

| Scenario | RTO | Method |
|----------|-----|--------|
| Last hour data loss | < 15 min | Neon PITR |
| Last day data loss | < 30 min | Neon daily backup |
| Last week data loss | < 1 hour | Manual backup restore |
| Complete disaster | < 4 hours | Full disaster recovery |

---

## ✅ Quick Reference

### Emergency Recovery Steps

```bash
# 1. STOP ALL WRITES
export DISASTER_RECOVERY_MODE=true

# 2. Download latest backup
aws s3 cp s3://backup-bucket/latest.sql.gz .

# 3. Create new database
# (via Neon dashboard or CLI)

# 4. Restore
gunzip latest.sql.gz
psql $NEW_DATABASE_URL < latest.sql

# 5. Verify
psql $NEW_DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 6. Switch connection string in Vercel
# Vercel → Settings → Environment Variables → DATABASE_URL

# 7. Redeploy
vercel --prod

# 8. Remove maintenance mode
unset DISASTER_RECOVERY_MODE
```

---

## 📞 Emergency Contacts

**Database Issues:**
- Neon Support: support@neon.tech
- Your DBA: [Add contact]

**Backup Storage:**
- AWS Support: https://console.aws.amazon.com/support/
- Backblaze: support@backblaze.com

**Vercel Deployment:**
- Vercel Support: https://vercel.com/help

---

**Remember:**

> "Backups are like insurance - you don't need them until you REALLY need them!"

**Test your backups. Sleep better.** 😴
