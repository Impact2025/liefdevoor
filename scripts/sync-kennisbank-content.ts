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
  has_easy_read?: string  // "true" or undefined (snake_case from frontmatter parser)
  easy_read_content?: string  // multi-line Easy Read content
}

function parseMarkdownFile(filePath: string): { frontmatter: ArticleFrontmatter; body: string } {
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const fm: Record<string, string> = {}
  const lines = match[1].split('\n')
  let currentKey: string | null = null
  const fmLines: string[] = []

  for (const line of lines) {
    if (currentKey) {
      // Continuation of multi-line value (indented with spaces or a pipe)
      if (line.startsWith('  ') || line.startsWith('\t')) {
        fmLines.push(line)
        continue
      } else {
        // Save the accumulated value
        fm[currentKey] = fmLines.join('\n').trim()
        currentKey = null
        fmLines.length = 0
      }
    }

    const sep = line.indexOf(':')
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    let val = line.slice(sep + 1).trim()

    // Check for multi-line value (pipe |)
    if (val === '|') {
      currentKey = key
      fmLines.length = 0
      continue
    }

    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    fm[key] = val
  }

  // Flush remaining multi-line
  if (currentKey && fmLines.length > 0) {
    fm[currentKey] = fmLines.join('\n').trim()
  }

  // Create the ArticleFrontmatter object
  const frontmatter: any = {}
  for (const [key, val] of Object.entries(fm)) {
    frontmatter[key.replace(/-/g, '_')] = val
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

  // Get inclusief-daten category (for 'waarom-liefde-voor-iedereen-anders')
  const inclusiefCategory = await prisma.knowledgeBaseCategory.findUnique({
    where: { slug: 'inclusief-daten' },
  })

  // Get eerste admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, email: true },
  })
  if (!adminUser) {
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

  // Category mapping: which .md file goes in which category
  const categoryMap: Record<string, string> = {
    'veilig-online-daten.md': veiligheidCategory.id,
    'romance-scam-herkennen.md': veiligheidCategory.id,
    'waarom-liefde-voor-iedereen-anders.md': inclusiefCategory?.id || veiligheidCategory.id,
  }

  console.log(`\n📁 ${files.length} artikelen gevonden in ${BASE}\n`)

  for (const file of files) {
    const filePath = path.join(BASE, file)
    const { frontmatter, body } = parseMarkdownFile(filePath)

    const slug = frontmatter.slug || file.replace('.md', '')
    const titleNl = frontmatter.title || slug
    const metaDescription = frontmatter.meta_description || frontmatter.description || ''
    const metaTitle = frontmatter.meta_title || titleNl
    const hasEasyRead = frontmatter.has_easy_read === 'true'
    const easyReadContent = frontmatter.easy_read_content || null
    const categoryId = categoryMap[file] || veiligheidCategory.id

    // Determine reading level
    const readingLevel = hasEasyRead ? 'EASY' : 'STANDARD'

    // Determine if this is a pillar page
    const isPillarPage = slug === 'veilig-online-daten' || slug === 'waarom-liefde-voor-iedereen-anders'

    // Check if slug already exists
    const existing = await prisma.knowledgeBaseArticle.findUnique({ where: { slug } })
    if (existing) {
      await prisma.knowledgeBaseArticle.update({
        where: { slug },
        data: {
          titleNl,
          contentNl: body,
          excerptNl: frontmatter.description || '',
          metaTitle,
          metaDescription,
          categoryId,
          isPublished: true,
          publishedAt: existing.publishedAt || new Date(),
          articleType: 'STANDARD',
          isPillarPage,
          keywords: [slug.replace(/-/g, ' ')],
          targetAudience: hasEasyRead ? ['GENERAL', 'LVB'] : ['GENERAL'],
          readingLevel: readingLevel as any,
          contentEasyRead: easyReadContent,
          hasEasyRead,
        },
      })
      console.log(`🔄 Geüpdatet: ${slug}${hasEasyRead ? ' (+ Easy Read)' : ''}`)
    } else {
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
          categoryId,
          isPublished: true,
          isPillarPage,
          publishedAt: new Date(),
          articleType: 'STANDARD',
          keywords: [slug.replace(/-/g, ' ')],
          targetAudience: hasEasyRead ? ['GENERAL', 'LVB'] : ['GENERAL'],
          readingLevel: readingLevel as any,
          contentEasyRead: easyReadContent,
          hasEasyRead,
          authorId,
        },
      })
      console.log(`✅ Aangemaakt: ${slug}`)
    }
  }

  console.log('\n🎉 Klaar! Artikelen gesynchroniseerd.')
  console.log('Bekijk op https://www.liefdevooriedereen.nl/kennisbank/')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
