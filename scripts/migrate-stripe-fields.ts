import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT')
  console.log('✓ User.stripeCustomerId column')
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId")')
  console.log('✓ User.stripeCustomerId unique index')

  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT')
  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT')
  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripeCurrentPeriodEnd" TIMESTAMP(3)')
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId")')
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId")')
  console.log('✓ Subscription stripe fields')

  await prisma.$executeRawUnsafe('ALTER TABLE "CreditPurchase" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT')
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "CreditPurchase_stripePaymentIntentId_key" ON "CreditPurchase"("stripePaymentIntentId")')
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "CreditPurchase_stripePaymentIntentId_idx" ON "CreditPurchase"("stripePaymentIntentId")')
  console.log('✓ CreditPurchase stripe fields')

  console.log('\nAlle Stripe kolommen toegevoegd aan de database.')
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
