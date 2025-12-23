-- World-Class Email System Schema Extensions
-- Run with: npx prisma migrate dev --name add_world_class_email_system

-- ============================================
-- EMAIL PREFERENCES - Granular Control
-- ============================================

CREATE TABLE IF NOT EXISTS "EmailPreference" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,

  -- Email Categories (users can opt-in/out per category)
  "dailyDigest" BOOLEAN NOT NULL DEFAULT true,
  "profileNudge" BOOLEAN NOT NULL DEFAULT true,
  "perfectMatch" BOOLEAN NOT NULL DEFAULT true,
  "reEngagement" BOOLEAN NOT NULL DEFAULT true,
  "weeklyHighlights" BOOLEAN NOT NULL DEFAULT true,
  "specialEvents" BOOLEAN NOT NULL DEFAULT true,
  "productUpdates" BOOLEAN NOT NULL DEFAULT false,

  -- Smart Frequency Control
  "maxEmailsPerDay" INTEGER NOT NULL DEFAULT 2,
  "maxEmailsPerWeek" INTEGER NOT NULL DEFAULT 7,
  "quietHoursStart" INTEGER, -- Hour (0-23) when not to send
  "quietHoursEnd" INTEGER,

  -- Send Time Optimization
  "preferredSendTime" INTEGER, -- Best hour to send (0-23)
  "timezone" TEXT DEFAULT 'Europe/Amsterdam',

  -- Metadata
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "EmailPreference_userId_idx" ON "EmailPreference"("userId");

-- ============================================
-- A/B TESTING FRAMEWORK
-- ============================================

CREATE TABLE IF NOT EXISTS "EmailABTest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "emailType" TEXT NOT NULL, -- 'daily_digest', 'profile_nudge', etc.

  -- Variants (A vs B)
  "variantA" JSONB NOT NULL, -- { subjectLine, template, cta }
  "variantB" JSONB NOT NULL,

  -- Traffic Split
  "trafficSplitPercent" INTEGER NOT NULL DEFAULT 50, -- % going to variant B

  -- Status
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),

  -- Results
  "variantASent" INTEGER NOT NULL DEFAULT 0,
  "variantBSent" INTEGER NOT NULL DEFAULT 0,
  "variantAOpens" INTEGER NOT NULL DEFAULT 0,
  "variantBOpens" INTEGER NOT NULL DEFAULT 0,
  "variantAClicks" INTEGER NOT NULL DEFAULT 0,
  "variantBClicks" INTEGER NOT NULL DEFAULT 0,

  -- Winner
  "winningVariant" TEXT, -- 'A', 'B', or NULL
  "confidenceScore" REAL, -- 0-100, statistical confidence

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "EmailABTest_emailType_idx" ON "EmailABTest"("emailType");
CREATE INDEX "EmailABTest_isActive_idx" ON "EmailABTest"("isActive");

-- ============================================
-- EMAIL ANALYTICS - Enhanced Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS "EmailAnalytics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "emailLogId" TEXT NOT NULL UNIQUE,

  -- Engagement Metrics
  "openCount" INTEGER NOT NULL DEFAULT 0,
  "clickCount" INTEGER NOT NULL DEFAULT 0,
  "firstOpenedAt" TIMESTAMP(3),
  "lastOpenedAt" TIMESTAMP(3),

  -- Click Tracking
  "clickedLinks" JSONB, -- Array of clicked URLs
  "ctaClicked" TEXT, -- Which CTA was clicked

  -- Device & Client
  "deviceType" TEXT, -- 'mobile', 'desktop', 'tablet'
  "emailClient" TEXT, -- 'gmail', 'outlook', 'apple_mail'
  "operatingSystem" TEXT,

  -- Conversion Tracking
  "convertedToAction" BOOLEAN NOT NULL DEFAULT false,
  "conversionType" TEXT, -- 'profile_view', 'message_sent', 'match_created'
  "convertedAt" TIMESTAMP(3),
  "revenueGenerated" REAL, -- For premium conversions

  -- A/B Test Assignment
  "abTestId" TEXT,
  "abTestVariant" TEXT, -- 'A' or 'B'

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "EmailAnalytics_emailLogId_idx" ON "EmailAnalytics"("emailLogId");
CREATE INDEX "EmailAnalytics_abTestId_idx" ON "EmailAnalytics"("abTestId");
CREATE INDEX "EmailAnalytics_convertedToAction_idx" ON "EmailAnalytics"("convertedToAction");

-- ============================================
-- SEND TIME OPTIMIZATION - ML-Based
-- ============================================

CREATE TABLE IF NOT EXISTS "EmailSendTimeOptimization" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,

  -- Historical Performance by Hour (0-23)
  "openRateByHour" JSONB, -- { "9": 0.45, "19": 0.62, ... }
  "clickRateByHour" JSONB,

  -- Calculated Optimal Times
  "optimalSendHour" INTEGER, -- Best hour (0-23)
  "secondBestHour" INTEGER,

  -- Confidence Metrics
  "dataPoints" INTEGER NOT NULL DEFAULT 0, -- Number of emails analyzed
  "confidenceScore" REAL, -- 0-1, how confident we are

  -- Last Calculation
  "lastCalculatedAt" TIMESTAMP(3),

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailSendTimeOptimization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "EmailSendTimeOptimization_userId_idx" ON "EmailSendTimeOptimization"("userId");

-- ============================================
-- EMAIL CAMPAIGNS - Advanced Campaign Management
-- ============================================

CREATE TABLE IF NOT EXISTS "EmailCampaign" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL, -- 'one_time', 'recurring', 'triggered'

  -- Campaign Settings
  "emailType" TEXT NOT NULL, -- 'daily_digest', 'special_event', etc.
  "targetSegment" JSONB, -- Filtering criteria

  -- Scheduling
  "scheduledFor" TIMESTAMP(3),
  "cronSchedule" TEXT, -- For recurring campaigns

  -- Status
  "status" TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, running, completed, paused
  "isActive" BOOLEAN NOT NULL DEFAULT false,

  -- Performance
  "totalSent" INTEGER NOT NULL DEFAULT 0,
  "totalOpened" INTEGER NOT NULL DEFAULT 0,
  "totalClicked" INTEGER NOT NULL DEFAULT 0,
  "totalConverted" INTEGER NOT NULL DEFAULT 0,

  -- A/B Testing
  "abTestId" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT -- Admin user ID
);

CREATE INDEX "EmailCampaign_status_idx" ON "EmailCampaign"("status");
CREATE INDEX "EmailCampaign_isActive_idx" ON "EmailCampaign"("isActive");
CREATE INDEX "EmailCampaign_scheduledFor_idx" ON "EmailCampaign"("scheduledFor");

-- ============================================
-- EXTEND EmailLog with A/B Testing
-- ============================================

ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "abTestId" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "abTestVariant" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "campaignId" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "personalizedSubject" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "sendTimeOptimized" BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS "EmailLog_abTestId_idx" ON "EmailLog"("abTestId");
CREATE INDEX IF NOT EXISTS "EmailLog_campaignId_idx" ON "EmailLog"("campaignId");
