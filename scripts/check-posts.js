const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findFirst({
    where: { slug: 'welkom-op-ons-nieuwe-blog2' },
    select: { id: true, title: true, content: true }
  });
  console.log('Content:', post.content.substring(0, 2000));
}

main().finally(() => prisma.$disconnect());
