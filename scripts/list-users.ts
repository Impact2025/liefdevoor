import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      email: true,
      name: true,
      subscriptionTier: true,
      createdAt: true,
    },
  })

  console.log('\n=== Recent Users ===\n')
  users.forEach((user, idx) => {
    console.log(`[${idx + 1}] ${user.email}`)
    console.log(`    Name: ${user.name || 'N/A'}`)
    console.log(`    Tier: ${user.subscriptionTier}`)
    console.log(`    Created: ${user.createdAt.toISOString()}`)
    console.log()
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
