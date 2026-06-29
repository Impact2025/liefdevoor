import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true })

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

interface ArticleFrontmatter {
  title?: string
  description?: string
  meta_title?: string
  meta_description?: string
  slug?: string
  author?: string
  date?: string
  positionering?: string
}

function parseMarkdownFile(filePath: string): { frontmatter: ArticleFrontmatter; body: string } {
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const frontmatter: ArticleFrontmatter = {}
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(':')
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    let val = line.slice(sep + 1).trim()
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    ;(frontmatter as any)[key.replace(/-/g, '_')] = val
  }

  return { frontmatter, body: match[2].trim() }
}

async function main() {
  const BASE = path.resolve(process.cwd(), 'content/kennisbank')
  const files = fs.readdirSync(BASE).filter(f => f.endsWith('.md'))

  // Get veiligheid category
  const veiligheidCategory = await prisma.knowledgeBaseCategory.findUnique({
    where: { slug: 'veiligheid' },
  })
  if (!veiligheidCategory) {
    console.error('❌ Veiligheid categorie niet gevonden in DB')
    process.exit(1)
  }

  // Get eerste admin user for authorId
  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true, name: true, email: true },
  })
  if (!adminUser) {
    console.error('❌ Geen admin gebruiker gevonden')
    // Try any user
    const anyUser = await prisma.user.findFirst({ select: { id: true, email: true } })
    if (!anyUser) {
      console.error('❌ Helemaal geen gebruikers gevonden')
      process.exit(1)
    }
    console.warn(`⚠️  Geen admin, valt terug op gebruiker: ${anyUser.email}`)
    var authorId = anyUser.id
  } else {
    console.log(`✅ Admin: ${adminUser.email}`)
    var authorId = adminUser.id
  }

  console.log(`\n📁 ${files.length} artikelen gevonden in ${BASE}\n`)

  for (const file of files) {
    const filePath = path.join(BASE, file)
    const { frontmatter, body } = parseMarkdownFile(filePath)

    const slug = frontmatter.slug || file.replace('.md', '')
    const titleNl = frontmatter.title || slug
    const metaDescription = frontmatter.meta_description || frontmatter.description || ''
    const metaTitle = frontmatter.meta_title || titleNl

    // Check if slug already exists
    const existing = await prisma.knowledgeBaseArticle.findUnique({ where: { slug } })
    if (existing) {
      // Update existing article
      await prisma.knowledgeBaseArticle.update({
        where: { slug },
        data: {
          titleNl,
          contentNl: body,
          excerptNl: frontmatter.description || '',
          metaTitle,
          metaDescription,
          categoryId: veiligheidCategory.id,
          isPublished: true,
          publishedAt: existing.publishedAt || new Date(),
          articleType: 'STANDARD',
          keywords: [slug.replace(/-/g, ' ')],
          targetAudience: ['GENERAL'],
          readingLevel: 'STANDARD',
        },
      })
      console.log(`🔄 Geüpdatet: ${slug}`)
    } else {
      // Create new article
      await prisma.knowledgeBaseArticle.create({
        data: {
          title: titleNl,
          titleNl,
          slug,
          content: body,
          contentNl: body,
          excerptNl: frontmatter.description || '',
          metaTitle,
          metaDescription,
          categoryId: veiligheidCategory.id,
          isPublished: true,
          isPillarPage: slug === 'veilig-online-daten',
          publishedAt: new Date(),
          articleType: 'STANDARD',
          keywords: [slug.replace(/-/g, ' ')],
          targetAudience: ['GENERAL'],
          readingLevel: 'STANDARD',
          authorId,
        },
      })
      console.log(`✅ Aangemaakt: ${slug}`)
    }
  }

  console.log('\n🎉 Klaar! Artikelen gesynchroniseerd.')
  console.log(`Bekijk op https://www.liefdevooriedereen.nl/kennisbank/veiligheid/`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
