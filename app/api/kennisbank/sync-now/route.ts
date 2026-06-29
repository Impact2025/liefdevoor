import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ARTICLES = [
  {
    slug: 'veilig-online-daten',
    title: 'Alles over veilig online daten: zo bescherm jij jezelf',
    titleNl: 'Alles over veilig online daten: zo bescherm jij jezelf',
    excerptNl: 'Veilig online daten begint bij goede voorbereiding. Lees hoe je nep profielen herkent, je privacy beschermt en veilig afspreekt.',
    metaTitle: 'Veilig Online Daten: zo bescherm jij jezelf | Liefde Voor Iedereen',
    metaDescription: 'Veilig online daten: zo herken je nep profielen, bescherm je privacy en plan je een veilige eerste date.',
    isPillarPage: true,
  },
  {
    slug: 'romance-scam-herkennen',
    title: 'Zo herken je een romance scam: 7 waarschuwingssignalen',
    titleNl: 'Zo herken je een romance scam: 7 waarschuwingssignalen',
    excerptNl: 'Leer romance scam herkennen met 7 praktische waarschuwingssignalen uit 15+ jaar ervaring in de datingsector.',
    metaTitle: 'Romance Scam Herkennen: 7 Waarschuwingssignalen | Liefde Voor Iedereen',
    metaDescription: 'Leer romance scams herkennen met 7 waarschuwingssignalen. Praktische tips van experts met 15+ jaar ervaring.',
    isPillarPage: false,
  },
  {
    slug: 'waarom-liefde-voor-iedereen-anders',
    title: 'Waarom Liefde Voor Iedereen anders is dan andere dating apps',
    titleNl: 'Waarom Liefde Voor Iedereen anders is dan andere dating apps',
    excerptNl: 'Liefde Voor Iedereen is geen gewone datingapp. Ontdek waarom wij écht anders zijn — met AI-matching, DatingAssistent en dating zonder spelletjes.',
    metaTitle: 'Waarom Liefde Voor Iedereen Anders Is | Dating zonder Spelletjes',
    metaDescription: 'Andere apps verdienen aan jouw eenzaamheid. Liefde Voor Iedereen niet. Ontdek het verschil. Gratis aanmelden.',
    isPillarPage: false,
  },
]

export async function GET() {
  const category = await prisma.knowledgeBaseCategory.findUnique({
    where: { slug: 'veiligheid' },
    select: { id: true, nameNl: true },
  })
  if (!category) {
    return NextResponse.json({ error: 'Veiligheid category not found' }, { status: 500 })
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  })
  if (!adminUser) {
    return NextResponse.json({ error: 'No admin user found' }, { status: 500 })
  }

  const results: { slug: string; status: string }[] = []

  for (const article of ARTICLES) {
    const existing = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: article.slug },
      select: { id: true },
    })

    if (existing) {
      await prisma.knowledgeBaseArticle.update({
        where: { slug: article.slug },
        data: {
          titleNl: article.titleNl,
          excerptNl: article.excerptNl,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          isPublished: true,
        },
      })
      results.push({ slug: article.slug, status: 'updated (metadata only)' })
    } else {
      await prisma.knowledgeBaseArticle.create({
        data: {
          title: article.title,
          titleNl: article.titleNl,
          slug: article.slug,
          content: '',
          contentNl: '',
          excerptNl: article.excerptNl,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          categoryId: category.id,
          isPublished: true,
          isPillarPage: article.isPillarPage,
          publishedAt: new Date(),
          articleType: 'STANDARD',
          keywords: [article.slug.replace(/-/g, ' ')],
          targetAudience: ['GENERAL'],
          readingLevel: 'STANDARD',
          authorId: adminUser.id,
        },
      })
      results.push({ slug: article.slug, status: 'created (without body)' })
    }
  }

  return NextResponse.json({
    success: true,
    category: category.nameNl,
    admin: adminUser.email,
    results,
  })
}
