-- CreateTable
CREATE TABLE IF NOT EXISTS "MigrationAlert" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MigrationAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MigrationError" (
    "id" TEXT NOT NULL,
    "migrationUserId" TEXT,
    "errorType" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MigrationError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MigrationAlert_level_idx" ON "MigrationAlert"("level");
CREATE INDEX IF NOT EXISTS "MigrationAlert_createdAt_idx" ON "MigrationAlert"("createdAt");
CREATE INDEX IF NOT EXISTS "MigrationError_errorType_idx" ON "MigrationError"("errorType");
CREATE INDEX IF NOT EXISTS "MigrationError_createdAt_idx" ON "MigrationError"("createdAt");
CREATE INDEX IF NOT EXISTS "MigrationEmail_resendId_idx" ON "MigrationEmail"("resendId");
