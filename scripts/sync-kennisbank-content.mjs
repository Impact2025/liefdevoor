// Sync knowledge base articles to DB - supports Easy Read (LVB) content
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Manually load dotenv
import dotenv from 'dotenv'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
// Skip .env.local — it has DATABASE_URL in psql format, not a connection string

const prisma = new PrismaClient()

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const fm = {}
  const rawLines = match[1].split('\n')
  let currentKey = null
  let currentLines = []

  for (const line of rawLines) {
    if (currentKey) {
      if (line.startsWith('  ') || line.startsWith('\t')) {
        currentLines.push(line)
        continue
      } else {
        fm[currentKey] = currentLines.join('\n').trim()
        currentKey = null
        currentLines = []
      }
    }

    const sep = line.indexOf(':')
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    let val = line.slice(sep + 1).trim()

    if (val === '|') {
      currentKey = key
      currentLines = []
      continue
    }

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    fm[key] = val
  }

  if (currentKey && currentLines.length > 0) {
    fm[currentKey] = currentLines.join('\n').trim()
  }

  return { frontmatter: fm, body: match[2].trim() }
}

async function main() {
  const BASE = path.resolve(process.cwd(), 'content/kennisbank')
  const files = fs.readdirSync(BASE).filter(f => f.endsWith('.md'))

  const veiligheidCat = await prisma.knowledgeBaseCategory.findUnique({ where: { slug: 'veiligheid' } })
  if (!veiligheidCat) { console.error('❌ Veiligheid categorie niet gevonden'); process.exit(1) }

  const inclusiefCat = await prisma.knowledgeBaseCategory.findUnique({ where: { slug: 'inclusief-daten' } })

  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true, name: true } })
  const authorId = adminUser?.id || (await prisma.user.findFirst({ select: { id: true } }))?.id
  if (!authorId) { console.error('❌ Geen gebruiker'); process.exit(1) }

  const lvbCat = await prisma.knowledgeBaseCategory.findUnique({ where: { slug: 'inclusief-daten-lvb' } })
  if (!lvbCat) console.warn('⚠️  Inclusief-daten-lvb categorie niet gevonden, valt terug op veiligheid')

  const adhdHspCat = await prisma.knowledgeBaseCategory.findUnique({ where: { slug: 'inclusief-daten-autisme' } })
  if (!adhdHspCat) console.warn('⚠️  Inclusief-daten-autisme categorie niet gevonden')

  const categoryMap = {
    'veilig-online-daten.md': veiligheidCat.id,
    'romance-scam-herkennen.md': veiligheidCat.id,
    'waarom-liefde-voor-iedereen-anders.md': inclusiefCat?.id || veiligheidCat.id,
    'veilig-daten-lvb-faq.md': lvbCat?.id || veiligheidCat.id,
    'daten-met-adhd-hsp-complete-gids.md': adhdHspCat?.id || inclusiefCat?.id || veiligheidCat.id,
  }

  for (const file of files) {
    const filePath = path.join(BASE, file)
    const { frontmatter, body } = parseFrontmatter(filePath)

    const slug = frontmatter.slug || file.replace('.md', '')
    const titleNl = frontmatter.title || slug
    const metaDescription = frontmatter.meta_description || frontmatter.description || ''
    const metaTitle = frontmatter.meta_title || titleNl
    const hasEasyRead = frontmatter['hasEasyRead'] === 'true' || frontmatter['has_easy_read'] === 'true'
    const easyReadContent = frontmatter['easyReadContent'] || frontmatter['easy_read_content'] || null
    const categoryId = categoryMap[file] || veiligheidCat.id
    const isPillarPage = slug === 'veilig-online-daten' || slug === 'waarom-liefde-voor-iedereen-anders'
    const readingLevel = hasEasyRead ? 'EASY' : 'STANDARD'
    const keywords = [slug.replace(/-/g, ' ')]
    const targetAudience = hasEasyRead ? ['GENERAL', 'LVB'] : ['GENERAL']

    const existing = await prisma.knowledgeBaseArticle.findUnique({ where: { slug } })
    if (existing) {
      await prisma.knowledgeBaseArticle.update({
        where: { slug },
        data: {
          titleNl, contentNl: body, excerptNl: (frontmatter.description || '').slice(0, 500),
          metaTitle: metaTitle.slice(0, 60), metaDescription: metaDescription.slice(0, 160),
          categoryId, isPublished: true,
          isPillarPage, keywords, targetAudience,
          readingLevel, contentEasyRead: easyReadContent, hasEasyRead,
        },
      })
      console.log(`🔄 Geüpdatet: ${slug}${hasEasyRead ? ' (+ Easy Read)' : ''}`)
    } else {
      // Create new article
      await prisma.knowledgeBaseArticle.create({
        data: {
          title: titleNl.slice(0, 200), titleNl: titleNl.slice(0, 200),
          slug, content: body, contentNl: body,
          excerptNl: (frontmatter.description || '').slice(0, 500),
          metaTitle: metaTitle.slice(0, 60), metaDescription: metaDescription.slice(0, 160),
          categoryId, isPublished: true, isPillarPage, publishedAt: new Date(),
          articleType: 'STANDARD', keywords, targetAudience,
          readingLevel, contentEasyRead: easyReadContent, hasEasyRead,
          authorId,
        },
      })
      console.log(`✅ Aangemaakt: ${slug}`)
    }
  }

  const total = await prisma.knowledgeBaseArticle.count({ where: { isPublished: true } })
  console.log(`\n🎉 Klaar! ${total} artikelen live.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
