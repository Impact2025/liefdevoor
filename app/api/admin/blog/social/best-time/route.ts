import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const requestSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'linkedin', 'twitter']),
  targetAudience: z.string().optional().default('25-45 jaar, Nederlandse singles'),
  timezone: z.string().optional().default('Europe/Amsterdam'),
});

interface TimeSlot {
  day: string;
  time: string;
  score: number; // 0-100
  reason: string;
  engagement: 'low' | 'medium' | 'high' | 'peak';
}

interface BestTimeResult {
  platform: string;
  optimal: TimeSlot[]; // Top 3 best times
  good: TimeSlot[]; // 4-6 additional good times
  avoid: string[]; // Times to avoid
  insights: string[];
  weekdayPattern: string; // e.g., "Weekends 20% higher engagement"
  peakDay: string;
  peakTime: string;
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

    const { platform, targetAudience, timezone } = result.data;

    // Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback: Research-based best times
      const fallbackResult = generateBestTimes(platform, targetAudience, timezone);
      return NextResponse.json(fallbackResult);
    }

    // Use AI for personalized best time analysis
    const prompt = `Je bent een social media timing expert. Bepaal de beste post tijden voor ${platform}.

TARGET AUDIENCE: ${targetAudience}
TIMEZONE: ${timezone}
NICHE: Dating/Relaties

Analyseer op basis van:
1. Platform algoritme patronen
2. Doelgroep online gedrag (dating niche: vaak 's avonds actief)
3. Nederlandse markt specifics (lunchpauze 12-13u, avond 19-22u)
4. Dag van de week patronen

Geef de top 3 OPTIMALE tijden en 4-6 GOEDE tijden met scores.

Geef je antwoord als geldig JSON (geen markdown):

{
  "platform": "${platform}",
  "optimal": [
    {
      "day": "Dinsdag",
      "time": "20:00-21:00",
      "score": 95,
      "reason": "Peak tijd: doelgroep is thuis, relaxed, ontvangt notificaties",
      "engagement": "peak"
    }
  ],
  "good": [
    {
      "day": "Woensdag",
      "time": "12:30-13:00",
      "score": 78,
      "reason": "Lunchpauze - veel scrollers",
      "engagement": "high"
    }
  ],
  "avoid": [
    "Maandagochtend 6-9u (druk met werk)",
    "Vrijdagavond 22u+ (uitgaan)"
  ],
  "insights": [
    "Dating content presteert 30% beter op doordeweekse avonden",
    "Zondagavond: reflectie moment, hoge engagement voor relatie content"
  ],
  "weekdayPattern": "Dinsdag t/m Donderdag avond zijn peak dagen",
  "peakDay": "Dinsdag",
  "peakTime": "20:00-21:00"
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
          max_tokens: 1500,
          temperature: 0.4,
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

      const aiResult: BestTimeResult = JSON.parse(cleanedContent);

      return NextResponse.json(aiResult);

    } catch (aiError) {
      console.error('AI best time analysis failed, using fallback:', aiError);
      const fallbackResult = generateBestTimes(platform, targetAudience, timezone);
      return NextResponse.json(fallbackResult);
    }

  } catch (error) {
    console.error('Best time analysis error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Research-based best times for each platform (Dutch market, dating niche)
function generateBestTimes(platform: string, targetAudience: string, timezone: string): BestTimeResult {
  const platformData: Record<string, BestTimeResult> = {
    instagram: {
      platform: 'Instagram',
      optimal: [
        { day: 'Dinsdag', time: '20:00-21:00', score: 98, reason: 'Peak tijd: doelgroep is thuis, relaxed, scrolt door feed', engagement: 'peak' },
        { day: 'Woensdag', time: '19:30-20:30', score: 95, reason: 'Primetime voor dating content - mensen zijn receptief voor relatie content', engagement: 'peak' },
        { day: 'Zondag', time: '20:00-22:00', score: 93, reason: 'Zondagavond reflectie - hoogste engagement voor life & love content', engagement: 'peak' },
      ],
      good: [
        { day: 'Maandag', time: '12:00-13:00', score: 82, reason: 'Lunchpauze - quick scroll door Stories en Feed', engagement: 'high' },
        { day: 'Donderdag', time: '18:00-19:00', score: 80, reason: 'Net na werk - mensen checken social media', engagement: 'high' },
        { day: 'Vrijdag', time: '17:00-18:00', score: 78, reason: 'Weekend gevoel - positieve mindset voor dating content', engagement: 'high' },
        { day: 'Zaterdag', time: '10:00-12:00', score: 75, reason: 'Weekend ochtend - rustig scrollen bij koffie', engagement: 'medium' },
      ],
      avoid: [
        'Maandagochtend 6-9u (druk met werk, weinig tijd)',
        'Vrijdagavond 22u+ (uitgaan, niet online)',
        'Werkdagen 9-17u (kantooruren, minder actief op Instagram)'
      ],
      insights: [
        'Instagram Stories presteren best tussen 18-21u wanneer mensen thuis zijn',
        'Dating content krijgt 35% meer saves op dinsdag t/m donderdag avond',
        'Reels hebben hogere reach op zondag (algoritme boost weekend content)',
        'Nederlandse doelgroep is meest actief tussen 19:30-21:30 op doordeweekse dagen'
      ],
      weekdayPattern: 'Dinsdag-Donderdag avond 25% hoger engagement dan andere dagen',
      peakDay: 'Dinsdag',
      peakTime: '20:00-21:00',
    },
    facebook: {
      platform: 'Facebook',
      optimal: [
        { day: 'Woensdag', time: '13:00-14:00', score: 92, reason: 'Lunchtime peak - hoogste activity tijdens werkdag', engagement: 'peak' },
        { day: 'Donderdag', time: '19:00-20:00', score: 90, reason: 'Prime tijd voor langere content - mensen lezen artikelen', engagement: 'peak' },
        { day: 'Zondag', time: '19:00-21:00', score: 88, reason: 'Zondag avond - familie tijd, Facebook checken', engagement: 'high' },
      ],
      good: [
        { day: 'Dinsdag', time: '12:00-13:00', score: 80, reason: 'Lunch break scrolling', engagement: 'high' },
        { day: 'Vrijdag', time: '13:00-14:00', score: 78, reason: 'Middag dip - mensen zoeken afleiding', engagement: 'high' },
        { day: 'Zaterdag', time: '9:00-11:00', score: 75, reason: 'Weekend ochtend routine', engagement: 'medium' },
        { day: 'Maandag', time: '19:00-20:00', score: 72, reason: 'Avond relaxatie na werkdag', engagement: 'medium' },
      ],
      avoid: [
        'Vroege ochtend 5-8u (weinig gebruikers online)',
        'Late avond 23u+ (meeste mensen slapen)',
        'Zaterdag 17-22u (weekend sociale activiteiten)'
      ],
      insights: [
        'Facebook gebruikers lezen langere content - blog posts presteren goed',
        'Oudere doelgroep (35+) is meest actief tijdens kantooruren (lunchbreaks)',
        'Video content heeft 40% hogere reach op donderdag-vrijdag',
        'Nederlandse Facebook gebruikers zijn 20% meer actief op werkdagen vs weekend'
      ],
      weekdayPattern: 'Woensdag-Donderdag zijn beste dagen, lunch tijden (12-14u) zijn optimal',
      peakDay: 'Woensdag',
      peakTime: '13:00-14:00',
    },
    linkedin: {
      platform: 'LinkedIn',
      optimal: [
        { day: 'Dinsdag', time: '08:00-09:00', score: 95, reason: 'Ochtend commute & koffie tijd - hoogste professional engagement', engagement: 'peak' },
        { day: 'Woensdag', time: '12:00-13:00', score: 93, reason: 'Lunchtime - professionals checken LinkedIn feed', engagement: 'peak' },
        { day: 'Donderdag', time: '17:00-18:00', score: 90, reason: 'Net na werk - mensen zijn nog in werk mindset', engagement: 'high' },
      ],
      good: [
        { day: 'Maandag', time: '08:00-09:00', score: 85, reason: 'Week start - veel LinkedIn activity', engagement: 'high' },
        { day: 'Dinsdag', time: '12:00-13:00', score: 82, reason: 'Lunch scrolling bij professionals', engagement: 'high' },
        { day: 'Vrijdag', time: '11:00-12:00', score: 78, reason: 'Voor lunch - laatste werk check', engagement: 'medium' },
        { day: 'Woensdag', time: '17:00-18:00', score: 75, reason: 'End of workday browsing', engagement: 'medium' },
      ],
      avoid: [
        'Weekend (zaterdag-zondag) - 60% minder engagement',
        'Avonden na 19u - LinkedIn is werk-gerelateerd',
        'Vrijdagmiddag na 15u (mensen zijn mentaal al weekend in)'
      ],
      insights: [
        'LinkedIn algoritme boost content gepost tussen 7-9u (bereikt meer mensen tijdens werkdag)',
        'Dinsdag-Donderdag zijn beste dagen met 40% meer engagement dan maandag/vrijdag',
        'Professionele dating content (work-life balance, relatie tips voor professionals) presteert goed',
        'Nederlandse professionals zijn meest actief tussen 8-9u en 12-13u'
      ],
      weekdayPattern: 'Dinsdag-Donderdag ochtend (8-9u) en lunch (12-13u) zijn optimal voor bereik',
      peakDay: 'Dinsdag',
      peakTime: '08:00-09:00',
    },
    twitter: {
      platform: 'Twitter/X',
      optimal: [
        { day: 'Woensdag', time: '12:00-13:00', score: 90, reason: 'Lunchtime - hoogste activity, news checking', engagement: 'peak' },
        { day: 'Vrijdag', time: '09:00-10:00', score: 88, reason: 'Ochtend catch-up - veel scrolling', engagement: 'peak' },
        { day: 'Dinsdag', time: '18:00-19:00', score: 85, reason: 'Evening commute - mensen checken Twitter', engagement: 'high' },
      ],
      good: [
        { day: 'Maandag', time: '12:00-13:00', score: 78, reason: 'Lunch break tweets', engagement: 'high' },
        { day: 'Donderdag', time: '17:00-18:00', score: 75, reason: 'Na werk scrolling', engagement: 'high' },
        { day: 'Zondag', time: '20:00-21:00', score: 72, reason: 'Avond entertainment - mensen zijn online', engagement: 'medium' },
        { day: 'Zaterdag', time: '11:00-13:00', score: 70, reason: 'Weekend middag browsing', engagement: 'medium' },
      ],
      avoid: [
        'Vroege ochtend 5-7u (weinig activity)',
        'Late avond 23u+ (low engagement)',
        'Zondagochtend (mensen zijn offline)'
      ],
      insights: [
        'Twitter heeft kortere levensduur - post multiple keren per dag mogelijk',
        'Nieuws-gerelateerde content presteert best tijdens kantooruren',
        'Dating tips in tweet format krijgen meeste retweets rond lunchtime',
        'Nederlandse Twitter gebruikers zijn meest actief tijdens werkdagen 9-17u'
      ],
      weekdayPattern: 'Woensdag-Vrijdag lunch tijden (12-13u) zijn peak voor engagement',
      peakDay: 'Woensdag',
      peakTime: '12:00-13:00',
    },
  };

  return platformData[platform] || platformData.instagram;
}
