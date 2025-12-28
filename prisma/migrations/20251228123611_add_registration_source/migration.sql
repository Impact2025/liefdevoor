-- AlterTable
ALTER TABLE "User" ADD COLUMN "registrationSource" TEXT;

-- Add comment
COMMENT ON COLUMN "User"."registrationSource" IS 'Doelgroep tracking - e.g., visueel, autisme, lvb, beperking';
