import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true })

import { PrismaClient } from '@prisma/client'
import { pingIndexNow, pingGoogleIndexingAPI } from '../lib/indexing'

const prisma = new PrismaClient()

async function main() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) throw new Error('NEXT_PUBLIC_SITE_URL is not set')

  // --- Blog posts ---
  const posts = await prisma.post.findMany({
    where: { published: true, slug: { not: null } },
    select: { slug: true, title: true },
    orderBy: { createdAt: 'desc' },
  })

  // --- Kennisbank artikelen ---
  const articles = await prisma.knowledgeBaseArticle.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      titleNl: true,
      category: { select: { slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const blogUrls = posts.map(p => `${siteUrl}/blog/${p.slug}`)
  const kennisbankUrls = articles.map(a => `${siteUrl}/kennisbank/${a.category.slug}/${a.slug}`)
  const allUrls = [...blogUrls, ...kennisbankUrls]

  console.log(`Blog posts:       ${posts.length}`)
  console.log(`Kennisbank:       ${articles.length}`)
  console.log(`Totaal:           ${allUrls.length} URLs\n`)

  // IndexNow accepteert bulk — één call voor alles
  console.log('Submitting to IndexNow (bulk)...')
  await pingIndexNow(allUrls)
  console.log('IndexNow done\n')

  // Google: één per call, serieel (max 200/dag)
  console.log('Submitting to Google Indexing API...')
  if (allUrls.length > 200) {
    console.warn(`WAARSCHUWING: ${allUrls.length} URLs > 200/dag limiet. Alleen eerste 200 worden verstuurd.`)
  }
  const googleUrls = allUrls.slice(0, 200)
  for (const url of googleUrls) {
    process.stdout.write(`  ${url} ... `)
    await pingGoogleIndexingAPI(url)
    console.log('ok')
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\nKlaar!')
  if (allUrls.length > 200) {
    console.log(`Resterende ${allUrls.length - 200} URLs morgen uitvoeren.`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
