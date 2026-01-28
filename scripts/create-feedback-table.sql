-- Feedback Survey Table (World-Class Version)
-- Run this in your PostgreSQL database

CREATE TABLE IF NOT EXISTS "FeedbackSurvey" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,

  -- Ratings (1-5 stars)
  satisfaction INT NOT NULL CHECK (satisfaction >= 1 AND satisfaction <= 5),
  "easeOfUse" INT NOT NULL CHECK ("easeOfUse" >= 1 AND "easeOfUse" <= 5),
  "designRating" INT NOT NULL CHECK ("designRating" >= 1 AND "designRating" <= 5),

  -- Missing features (JSON array)
  "missingFeatures" JSONB DEFAULT '[]',
  "otherMissing" TEXT,

  -- Open questions
  "bestFeature" TEXT,
  improvements TEXT,
  "additionalComments" TEXT,

  -- NPS (0-10)
  "wouldRecommend" INT NOT NULL CHECK ("wouldRecommend" >= 0 AND "wouldRecommend" <= 10),

  -- Analytics tracking
  "completionTime" INT,              -- Time in seconds to complete survey
  "questionTimes" JSONB DEFAULT '{}', -- Time spent on each question
  segment TEXT,                       -- Migration segment (VIP, GOLD, etc.)

  -- Metadata
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "userAgent" TEXT,
  "ipHash" TEXT,

  -- Follow-up tracking
  "detractorFollowUpSent" BOOLEAN DEFAULT FALSE,
  "detractorFollowUpAt" TIMESTAMP WITH TIME ZONE
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_feedback_created ON "FeedbackSurvey"("createdAt");
CREATE INDEX IF NOT EXISTS idx_feedback_nps ON "FeedbackSurvey"("wouldRecommend");
CREATE INDEX IF NOT EXISTS idx_feedback_user ON "FeedbackSurvey"("userId");
CREATE INDEX IF NOT EXISTS idx_feedback_segment ON "FeedbackSurvey"(segment);

-- View for quick NPS calculation
CREATE OR REPLACE VIEW feedback_nps_summary AS
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN "wouldRecommend" >= 9 THEN 1 END) as promoters,
  COUNT(CASE WHEN "wouldRecommend" BETWEEN 7 AND 8 THEN 1 END) as passives,
  COUNT(CASE WHEN "wouldRecommend" <= 6 THEN 1 END) as detractors,
  ROUND(
    (COUNT(CASE WHEN "wouldRecommend" >= 9 THEN 1 END)::numeric -
     COUNT(CASE WHEN "wouldRecommend" <= 6 THEN 1 END)::numeric) /
    NULLIF(COUNT(*), 0) * 100
  ) as nps_score,
  ROUND(AVG(satisfaction)::numeric, 2) as avg_satisfaction,
  ROUND(AVG("easeOfUse")::numeric, 2) as avg_ease,
  ROUND(AVG("designRating")::numeric, 2) as avg_design
FROM "FeedbackSurvey";

-- View for daily stats
CREATE OR REPLACE VIEW feedback_daily_stats AS
SELECT
  DATE("createdAt") as date,
  COUNT(*) as responses,
  ROUND(AVG("wouldRecommend")::numeric, 1) as avg_nps,
  COUNT(CASE WHEN "wouldRecommend" >= 9 THEN 1 END) as promoters,
  COUNT(CASE WHEN "wouldRecommend" <= 6 THEN 1 END) as detractors
FROM "FeedbackSurvey"
GROUP BY DATE("createdAt")
ORDER BY date DESC;
