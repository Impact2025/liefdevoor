-- AlterTable
-- Change preferences column from TEXT to JSONB
ALTER TABLE "User" ALTER COLUMN "preferences" TYPE JSONB USING
  CASE
    WHEN "preferences" IS NULL THEN NULL
    WHEN "preferences" = '' THEN NULL
    ELSE "preferences"::jsonb
  END;
