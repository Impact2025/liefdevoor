import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.liefdevooriedereen.nl'

  let blogPosts: any[] = []
  let kbArticles: any[] = []

  try {
    blogPosts = await prisma.post.findMany({
      where: { published: true },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    kbArticles = await prisma.knowledgeBaseArticle.findMany({
      where: { isPublished: true },
      select: {
        titleNl: true,
        slug: true,
        excerptNl: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  } catch (error) {
    console.error('Error fetching feed content:', error)
  }

  const items: string[] = []

  for (const post of blogPosts) {
    const url = `${baseUrl}/blog/${post.slug}`
    const date = (post.updatedAt || post.createdAt).toUTCString()
    items.push(`    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${date}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <author>${post.author?.name || 'Liefde Voor Iedereen'}</author>
    </item>`)
  }

  for (const article of kbArticles) {
    const url = `${baseUrl}/kennisbank/${article.category.slug}/${article.slug}`
    const date = (article.updatedAt || article.createdAt).toUTCString()
    items.push(`    <item>
      <title><![CDATA[${article.titleNl}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${date}</pubDate>
      <description><![CDATA[${article.excerptNl || ''}]]></description>
    </item>`)
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Liefde Voor Iedereen - Blog & Kennisbank</title>
    <link>${baseUrl}</link>
    <description>Dating tips, veiligheidsadvies en kennisbankartikelen van Liefde Voor Iedereen</description>
    <language>nl-nl</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
