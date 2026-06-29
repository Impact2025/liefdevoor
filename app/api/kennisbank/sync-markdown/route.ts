import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Sync markdown knowledge base articles to database.
 * POST /api/kennisbank/sync-markdown  - execute
 * GET  /api/kennisbank/sync-markdown   - dry-run
 */

export async function POST(request: NextRequest) {
  return syncArticles(false)
}

export async function GET(request: NextRequest) {
  return syncArticles(true)
}

async function syncArticles(dryRun: boolean) {
  const BASE = path.resolve(process.cwd(), 'content/kennisbank')

  if (!fs.existsSync(BASE)) {
    return NextResponse.json({ success: false, error: 'Content directory not found' }, { status: 404 })
  }

  const files = fs.readdirSync(BASE).filter(f => f.endsWith('.md'))
  const results: { slug: string; status: string; error?: string }[] = []

  const veiligheidCategory = await prisma.knowledgeBaseCategory.findUnique({
    where: { slug: 'veiligheid' },
  })
  if (!veiligheidCategory) {
    return NextResponse.json({ success: false, error: 'Veiligheid category not found in DB' }, { status: 500 })
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: { in: 'ADMIN' } },
    select: { id: true, email: true },
  })
  if (!adminUser) {
    return NextResponse.json({ success: false, error: 'No admin user found' }, { status: 500 })
  }

  for (const file of files) {
    try {
      const filePath = path.join(BASE, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
      if (!match) { results.push({ slug: file, status: 'skipped', error: 'No frontmatter' }); continue }

      const frontmatter: Record<string, string> = {}
      for (const line of match[1].split('\n')) {
        const sep = line.indexOf(':')
        if (sep === -1) continue
        let val = line.slice(sep + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1)
        frontmatter[line.slice(0, sep).trim().replace(/-/g, '_')] = val
      }

      const slug = frontmatter.slug || file.replace('.md', '')
      const body = match[2].trim()

      if (dryRun) {
        const existing = await prisma.knowledgeBaseArticle.findUnique({ where: { slug } })
        results.push({ slug, status: existing ? 'would-update' : 'would-create' })
        continue
      }

      const existing = await prisma.knowledgeBaseArticle.findUnique({ where: { slug } })
      if (existing) {
        await prisma.knowledgeBaseArticle.update({
          where: { slug },
          data: {
            titleNl: frontmatter.title || slug,
            contentNl: body,
            excerptNl: frontmatter.description || '',
            metaTitle: frontmatter.meta_title || frontmatter.title || slug,
            metaDescription: frontmatter.meta_description || frontmatter.description || '',
            isPublished: true,
            publishedAt: existing.publishedAt || new Date(),
            keywords: [slug.replace(/-/g, ' ')],
          },
        })
        results.push({ slug, status: 'updated' })
      } else {
        await prisma.knowledgeBaseArticle.create({
          data: {
            title: frontmatter.title || slug,
            titleNl: frontmatter.title || slug,
            slug,
            content: body,
            contentNl: body,
            excerptNl: frontmatter.description || '',
            metaTitle: frontmatter.meta_title || frontmatter.title || slug,
            metaDescription: frontmatter.meta_description || frontmatter.description || '',
            categoryId: veiligheidCategory.id,
            isPublished: true,
            isPillarPage: slug === 'veilig-online-daten',
            publishedAt: new Date(),
            articleType: 'STANDARD',
            keywords: [slug.replace(/-/g, ' ')],
            targetAudience: ['GENERAL'],
            readingLevel: 'STANDARD',
            authorId: adminUser.id,
          },
        })
        results.push({ slug, status: 'created' })
      }
    } catch (error) {
      results.push({ slug: file, status: 'error', error: String(error) })
    }
  }

  return NextResponse.json({
    success: true,
    dryRun,
    total: files.length,
    results,
    summary: {
      created: results.filter(r => r.status === 'created').length,
      updated: results.filter(r => r.status === 'updated').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
    },
  })
}
