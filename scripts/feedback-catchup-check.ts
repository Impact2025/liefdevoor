import { prisma } from '../lib/prisma'
async function main() {
  const result = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) FILTER (WHERE mu.status IN ('CLAIMED', 'ACTIVATED')) as total_activated,
      COUNT(*) FILTER (WHERE mu.status IN ('CLAIMED', 'ACTIVATED') AND (u.email IN (
        SELECT DISTINCT email FROM "EmailLog" WHERE category = 'feedback-invite'
      ) OR u.email IS NULL)) as already_invited,
      COUNT(*) FILTER (WHERE mu.status IN ('CLAIMED', 'ACTIVATED') AND u.email IS NOT NULL AND u.email NOT IN (
        SELECT DISTINCT email FROM "EmailLog" WHERE category = 'feedback-invite'
      )) as not_yet_invited
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON u.id = mu."newUserId"
  `
  console.log('Totaal geactiveerd:', result[0].total_activated)
  console.log('Al uitgenodigd:', result[0].already_invited)
  console.log('Nog niet uitgenodigd:', result[0].not_yet_invited)

  // Show who hasn't been invited yet
  const users = await prisma.$queryRaw<any[]>`
    SELECT mu."firstName", u.email, mu."claimedAt", mu.status,
      DATE_PART('day', NOW() - mu."claimedAt") as days_since_claim
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON u.id = mu."newUserId"
    WHERE mu.status IN ('CLAIMED', 'ACTIVATED')
    AND u.email IS NOT NULL
    AND u.email NOT IN (
      SELECT DISTINCT email FROM "EmailLog" WHERE category = 'feedback-invite'
    )
    ORDER BY mu."claimedAt" ASC
  `
  console.log('\nNog niet uitgenodigd:')
  for (const u of users) {
    console.log(`  ${u.firstName} - ${u.email} - ${Math.floor(u.days_since_claim)} dagen geleden (${u.status})`)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
