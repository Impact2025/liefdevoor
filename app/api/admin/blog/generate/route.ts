import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { GeneratedBlogContent } from '@/lib/types/blog';

const requestSchema = z.object({
  primaryKeyword: z.string().min(3).max(100),
  category: z.string().uuid(),
  year: z.string().optional().default('2025'),
  targetAudience: z.string().optional(),
  toneOfVoice: z.string().optional().default('vriendelijk en motiverend'),
  articleLength: z.number().optional().default(1200),
  existingContent: z.string().optional(), // Bestaande content die alleen SEO-vriendelijk gemaakt moet worden
});

export async function POST(request: NextRequest) {
  try {
    // Admin authentication check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Check if user is admin
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { primaryKeyword, category, year, targetAudience, toneOfVoice, articleLength, existingContent } = result.data;

    // Fetch existing blog posts and kennisbank articles for internal linking
    const [publishedPosts, kennisbankArticles] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        select: { title: true, slug: true, excerpt: true },
        orderBy: { createdAt: 'desc' },
        take: 40,
      }),
      prisma.knowledgeBaseArticle.findMany({
        where: { isPublished: true },
        select: { titleNl: true, slug: true, excerptNl: true, category: { select: { slug: true } } },
        take: 20,
      }).catch(() => [] as any[]),
    ]);

    const internalPages = [
      { url: '/register', title: 'Registreer gratis – Liefde Voor Iedereen', desc: 'Gratis account aanmaken op het platform' },
      { url: '/features', title: 'Premium functies', desc: 'Overzicht van premium abonnement en mogelijkheden' },
      { url: '/veilig-daten', title: 'Veilig daten tips', desc: 'Veiligheid bij online daten' },
      { url: '/over-ons', title: 'Over Liefde Voor Iedereen', desc: 'Over het platform' },
      ...publishedPosts.map((p: any) => ({
        url: `/blog/${p.slug}`,
        title: p.title,
        desc: p.excerpt || 'Blog artikel'
      })),
      ...kennisbankArticles.map((a: any) => ({
        url: `/kennisbank/${a.category?.slug}/${a.slug}`,
        title: a.titleNl,
        desc: a.excerptNl || 'Kennisbank artikel'
      })),
    ];

    const internalPagesContext = internalPages
      .slice(0, 50)
      .map(p => `- "${p.title}" → ${p.url} (${p.desc})`)
      .join('\n');

    // Build the AI prompt
    const prompt = existingContent
      ? `Je bent een SEO expert voor Wereldklasse. Je taak is om bestaande content SEO-vriendelijk te maken ZONDER de tekst te herschrijven.

BESTAANDE CONTENT:
${existingContent}

BESCHIKBARE INTERNE PAGINA'S OM NAAR TE LINKEN:
${internalPagesContext}

TAAK: Maak deze content SEO-vriendelijk door:
1. Voeg HTML structuur toe: <h1>, <h2>, <h3>, <p> tags
2. Identificeer de hoofdtitel en maak er een <h1> van
3. Identificeer secties en maak er <h2>/<h3> van
4. Voeg MINIMAAL 10 interne links toe naar relevante pagina's uit de lijst hierboven
5. Kies links die INHOUDELIJK passen bij de betreffende alinea - niet geforceerd
6. Ankerteksten moeten natuurlijk klinken (geen "klik hier", geen "lees meer")
7. Link naar blog artikelen EN kennisbank artikelen die relevant zijn voor de context
8. Behoud de EXACTE tekst - verander GEEN woorden, zinnen of betekenis
9. Alleen structuur en links toevoegen!

PRIMARY KEYWORD: "${primaryKeyword}"
JAAR: ${year}
`
      : `Je bent een SEO expert en dating content specialist voor de Nederlandse markt. Je schrijft voor Liefde Voor Iedereen (liefdevooriedereen.nl), een dating platform voor iedereen inclusief mensen met een beperking.

TAAK: Schrijf een complete, SEO-geoptimaliseerde blog post over "${primaryKeyword}".

CONTEXT:
- Jaar: ${year}
- Doelgroep: ${targetAudience || '25-45 jaar, singles die serieus op zoek zijn naar een relatie'}
- Tone of voice: ${toneOfVoice}
- Gewenste lengte: ${articleLength} woorden

BESCHIKBARE INTERNE PAGINA'S OM NAAR TE LINKEN:
${internalPagesContext}

VEREISTEN:

1. CONTENT (HTML):
   - Gebruik semantische HTML tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>
   - Structuur: H1 (hoofdtitel) → intro paragraaf → 3-5 H2 secties met subsecties → conclusie met CTA
   - Voeg MINIMAAL 10 interne links toe door de gehele tekst, verspreid over alle secties
   - Kies links die INHOUDELIJK passen bij de betreffende alinea uit de lijst hierboven
   - Link naar blog artikelen EN kennisbank artikelen die relevant zijn, niet alleen /register
   - Ankerteksten moeten NATUURLIJK klinken en de context weerspiegelen (geen "klik hier")
   - Maak het praktisch met concrete tips en voorbeelden
   - Gebruik storytelling waar mogelijk
   - Probleem → Oplossing → Actie structuur
   - Geen emoji's

2. SEO METADATA:
   - seoTitle: Maximum 60 karakters, bevat primary keyword, pakkend en actionable
   - seoDescription: Maximum 155 karakters, bevat primary keyword, bevat CTA
   - keywords: Array van 5 long-tail keywords (Nederlands), gerelateerd aan het onderwerp

3. SOCIAL MEDIA:
   - instagram: 150 karakters max, inclusief hashtags (#datingtips #relatie #liefde)
   - facebook: 250 karakters max, vraag-element aan het einde
   - linkedin: 200 karakters max, professionele tone
   - twitter: 280 karakters max, pakkend met hashtags

4. FEATURED IMAGE:
   - midjourneyPrompt: Engelse prompt voor Midjourney/DALL-E, beschrijf een moderne, stijlvolle afbeelding die past bij het artikel
   - Stijl: "Modern lifestyle photography, warm tones, authentic Dutch people, professional quality"

5. EXCERPT:
   - 2-3 zinnen die de essentie van het artikel vatten
   - Maximum 200 karakters

OUTPUT FORMAT:
Geef je antwoord UITSLUITEND als een geldig JSON object (geen markdown, geen \`\`\`json tags):

{
  "content": "<h1>Titel</h1><p>Intro...</p><h2>Sectie 1</h2><p>...</p>...",
  "seoTitle": "...",
  "seoDescription": "...",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "socialMedia": {
    "instagram": "...",
    "facebook": "...",
    "linkedin": "...",
    "twitter": "..."
  },
  "midjourneyPrompt": "...",
  "excerpt": "..."
}

Begin nu met het schrijven van de blog post over "${primaryKeyword}".`;

    // Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback: return template-based content
      const fallbackContent: GeneratedBlogContent = {
        content: `<h1>${primaryKeyword}</h1>
<p>Welkom bij deze gids over ${primaryKeyword}. In dit artikel delen we waardevolle inzichten en praktische tips die je direct kunt toepassen.</p>

<h2>Waarom ${primaryKeyword} belangrijk is</h2>
<p>In de wereld van online dating is het essentieel om de juiste aanpak te hebben. ${primaryKeyword} speelt hierin een cruciale rol.</p>

<h2>Praktische tips</h2>
<ul>
<li>Begin met een authentiek profiel</li>
<li>Wees jezelf in gesprekken</li>
<li>Neem de tijd om iemand te leren kennen</li>
</ul>

<h2>Aan de slag</h2>
<p>Klaar om te beginnen? <a href="/register">Maak een gratis account</a> aan op Wereldklasse en ontdek alle mogelijkheden.</p>`,
        seoTitle: `${primaryKeyword} - Tips en Advies | Wereldklasse`,
        seoDescription: `Ontdek alles over ${primaryKeyword}. Praktische tips en advies voor succesvolle online dating in ${year}.`,
        keywords: [
          primaryKeyword,
          `${primaryKeyword} tips`,
          `dating ${year}`,
          'online dating tips',
          'relatie vinden'
        ],
        socialMedia: {
          instagram: `✨ ${primaryKeyword} - De beste tips voor ${year}! #datingtips #relatie #liefde`,
          facebook: `Benieuwd naar ${primaryKeyword}? Lees onze laatste blog met praktische tips en advies!`,
          linkedin: `${primaryKeyword}: Een professionele gids voor moderne dating in ${year}.`,
          twitter: `${primaryKeyword} - Alles wat je moet weten! 💕 #dating #tips`
        },
        midjourneyPrompt: `Modern lifestyle photography of diverse Dutch people having a meaningful conversation in a cozy cafe, warm lighting, authentic connection, professional quality, contemporary Dutch interior`,
        excerpt: `Ontdek alles over ${primaryKeyword} met praktische tips en advies voor succesvolle online dating.`
      };

      return NextResponse.json(fallbackContent);
    }

    // Use OpenRouter API with retry logic
    let lastError: any = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'X-Title': 'Wereldklasse Dating App',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3-haiku',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 6000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          if (response.status === 429 && attempt < maxRetries) {
            // Rate limited, wait and retry
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content?.trim();

        if (!rawContent) {
          throw new Error('No content received from AI');
        }

        // Try to parse JSON response
        let generatedContent: GeneratedBlogContent;
        try {
          // Remove markdown code blocks if present
          const cleanedContent = rawContent
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/, '')
            .replace(/```\s*$/, '')
            .trim();

          generatedContent = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Raw content:', rawContent);
          throw new Error('Failed to parse AI response as JSON');
        }

        // Validate required fields
        if (!generatedContent.content || !generatedContent.seoTitle || !generatedContent.seoDescription) {
          throw new Error('AI response missing required fields');
        }

        return NextResponse.json(generatedContent);

      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) {
          break;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    // All retries failed
    console.error('Blog generation failed after retries:', lastError);
    return NextResponse.json(
      { error: 'AI service tijdelijk niet beschikbaar', details: lastError?.message },
      { status: 503 }
    );

  } catch (error) {
    console.error('Blog generator error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
