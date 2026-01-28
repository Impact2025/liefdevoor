-- Feedback Survey Table
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

  -- Metadata
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "userAgent" TEXT,
  "ipHash" TEXT
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_feedback_created ON "FeedbackSurvey"("createdAt");
CREATE INDEX IF NOT EXISTS idx_feedback_nps ON "FeedbackSurvey"("wouldRecommend");
