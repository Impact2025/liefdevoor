-- Add AMBASSADOR category to TicketCategory enum
ALTER TYPE "TicketCategory" ADD VALUE IF NOT EXISTS 'AMBASSADOR';

-- Add MANAGE_AMBASSADORS permission to AdminPermission enum
ALTER TYPE "AdminPermission" ADD VALUE IF NOT EXISTS 'MANAGE_AMBASSADORS';

-- Create AmbassadorStatus enum
DO $$ BEGIN
  CREATE TYPE "AmbassadorStatus" AS ENUM ('INVITED', 'ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create Ambassador model
CREATE TABLE IF NOT EXISTS "Ambassador" (
  "id"            TEXT NOT NULL,
  "userId"        TEXT NOT NULL,
  "status"        "AmbassadorStatus" NOT NULL DEFAULT 'INVITED',
  "freeUntil"     TIMESTAMP(3),
  "ticketId"      TEXT,
  "adminNotes"    TEXT,
  "invitedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activatedAt"   TIMESTAMP(3),
  "deactivatedAt" TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Ambassador_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint on userId
CREATE UNIQUE INDEX IF NOT EXISTS "Ambassador_userId_key" ON "Ambassador"("userId");

-- Add indexes
CREATE INDEX IF NOT EXISTS "Ambassador_status_idx" ON "Ambassador"("status");
CREATE INDEX IF NOT EXISTS "Ambassador_invitedAt_idx" ON "Ambassador"("invitedAt");

-- Add foreign key constraint
ALTER TABLE "Ambassador"
  ADD CONSTRAINT "Ambassador_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
