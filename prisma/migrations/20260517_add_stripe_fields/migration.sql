-- Add Stripe fields to User, Subscription, and SubscriptionPayment tables
-- These fields were added to the Prisma schema in d22054f but no migration was created.

-- User: Stripe customer ID
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT UNIQUE;

-- Subscription: Stripe subscription tracking fields
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT UNIQUE;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripeCurrentPeriodEnd" TIMESTAMP(3);

-- Create index on stripeSubscriptionId for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

-- SubscriptionPayment: Stripe payment intent tracking
ALTER TABLE "SubscriptionPayment" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionPayment_stripePaymentIntentId_key" ON "SubscriptionPayment"("stripePaymentIntentId");
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_stripePaymentIntentId_idx" ON "SubscriptionPayment"("stripePaymentIntentId");
