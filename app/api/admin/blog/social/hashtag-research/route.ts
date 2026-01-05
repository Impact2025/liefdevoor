import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const requestSchema = z.object({
  topic: z.string().min(1).max(100),
  platform: z.enum(['instagram', 'facebook', 'linkedin', 'twitter']),
  niche: z.string().optional().default('dating'),
});

interface HashtagData {
  tag: string;
  volume: 'low' | 'medium' | 'high' | 'very_high';
  competition: 'low' | 'medium' | 'high';
  relevance: number; // 0-100
  trending: boolean;
  estimatedReach: string; // e.g., "10K-50K"
  suggestion: string; // Why use this hashtag
}

interface HashtagResearchResult {
  primary: HashtagData[]; // Highly relevant, medium-high volume
  supporting: HashtagData[]; // Complementary, various volumes
  trending: HashtagData[]; // Currently trending
  niche: HashtagData[]; // Low competition, targeted
  recommendations: string[];
}

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

    const { topic, platform, niche } = result.data;

    // Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback: Static hashtag database
      const fallbackResult = generateFallbackHashtags(topic, platform, niche);
      return NextResponse.json(fallbackResult);
    }

    // Use AI for hashtag research
    const prompt = `Je bent een social media hashtag expert. Doe hashtag research voor het onderwerp "${topic}" op ${platform} in de ${niche} niche.

Genereer hashtag aanbevelingen in 4 categorieën:
1. PRIMARY: Hoofd hashtags met goede balans tussen volume en competitie (3-4 tags)
2. SUPPORTING: Ondersteunende hashtags met variërend bereik (4-5 tags)
3. TRENDING: Trending hashtags relevant voor het onderwerp (2-3 tags)
4. NICHE: Niche hashtags met lage competitie maar hoge relevantie (2-3 tags)

Voor elke hashtag geef je:
- volume: low/medium/high/very_high (geschat bereik)
- competition: low/medium/high (hoe moeilijk om op te vallen)
- relevance: 0-100 (hoe relevant voor het onderwerp)
- trending: true/false
- estimatedReach: "X-Y" (bijv. "10K-50K", "100K-500K", "1M+")
- suggestion: korte uitleg waarom deze hashtag gebruiken

Geef je antwoord als geldig JSON (geen markdown):

{
  "primary": [
    {
      "tag": "#examplehashtag",
      "volume": "high",
      "competition": "medium",
      "relevance": 95,
      "trending": false,
      "estimatedReach": "500K-1M",
      "suggestion": "Meest relevante hashtag met goede zichtbaarheid"
    }
  ],
  "supporting": [...],
  "trending": [...],
  "niche": [...],
  "recommendations": [
    "Gebruik 2-3 primary hashtags voor maximaal bereik",
    "Mix met niche hashtags voor targeted audience",
    "Vermijd over-saturated hashtags boven 5M posts"
  ]
}`;

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
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenRouter API error');
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content?.trim();

      if (!rawContent) {
        throw new Error('No content received');
      }

      // Parse JSON
      const cleanedContent = rawContent
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim();

      const aiResult: HashtagResearchResult = JSON.parse(cleanedContent);

      return NextResponse.json(aiResult);

    } catch (aiError) {
      console.error('AI hashtag research failed, using fallback:', aiError);
      const fallbackResult = generateFallbackHashtags(topic, platform, niche);
      return NextResponse.json(fallbackResult);
    }

  } catch (error) {
    console.error('Hashtag research error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fallback hashtag database for dating niche
function generateFallbackHashtags(topic: string, platform: string, niche: string): HashtagResearchResult {
  // Dating-specific hashtag database
  const datingHashtags: Record<string, HashtagData> = {
    '#dating': { tag: '#dating', volume: 'very_high', competition: 'high', relevance: 95, trending: false, estimatedReach: '10M+', suggestion: 'Primaire dating hashtag met enorm bereik' },
    '#datingtips': { tag: '#datingtips', volume: 'high', competition: 'medium', relevance: 90, trending: true, estimatedReach: '500K-1M', suggestion: 'Populair voor advies content' },
    '#relatie': { tag: '#relatie', volume: 'high', competition: 'medium', relevance: 88, trending: false, estimatedReach: '500K-1M', suggestion: 'Nederlandse term met hoog engagement' },
    '#liefde': { tag: '#liefde', volume: 'very_high', competition: 'high', relevance: 85, trending: false, estimatedReach: '5M+', suggestion: 'Breed bereik, emotioneel' },
    '#onlinedating': { tag: '#onlinedating', volume: 'high', competition: 'high', relevance: 92, trending: false, estimatedReach: '1M-5M', suggestion: 'Specifiek voor online dating' },
    '#datingadvies': { tag: '#datingadvies', volume: 'medium', competition: 'low', relevance: 93, trending: false, estimatedReach: '100K-500K', suggestion: 'Niche, Nederlandse term' },
    '#relatietips': { tag: '#relatietips', volume: 'medium', competition: 'medium', relevance: 87, trending: true, estimatedReach: '200K-500K', suggestion: 'Trending voor advies content' },
    '#singles': { tag: '#singles', volume: 'very_high', competition: 'high', relevance: 80, trending: false, estimatedReach: '10M+', suggestion: 'Breed publiek, high volume' },
    '#singlelife': { tag: '#singlelife', volume: 'high', competition: 'medium', relevance: 75, trending: false, estimatedReach: '1M-5M', suggestion: 'Lifestyle content' },
    '#datingnl': { tag: '#datingnl', volume: 'low', competition: 'low', relevance: 95, trending: false, estimatedReach: '50K-100K', suggestion: 'Nederlandse niche, targeted' },
    '#matchmaking': { tag: '#matchmaking', volume: 'medium', competition: 'medium', relevance: 82, trending: false, estimatedReach: '200K-500K', suggestion: 'Professional dating services' },
    '#datingcoach': { tag: '#datingcoach', volume: 'medium', competition: 'medium', relevance: 88, trending: true, estimatedReach: '100K-500K', suggestion: 'Expert content, trending' },
  };

  // Topic-based filtering (simple keyword matching)
  const topicLower = topic.toLowerCase();
  const relevantHashtags = Object.values(datingHashtags).filter(h => {
    const tagLower = h.tag.toLowerCase();
    return tagLower.includes(topicLower.split(' ')[0]) || topicLower.includes(tagLower.slice(1));
  });

  // If not enough relevant hashtags, add general ones
  const allHashtags = relevantHashtags.length >= 8
    ? relevantHashtags
    : [...relevantHashtags, ...Object.values(datingHashtags)];

  // Categorize hashtags
  const primary = allHashtags
    .filter(h => h.relevance >= 85 && (h.competition === 'medium' || h.volume === 'high'))
    .slice(0, 4);

  const supporting = allHashtags
    .filter(h => h.relevance >= 75 && !primary.includes(h))
    .slice(0, 5);

  const trending = allHashtags
    .filter(h => h.trending)
    .slice(0, 3);

  const nicheTags = allHashtags
    .filter(h => h.competition === 'low' && h.relevance >= 85)
    .slice(0, 3);

  // Platform-specific recommendations
  const platformRecs: Record<string, string[]> = {
    instagram: [
      'Gebruik 8-12 hashtags voor optimaal bereik op Instagram',
      'Mix populaire (#dating) met niche (#datingnl) hashtags',
      'Plaats hashtags in eerste comment voor cleane caption',
      'Vermijd banned hashtags - check regelmatig Instagram policies'
    ],
    facebook: [
      'Gebruik 1-3 hashtags op Facebook - meer vermindert engagement',
      'Kies breed bereik hashtags zoals #dating en #relatie',
      'Hashtags zijn minder belangrijk dan goede content op Facebook'
    ],
    linkedin: [
      'Gebruik 3-5 professionele hashtags op LinkedIn',
      'Focus op expertise: #datingcoach, #relatieadvies',
      'LinkedIn hashtags helpen met discoverability in feed'
    ],
    twitter: [
      'Gebruik 1-2 hashtags op Twitter voor beste engagement',
      'Trending hashtags geven meer zichtbaarheid',
      'Te veel hashtags zien er spammy uit op Twitter'
    ],
  };

  return {
    primary: primary.length > 0 ? primary : allHashtags.slice(0, 4),
    supporting: supporting.length > 0 ? supporting : allHashtags.slice(4, 9),
    trending: trending.length > 0 ? trending : allHashtags.filter(h => h.trending).slice(0, 3),
    niche: nicheTags.length > 0 ? nicheTags : allHashtags.filter(h => h.competition === 'low').slice(0, 3),
    recommendations: platformRecs[platform] || platformRecs.instagram,
  };
}
