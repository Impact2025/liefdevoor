import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CategoryClient from './CategoryClient'

interface PageProps {
  params: { category: string }
}

async function getCategoryData(slug: string) {
  const category = await prisma.knowledgeBaseCategory.findFirst({
    where: { slug, isVisible: true },
    include: {
      children: {
        where: { isVisible: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  return category
}

async function getInitialArticles(categoryId: string) {
  const [articles, total] = await Promise.all([
    prisma.knowledgeBaseArticle.findMany({
      where: { isPublished: true, categoryId },
      select: {
        id: true,
        titleNl: true,
        slug: true,
        excerptNl: true,
        articleType: true,
        hasEasyRead: true,
        viewCount: true,
        category: { select: { name: true, nameNl: true, slug: true } },
      },
      orderBy: [{ isPillarPage: 'desc' }, { viewCount: 'desc' }],
      take: 12,
    }),
    prisma.knowledgeBaseArticle.count({ where: { isPublished: true, categoryId } }),
  ])

  return { articles, total }
}

async function getCategoryArticleCount(categoryId: string) {
  return prisma.knowledgeBaseArticle.count({ where: { isPublished: true, categoryId } })
}

async function getSubcategoryArticleCounts(childIds: string[]) {
  const counts = await Promise.all(
    childIds.map((id) =>
      prisma.knowledgeBaseArticle.count({ where: { isPublished: true, categoryId: id } })
    )
  )
  return Object.fromEntries(childIds.map((id, i) => [id, counts[i]]))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategoryData(params.category)

  if (!category) {
    return { title: 'Categorie niet gevonden' }
  }

  const name = category.nameNl || category.name
  const description = category.descriptionNl || category.description || `Artikelen over ${name}`
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.liefdevooriedereen.nl'

  return {
    title: category.metaTitle || `${name} | Kennisbank`,
    description: category.metaDescription || description,
    alternates: { canonical: `${baseUrl}/kennisbank/${params.category}` },
    openGraph: {
      title: category.metaTitle || `${name} | Kennisbank`,
      description: category.metaDescription || description,
      url: `${baseUrl}/kennisbank/${params.category}`,
      locale: 'nl_NL',
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategoryData(params.category)

  if (!category) {
    notFound()
  }

  const childIds = category.children.map((c) => c.id)
  const [{ articles, total }, articleCount, subCounts] = await Promise.all([
    getInitialArticles(category.id),
    getCategoryArticleCount(category.id),
    getSubcategoryArticleCounts(childIds),
  ])

  // Normalize shape to match CategoryClient's interface
  const initialCategory = {
    id: category.id,
    name: category.nameNl || category.name,
    slug: category.slug,
    description: category.descriptionNl || category.description || undefined,
    icon: category.icon || undefined,
    color: category.color || undefined,
    articleCount,
  }

  const initialSubcategories = category.children.map((c) => ({
    id: c.id,
    name: c.nameNl || c.name,
    slug: c.slug,
    articleCount: subCounts[c.id] ?? 0,
  }))

  const initialArticles = articles.map((a) => ({
    id: a.id,
    title: a.titleNl,
    slug: a.slug,
    excerpt: a.excerptNl || undefined,
    articleType: a.articleType,
    hasEasyRead: a.hasEasyRead,
    viewCount: a.viewCount,
    category: {
      name: a.category.nameNl || a.category.name,
      slug: a.category.slug,
    },
  }))

  return (
    <CategoryClient
      initialCategory={initialCategory}
      initialSubcategories={initialSubcategories}
      initialArticles={initialArticles}
      initialTotal={total}
      categorySlug={params.category}
    />
  )
}
