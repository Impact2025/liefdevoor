import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const requestSchema = z.object({
  topics: z.array(z.string()).min(1).max(5),
  name: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY']).optional(),
  lookingFor: z.enum(['MALE', 'FEMALE', 'BOTH']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { topics, name, gender, lookingFor } = result.data;

    // Build context for the AI
    const genderText = gender === 'MALE' ? 'man' : gender === 'FEMALE' ? 'vrouw' : 'persoon';
    const lookingForText = lookingFor === 'MALE' ? 'mannen' : lookingFor === 'FEMALE' ? 'vrouwen' : 'iedereen';

    const prompt = `Je bent een behulpzame assistent voor een Nederlandse dating app. Schrijf een korte, warme en authentieke bio voor een dating profiel.

Informatie over de gebruiker:
- Naam: ${name || 'Onbekend'}
- Ik ben een: ${genderText}
- Ik zoek: ${lookingForText}
- Interesses/onderwerpen: ${topics.join(', ')}

Schrijf een bio die:
- In het Nederlands is
- Maximaal 200 tekens lang is
- Warm en uitnodigend klinkt
- De genoemde interesses verwerkt
- Eindigt met een vraag of uitnodiging
- Geen emoji's gebruikt
- Authentiek en persoonlijk aanvoelt

Geef alleen de bio tekst terug, geen aanhalingstekens of extra uitleg.`;

    // Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback: return a template-based bio
      const fallbackBios: Record<string, string> = {
        'wandelen': `Ik geniet van wandelen in de natuur en ontdek graag nieuwe plekjes. ${lookingFor === 'BOTH' ? 'Ben jij ook avontuurlijk?' : lookingForText === 'mannen' ? 'Ben jij ook avontuurlijk?' : 'Ben jij ook avontuurlijk?'}`,
        'koken': `In de keuken voel ik me helemaal thuis. Van nieuwe recepten tot gezellige etentjes - daar word ik blij van. Samen koken?`,
        'reizen': `Nieuwe plekken ontdekken is mijn passie. Of het nu dichtbij of ver weg is, elke reis is een avontuur. Waar ga jij graag naartoe?`,
        'muziek': `Muziek maakt alles beter. Of het nu een concert is of gewoon thuis luisteren - het raakt me altijd. Wat is jouw favoriete artiest?`,
        'sport': `Bewegen houdt me fit en gelukkig. Of het nu hardlopen, fietsen of naar de sportschool is. Samen sporten is nog leuker!`,
        'films': `Een goede film of serie, daar kan ik van genieten. Van spanning tot romantiek - ik kijk het allemaal. Zin om samen te kijken?`,
        'default': `Ik ben op zoek naar iemand om leuke dingen mee te doen en echte gesprekken mee te voeren. Ben jij die persoon?`,
      };

      // Find a matching fallback
      const matchedTopic = topics.find(t =>
        Object.keys(fallbackBios).some(key => t.toLowerCase().includes(key))
      );

      const bio = matchedTopic
        ? fallbackBios[Object.keys(fallbackBios).find(key => matchedTopic.toLowerCase().includes(key)) || 'default']
        : fallbackBios['default'];

      return NextResponse.json({ bio });
    }

    // Use OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Liefde Voor Iedereen Dating App',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText);
      return NextResponse.json({ error: 'AI service niet beschikbaar' }, { status: 503 });
    }

    const data = await response.json();
    const bio = data.choices?.[0]?.message?.content?.trim();

    if (!bio) {
      return NextResponse.json({ error: 'Kon geen bio genereren' }, { status: 500 });
    }

    // Clean up the bio (remove quotes if present)
    const cleanedBio = bio.replace(/^["']|["']$/g, '').trim();

    return NextResponse.json({ bio: cleanedBio });
  } catch (error) {
    console.error('Bio generator error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
