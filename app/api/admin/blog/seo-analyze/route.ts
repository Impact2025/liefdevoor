import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { content, title, seoTitle, seoDescription, keywords } = await request.json()

    // Fetch published blog posts for internal link context
    const [publishedPosts, kennisbankArticles] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        select: { title: true, slug: true, excerpt: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.knowledgeBaseArticle.findMany({
        where: { isPublished: true },
        select: { titleNl: true, slug: true, excerptNl: true, category: { select: { slug: true } } },
        take: 20,
      }).catch(() => [] as any[]),
    ])

    const strippedContent = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2500)

    const internalPages = [
      { title: 'Registreer gratis – Liefde Voor Iedereen', url: '/register', desc: 'Gratis account aanmaken' },
      { title: 'Premium functies', url: '/features', desc: 'Overzicht van premium abonnement' },
      { title: 'Over ons', url: '/over-ons', desc: 'Over het platform' },
      { title: 'Veilig daten tips', url: '/veilig-daten', desc: 'Veiligheid bij online daten' },
      ...publishedPosts.map(p => ({
        title: p.title,
        url: `/blog/${p.slug}`,
        desc: p.excerpt || 'Blog artikel'
      })),
      ...(kennisbankArticles as any[]).map((a: any) => ({
        title: a.titleNl,
        url: `/kennisbank/${a.category?.slug}/${a.slug}`,
        desc: a.excerptNl || 'Kennisbank artikel'
      })),
    ]

    const prompt = `Je bent een expert SEO-specialist voor een Nederlandse dating website genaamd "Liefde Voor Iedereen" (liefdevooriedereen.nl).

ARTIKEL ANALYSE:
Titel: "${title || seoTitle || 'Onbekend'}"
Keywords: ${keywords?.join(', ') || 'geen'}
Content fragment:
${strippedContent}

BESCHIKBARE INTERNE PAGINA'S:
${internalPages.map(p => `- "${p.title}" → ${p.url} (${p.desc})`).join('\n')}

TAAK: Geef een professionele SEO-analyse met link suggesties.

Regels:
- Interne links: geef MINIMAAL 10 pagina's die INHOUDELIJK aansluiten op het artikel, inclusief blog artikelen EN kennisbank pagina's
- Prioriteer relevantie: selecteer links die werkelijk bijdragen aan de lezersreis
- Externe links: alleen ECHTE, bekende Nederlandse of internationale autoritaire bronnen
- Ankerteksten moeten natuurlijk in de tekst passen (geen "klik hier", geen "lees meer")
- Meta beschrijving: 130-155 tekens, bevat het hoofdkeyword en een CTA

Geef output als JSON (geen markdown, geen \`\`\`):
{
  "internalLinks": [
    {
      "title": "Naam van de pagina",
      "url": "/url-van-pagina",
      "anchor": "de ankertekst die in de zin past",
      "reason": "waarom relevant voor dit artikel"
    }
  ],
  "externalLinks": [
    {
      "title": "Naam van de bron",
      "url": "https://volledigeurl.nl/pagina",
      "domain": "domeinnaam.nl",
      "reason": "waarom deze bron autoriteit geeft"
    }
  ],
  "improvedKeywords": ["keyword 1", "keyword 2", "keyword 3"],
  "improvedMetaDesc": "Verbeterde meta beschrijving van 130-155 tekens"
}`

    const fallback = {
      internalLinks: [
        {
          title: 'Registreer gratis – Liefde Voor Iedereen',
          url: '/register',
          anchor: 'registreer gratis',
          reason: 'Altijd relevante CTA om lezers te converteren naar gebruikers'
        },
        {
          title: 'Premium functies',
          url: '/features',
          anchor: 'premium functies',
          reason: 'Doorverwijzing naar premium abonnement voor geïnteresseerde lezers'
        }
      ],
      externalLinks: [
        {
          title: 'Psychologie Magazine – Relaties',
          url: 'https://www.psychologiemagazine.nl/artikel/relaties',
          domain: 'psychologiemagazine.nl',
          reason: 'Autoriteit op het gebied van relatiepsychologie in Nederland'
        },
        {
          title: 'Thuisarts.nl – Relaties en liefde',
          url: 'https://www.thuisarts.nl',
          domain: 'thuisarts.nl',
          reason: 'Betrouwbare Nederlandse bron voor gezondheid en welzijn'
        }
      ],
      improvedKeywords: ['dating tips nederland 2026', 'online daten tips', 'relatie vinden tips'],
      improvedMetaDesc: seoDescription || `Ontdek de beste tips voor ${keywords?.[0] || 'daten'} en vind jouw match op Liefde Voor Iedereen. Praktisch advies voor Nederlandse singles.`
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(fallback)
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'Liefde Voor Iedereen SEO Assistant',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter error:', response.status)
      return NextResponse.json(fallback)
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content?.trim() || ''

    try {
      const cleaned = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim()
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      console.error('Failed to parse AI response, returning fallback')
      return NextResponse.json(fallback)
    }
  } catch (error) {
    console.error('SEO analyze error:', error)
    return NextResponse.json({ error: 'Analyse mislukt' }, { status: 500 })
  }
}
