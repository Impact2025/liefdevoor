-- Create Migration Campaign Tables
-- Run this manually in your database

-- Create enums
DO $$ BEGIN
    CREATE TYPE "MigrationSegment" AS ENUM ('VIP', 'GOLD', 'ACTIVE', 'DORMANT', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MigrationEmailType" AS ENUM ('WELCOME', 'MATCHES_WAITING', 'REMINDER', 'FEATURES', 'SOCIAL_PROOF', 'LAST_CHANCE', 'GOODBYE', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MigrationStatus" AS ENUM ('PENDING', 'EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED', 'CLAIM_STARTED', 'CLAIMED', 'ACTIVATED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create MigrationUser table
CREATE TABLE IF NOT EXISTS "MigrationUser" (
    "id" TEXT NOT NULL,
    "oldUserId" INTEGER NOT NULL,
    "oldEmail" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "oldProfilePhoto" TEXT,
    "memberSince" TIMESTAMP(3) NOT NULL,
    "lastActiveOld" TIMESTAMP(3),
    "hadGoldMembership" BOOLEAN NOT NULL DEFAULT false,
    "photoCount" INTEGER NOT NULL DEFAULT 0,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "segment" "MigrationSegment" NOT NULL,
    "newUserId" TEXT,
    "status" "MigrationStatus" NOT NULL DEFAULT 'PENDING',
    "couponCode" TEXT,
    "couponExpiresAt" TIMESTAMP(3),
    "couponRedeemedAt" TIMESTAMP(3),
    "claimToken" TEXT,
    "claimTokenExpiresAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "lastEmailSentAt" TIMESTAMP(3),
    "lastEmailOpenedAt" TIMESTAMP(3),
    "lastEmailClickedAt" TIMESTAMP(3),
    "totalEmailsOpened" INTEGER NOT NULL DEFAULT 0,
    "landingVisitedAt" TIMESTAMP(3),
    "landingVisits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MigrationUser_pkey" PRIMARY KEY ("id")
);

-- Create MigrationEmail table
CREATE TABLE IF NOT EXISTS "MigrationEmail" (
    "id" TEXT NOT NULL,
    "migrationUserId" TEXT NOT NULL,
    "emailType" "MigrationEmailType" NOT NULL,
    "subject" TEXT NOT NULL,
    "abVariant" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "resendId" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MigrationEmail_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "MigrationUser_oldUserId_key" ON "MigrationUser"("oldUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "MigrationUser_newUserId_key" ON "MigrationUser"("newUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "MigrationUser_couponCode_key" ON "MigrationUser"("couponCode");
CREATE UNIQUE INDEX IF NOT EXISTS "MigrationUser_claimToken_key" ON "MigrationUser"("claimToken");

-- Create regular indexes
CREATE INDEX IF NOT EXISTS "MigrationUser_oldEmail_idx" ON "MigrationUser"("oldEmail");
CREATE INDEX IF NOT EXISTS "MigrationUser_segment_idx" ON "MigrationUser"("segment");
CREATE INDEX IF NOT EXISTS "MigrationUser_status_idx" ON "MigrationUser"("status");
CREATE INDEX IF NOT EXISTS "MigrationUser_lastEmailSentAt_idx" ON "MigrationUser"("lastEmailSentAt");
CREATE INDEX IF NOT EXISTS "MigrationEmail_migrationUserId_idx" ON "MigrationEmail"("migrationUserId");
CREATE INDEX IF NOT EXISTS "MigrationEmail_emailType_idx" ON "MigrationEmail"("emailType");
CREATE INDEX IF NOT EXISTS "MigrationEmail_sentAt_idx" ON "MigrationEmail"("sentAt");
CREATE INDEX IF NOT EXISTS "MigrationEmail_openedAt_idx" ON "MigrationEmail"("openedAt");

-- Add foreign key for MigrationEmail
ALTER TABLE "MigrationEmail"
ADD CONSTRAINT "MigrationEmail_migrationUserId_fkey"
FOREIGN KEY ("migrationUserId") REFERENCES "MigrationUser"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Create MigrationCampaignStats table for daily statistics
CREATE TABLE IF NOT EXISTS "MigrationCampaignStats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsOpened" INTEGER NOT NULL DEFAULT 0,
    "linksClicked" INTEGER NOT NULL DEFAULT 0,
    "landingVisits" INTEGER NOT NULL DEFAULT 0,
    "claimsStarted" INTEGER NOT NULL DEFAULT 0,
    "claimsCompleted" INTEGER NOT NULL DEFAULT 0,
    "activations" INTEGER NOT NULL DEFAULT 0,
    "couponsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MigrationCampaignStats_pkey" PRIMARY KEY ("id")
);

-- Unique index on date for upserts
CREATE UNIQUE INDEX IF NOT EXISTS "MigrationCampaignStats_date_key" ON "MigrationCampaignStats"("date");

-- Create MigrationClick table for detailed click tracking
CREATE TABLE IF NOT EXISTS "MigrationClick" (
    "id" TEXT NOT NULL,
    "migrationUserId" TEXT NOT NULL,
    "emailId" TEXT,
    "linkType" TEXT NOT NULL DEFAULT 'cta',
    "linkUrl" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MigrationClick_pkey" PRIMARY KEY ("id")
);

-- Indexes for MigrationClick
CREATE INDEX IF NOT EXISTS "MigrationClick_migrationUserId_idx" ON "MigrationClick"("migrationUserId");
CREATE INDEX IF NOT EXISTS "MigrationClick_emailId_idx" ON "MigrationClick"("emailId");
CREATE INDEX IF NOT EXISTS "MigrationClick_clickedAt_idx" ON "MigrationClick"("clickedAt");

-- Add foreign keys for MigrationClick
ALTER TABLE "MigrationClick"
ADD CONSTRAINT "MigrationClick_migrationUserId_fkey"
FOREIGN KEY ("migrationUserId") REFERENCES "MigrationUser"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MigrationClick"
ADD CONSTRAINT "MigrationClick_emailId_fkey"
FOREIGN KEY ("emailId") REFERENCES "MigrationEmail"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Success message
SELECT 'Migration tables created successfully!' as status;
