import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Checking Kennisbank data...\n')

  const [categories, articles, tools] = await Promise.all([
    prisma.knowledgeBaseCategory.count(),
    prisma.knowledgeBaseArticle.count(),
    prisma.knowledgeBaseTool.count(),
  ])

  console.log(`Categories: ${categories}`)
  console.log(`Articles: ${articles}`)
  console.log(`Tools: ${tools}\n`)

  if (articles > 0) {
    console.log('Sample articles:')
    const sampleArticles = await prisma.knowledgeBaseArticle.findMany({
      take: 5,
      select: {
        id: true,
        titleNl: true,
        slug: true,
        isPublished: true,
        authorId: true,
        category: {
          select: {
            nameNl: true,
          },
        },
      },
    })

    sampleArticles.forEach((article) => {
      console.log(`  - ${article.titleNl}`)
      console.log(`    Published: ${article.isPublished}`)
      console.log(`    Author ID: ${article.authorId || 'NULL'}`)
      console.log(`    Category: ${article.category.nameNl}`)
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
