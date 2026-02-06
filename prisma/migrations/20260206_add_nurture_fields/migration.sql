-- Add nurture email tracking and incentive fields to MigrationUser
--
-- This migration adds:
-- 1. nurtureEmailsSent - Track which nurture emails have been sent
-- 2. premiumMonths - Premium duration incentive
-- 3. superMessages - SuperMessage count incentive

ALTER TABLE "MigrationUser" ADD COLUMN IF NOT EXISTS "nurtureEmailsSent" TEXT;
ALTER TABLE "MigrationUser" ADD COLUMN IF NOT EXISTS "premiumMonths" INTEGER DEFAULT 1;
ALTER TABLE "MigrationUser" ADD COLUMN IF NOT EXISTS "superMessages" INTEGER DEFAULT 0;

-- Create index for nurture email lookups
CREATE INDEX IF NOT EXISTS "MigrationUser_nurtureEmailsSent_idx" ON "MigrationUser"("nurtureEmailsSent");

-- Update existing users based on their segment
UPDATE "MigrationUser"
SET
  "premiumMonths" = CASE
    WHEN segment = 'VIP' THEN 3
    WHEN segment = 'GOLD' THEN 2
    WHEN segment = 'ACTIVE' THEN 1
    WHEN segment = 'DORMANT' THEN 1
    WHEN segment = 'INACTIVE' THEN 0
    ELSE 1
  END,
  "superMessages" = CASE
    WHEN segment = 'VIP' THEN 10
    WHEN segment = 'GOLD' THEN 5
    WHEN segment = 'ACTIVE' THEN 3
    WHEN segment = 'DORMANT' THEN 5
    WHEN segment = 'INACTIVE' THEN 0
    ELSE 0
  END
WHERE "premiumMonths" IS NULL;
