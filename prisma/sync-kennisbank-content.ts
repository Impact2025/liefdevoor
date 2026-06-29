/**
 * Sync kennisbank content from markdown to database.
 * Run: npx tsx --env-file=.env prisma/sync-kennisbank-content.ts
 */
async function main() {
  // Dynamic import ensures dotenv is loaded first
  const dotenv = await import('dotenv')
  dotenv.config({ path: require('path').resolve('.env') })

  const { PrismaClient } = await import('@prisma/client')
  const fs = await import('fs')
  const path = await import('path')

  const prisma = new PrismaClient()
  const BASE = path.resolve(process.cwd(), 'content/kennisbank')
  const files = fs.readdirSync(BASE).filter(f => f.endsWith('.md'))

  function parseMarkdownFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (!match) return { frontmatter: {} as any, body: content }

    const frontmatter: any = {}
    for (const line of match[1].split('\n')) {
      const sep = line.indexOf(':')
      if (sep === -1) continue
      let val = line.slice(sep + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      frontmatter[line.slice(0, sep).trim().replace(/-/g, '_')] = val
    }
    return { frontmatter, body: match[2].trim() }
  }

  // Get veiligheid category
  const veiligheidCategory = await prisma.knowledgeBaseCategory.findUnique({ where: { slug: 'veiligheid' } })
  if (!veiligheidCategory) { console.error('❌ Veiligheid categorie niet gevonden'); process.exit(1) }

  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  })
  let authorId: string
  if (!adminUser) {
    const anyUser = await prisma.user.findFirst({ select: { id: true, email: true } })
    if (!anyUser) { console.error('❌ Geen gebruikers'); process.exit(1) }
    console.warn(`⚠️  Geen admin, valt terug op: ${anyUser.email}`)
    authorId = anyUser.id
  } else {
    console.log(`✅ Admin: ${adminUser.email}`)
    authorId = adminUser.id
  }

  console.log(`\n📁 ${files.length} artikelen gevonden\n`)

  for (const file of files) {
    const filePath = path.join(BASE, file)
    const { frontmatter, body } = parseMarkdownFile(filePath)
    const slug = frontmatter.slug || file.replace('.md', '')
    const titleNl = frontmatter.title || slug
    const metaDescription = frontmatter.meta_description || frontmatter.description || ''
    const metaTitle = frontmatter.meta_title || titleNl

    const existing = await prisma.knowledgeBaseArticle.findUnique({ where: { slug } })

    if (existing) {
      await prisma.knowledgeBaseArticle.update({
        where: { slug },
        data: { titleNl, contentNl: body, excerptNl: frontmatter.description || '', metaTitle, metaDescription, isPublished: true, publishedAt: existing.publishedAt || new Date() },
      })
      console.log(`🔄 Geüpdatet: ${slug}`)
    } else {
      await prisma.knowledgeBaseArticle.create({
        data: {
          title: titleNl, titleNl, slug, content: body, contentNl: body,
          excerptNl: frontmatter.description || '', metaTitle, metaDescription,
          categoryId: veiligheidCategory.id, isPublished: true, isPillarPage: slug === 'veilig-online-daten',
          publishedAt: new Date(), articleType: 'STANDARD',
          keywords: [slug.replace(/-/g, ' ')], targetAudience: ['GENERAL'], readingLevel: 'STANDARD', authorId,
        },
      })
      console.log(`✅ Aangemaakt: ${slug}`)
    }
  }

  console.log('\n🎉 Klaar! Artikelen gesynchroniseerd.')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
