-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM (
  'VIEW_USERS',
  'BAN_USERS',
  'UNBAN_USERS',
  'DELETE_USERS',
  'EDIT_USER_PROFILES',
  'VIEW_USER_ACTIVITY',
  'VIEW_REPORTS',
  'RESOLVE_REPORTS',
  'MODERATE_MESSAGES',
  'MODERATE_PHOTOS',
  'APPROVE_VERIFICATIONS',
  'MANAGE_ADMINS',
  'VIEW_ANALYTICS',
  'MANAGE_SUBSCRIPTIONS',
  'MANAGE_PAYMENTS',
  'VIEW_AUDIT_LOGS',
  'EXPORT_DATA',
  'CREATE_BLOG_POSTS',
  'EDIT_BLOG_POSTS',
  'DELETE_BLOG_POSTS',
  'PUBLISH_BLOG_POSTS',
  'SEND_NOTIFICATIONS',
  'MANAGE_EMAIL_TEMPLATES',
  'VIEW_EMAIL_LOGS',
  'MANAGE_SETTINGS',
  'MANAGE_COUPONS',
  'ACCESS_HELPDESK'
);

-- CreateTable
CREATE TABLE "AdminRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" "AdminPermission"[],
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "extraPermissions" "AdminPermission"[] DEFAULT ARRAY[]::"AdminPermission"[],
    "canAccessProduction" BOOLEAN NOT NULL DEFAULT false,
    "lastAdminActivity" TIMESTAMP(3),
    "actionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_name_key" ON "AdminRole"("name");

-- CreateIndex
CREATE INDEX "AdminRole_name_idx" ON "AdminRole"("name");

-- CreateIndex
CREATE INDEX "AdminRole_isSystem_idx" ON "AdminRole"("isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Admin_userId_idx" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Admin_roleId_idx" ON "Admin"("roleId");

-- CreateIndex
CREATE INDEX "Admin_lastAdminActivity_idx" ON "Admin"("lastAdminActivity");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
