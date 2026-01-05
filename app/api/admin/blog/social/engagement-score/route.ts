import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const requestSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'linkedin', 'twitter']),
  content: z.string().min(1).max(2000),
  hashtags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
});

interface EngagementScore {
  score: number; // 0-100
  metrics: {
    contentQuality: number;
    hashtagEffectiveness: number;
    lengthOptimization: number;
    callToAction: number;
    visualAppeal: number;
  };
  tips: string[];
  strengths: string[];
  warnings: string[];
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

    const { platform, content, hashtags = [], imageUrl } = result.data;

    // Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback: Rule-based scoring
      const score = calculateBasicScore(platform, content, hashtags, imageUrl);
      return NextResponse.json(score);
    }

    // Use AI for advanced scoring
    const prompt = `Je bent een social media expert die engagement voorspelt. Analyseer deze ${platform} post en geef een engagement score.

POST CONTENT:
${content}

HASHTAGS: ${hashtags.join(', ') || 'geen'}
IMAGE: ${imageUrl ? 'ja' : 'nee'}
PLATFORM: ${platform}

Analyseer op basis van:
1. Content kwaliteit (boeiend, relevant, emotioneel)
2. Hashtag effectiviteit (relevant, niet te veel/weinig)
3. Lengte optimalisatie (ideale lengte voor platform)
4. Call-to-action (vraag, engagement driver)
5. Visuele aantrekkingskracht

Geef je antwoord als geldig JSON (geen markdown):

{
  "score": 0-100,
  "metrics": {
    "contentQuality": 0-100,
    "hashtagEffectiveness": 0-100,
    "lengthOptimization": 0-100,
    "callToAction": 0-100,
    "visualAppeal": 0-100
  },
  "tips": ["concrete verbetertip 1", "tip 2", "tip 3"],
  "strengths": ["sterke punt 1", "sterke punt 2"],
  "warnings": ["waarschuwing 1 als score laag is"]
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
          max_tokens: 1000,
          temperature: 0.3,
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

      const aiScore: EngagementScore = JSON.parse(cleanedContent);

      return NextResponse.json(aiScore);

    } catch (aiError) {
      console.error('AI scoring failed, using fallback:', aiError);
      const fallbackScore = calculateBasicScore(platform, content, hashtags, imageUrl);
      return NextResponse.json(fallbackScore);
    }

  } catch (error) {
    console.error('Engagement score error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Rule-based fallback scoring
function calculateBasicScore(
  platform: string,
  content: string,
  hashtags: string[],
  imageUrl?: string
): EngagementScore {
  const metrics = {
    contentQuality: 0,
    hashtagEffectiveness: 0,
    lengthOptimization: 0,
    callToAction: 0,
    visualAppeal: 0,
  };

  const tips: string[] = [];
  const strengths: string[] = [];
  const warnings: string[] = [];

  // Content Quality (emotionele woorden, vragen, emojis)
  const emotionalWords = /\b(geweldig|fantastisch|liefde|belangrijk|ontdek|geheim|tip)\b/gi;
  const emotionalMatches = content.match(emotionalWords)?.length || 0;
  metrics.contentQuality = Math.min(100, 50 + emotionalMatches * 10);

  if (emotionalMatches > 0) {
    strengths.push('Gebruikt emotionele trigger woorden');
  } else {
    tips.push('Voeg emotionele woorden toe zoals "ontdek", "geheim", "geweldig"');
  }

  // Hashtag Effectiveness
  const idealHashtagCount = platform === 'instagram' ? 8 : platform === 'twitter' ? 2 : 3;
  const hashtagDiff = Math.abs(hashtags.length - idealHashtagCount);
  metrics.hashtagEffectiveness = Math.max(0, 100 - hashtagDiff * 15);

  if (hashtags.length === 0) {
    tips.push(`Voeg ${idealHashtagCount} relevante hashtags toe voor betere vindbaarheid`);
    warnings.push('Geen hashtags gebruikt - post wordt minder gevonden');
  } else if (hashtags.length > idealHashtagCount + 3) {
    tips.push(`Verminder naar ${idealHashtagCount} hashtags - te veel vermindert engagement`);
  } else {
    strengths.push('Goede hashtag balans');
  }

  // Length Optimization
  const optimalLengths: Record<string, { min: number; max: number }> = {
    instagram: { min: 100, max: 150 },
    facebook: { min: 150, max: 250 },
    linkedin: { min: 120, max: 200 },
    twitter: { min: 100, max: 200 },
  };

  const optimal = optimalLengths[platform] || { min: 100, max: 200 };
  const length = content.length;

  if (length < optimal.min) {
    metrics.lengthOptimization = (length / optimal.min) * 100;
    tips.push(`Post is te kort (${length} chars). Optimaal: ${optimal.min}-${optimal.max} karakters`);
  } else if (length > optimal.max) {
    metrics.lengthOptimization = Math.max(50, 100 - ((length - optimal.max) / optimal.max) * 50);
    tips.push(`Post is te lang (${length} chars). Optimaal: ${optimal.min}-${optimal.max} karakters`);
    warnings.push('Te lange posts krijgen minder engagement');
  } else {
    metrics.lengthOptimization = 100;
    strengths.push('Perfecte lengte voor platform');
  }

  // Call to Action
  const hasQuestion = /\?/.test(content);
  const hasCTA = /\b(klik|lees|ontdek|deel|tag|comment|reageer|vertel)\b/gi.test(content);

  if (hasQuestion && hasCTA) {
    metrics.callToAction = 100;
    strengths.push('Sterke call-to-action met vraag');
  } else if (hasQuestion || hasCTA) {
    metrics.callToAction = 70;
    strengths.push('Bevat engagement element');
  } else {
    metrics.callToAction = 30;
    tips.push('Voeg een vraag of call-to-action toe (bijv. "Wat vind jij?", "Deel je ervaring")');
    warnings.push('Geen call-to-action - weinig interactie verwacht');
  }

  // Visual Appeal
  if (imageUrl) {
    metrics.visualAppeal = 100;
    strengths.push('Heeft featured image');
  } else {
    metrics.visualAppeal = 20;
    tips.push('Voeg een aantrekkelijke afbeelding toe - posts met beeld krijgen 2x meer engagement');
    warnings.push('Geen afbeelding - posts zonder beeld presteren 50% slechter');
  }

  // Calculate overall score (weighted average)
  const score = Math.round(
    metrics.contentQuality * 0.3 +
    metrics.hashtagEffectiveness * 0.2 +
    metrics.lengthOptimization * 0.2 +
    metrics.callToAction * 0.15 +
    metrics.visualAppeal * 0.15
  );

  return {
    score,
    metrics,
    tips: tips.slice(0, 4), // Max 4 tips
    strengths: strengths.slice(0, 3), // Max 3 strengths
    warnings,
  };
}
