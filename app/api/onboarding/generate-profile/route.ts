import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Style prompts for different profile styles
const STYLE_PROMPTS = {
  humorous: `Je schrijft humoristische, luchtige dating profielen.
Gebruik geestige woordspelingen en zelfspot.
Eindig met een speelse vraag of uitnodiging.
Toon: Vrolijk, grappig, toegankelijk.`,

  authentic: `Je schrijft authentieke, diepgaande dating profielen.
Focus op echte emoties en persoonlijke verhalen.
Toon kwetsbaarheid en oprechtheid.
Eindig met een betekenisvolle vraag.
Toon: Warm, oprecht, reflectief.`,

  minimalist: `Je schrijft korte, intrigerende dating profielen.
Gebruik mysterieuze, prikkelende zinnen.
Laat veel over aan de verbeelding.
Eindig met een uitdagende vraag.
Toon: Mysterieus, zelfverzekerd, minimalistisch.`,
};

// Fallback profiles when AI fails
const FALLBACK_PROFILES = {
  humorous: [
    `Zoekt: iemand die mijn slechte grappen waardeert en mijn kookkunsten overleeft. Biedt: eindeloze Netflix-discussies, spontane avonturen, en iemand die altijd het laatste stukje pizza aan jou geeft (soms). Swipe rechts als je durft - ik beloof dat ik interessanter ben dan dit profiel doet vermoeden! ☕`,
    `Professioneel koffiedrinker en amateur-levensfilosoof. Mijn hobby's zijn: doen alsof ik weet waar ik mee bezig ben, en zoeken naar de perfecte playlist voor elke situatie. Bonus: ik kan gemiddeld 3 minuten boeien met een verhaal over mijn dag. Interesse?`,
    `Warning: bevat hoge doses sarcasme en onverwachte foodie-momenten. Ik zoek iemand die snapt dat "even snel boodschappen doen" minimaal een uur duurt. Inclusief snacks. Ben jij mijn partner in crime voor het volgende avontuur?`,
  ],
  authentic: [
    `Ik geloof in echte connecties en gesprekken die verder gaan dan het oppervlak. Na jaren van zelfontdekking weet ik wat ik zoek: iemand die durft te zijn wie ze echt zijn. Iemand die net als ik weet dat de beste momenten vaak onverwacht komen. Ben je klaar om samen nieuwe herinneringen te maken?`,
    `Het leven heeft me geleerd dat kwetsbaarheid kracht is. Ik zoek geen perfectie, maar echtheid. Iemand die kan lachen om het kleine, en stil kan zijn bij het grote. Als jij ook gelooft dat de beste relaties gebouwd zijn op vertrouwen en avontuur, laten we dan kennis maken.`,
    `Wat me drijft? Nieuwsgierigheid naar mensen, passie voor groei, en de overtuiging dat liefde begint met vriendschap. Ik zoek iemand die niet bang is voor diepgang, maar ook kan genieten van een spontane roadtrip. Wat is jouw verhaal?`,
  ],
  minimalist: [
    `Koffie. Boeken. Avontuur. Zoekt: partner voor het onverwachte. Interesse?`,
    `Minder praten, meer doen. Spontane roadtrips > Netflix. Ben jij in?`,
    `Simpel: goede gesprekken, betere koffie, de beste avonturen. Swipe als je durft.`,
  ],
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userData, personalDetails, partnerPreferences, style } = await request.json();

    // Validate input
    if (!personalDetails?.length || !partnerPreferences?.length || !style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build context from user data
    const context = buildContext(userData, personalDetails, partnerPreferences);
    const stylePrompt = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS] || STYLE_PROMPTS.authentic;

    // Try AI generation
    const profiles = await generateWithAI(context, stylePrompt, style);

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Profile generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

function buildContext(
  userData: Record<string, unknown>,
  personalDetails: string[],
  partnerPreferences: string[]
): string {
  const parts: string[] = [];

  // Basic info
  if (userData?.name) parts.push(`Naam: ${userData.name}`);
  if (userData?.gender) {
    const genderMap: Record<string, string> = { MALE: 'Man', FEMALE: 'Vrouw', NON_BINARY: 'Non-binair' };
    parts.push(`Gender: ${genderMap[userData.gender as string] || userData.gender}`);
  }
  if (userData?.lookingFor) {
    const lookingForMap: Record<string, string> = { MALE: 'mannen', FEMALE: 'vrouwen', BOTH: 'iedereen' };
    parts.push(`Zoekt: ${lookingForMap[userData.lookingFor as string] || userData.lookingFor}`);
  }

  // Relationship goal
  if (userData?.relationshipGoal) {
    const goalMap: Record<string, string> = {
      serious: 'een serieuze relatie',
      casual: 'iets casuals',
      friendship: 'vriendschap',
      open: 'open voor alles',
    };
    parts.push(`Doel: ${goalMap[userData.relationshipGoal as string] || userData.relationshipGoal}`);
  }

  // Personal details
  if (personalDetails.length > 0) {
    parts.push(`\nPersoonlijke kenmerken:\n- ${personalDetails.join('\n- ')}`);
  }

  // Partner preferences
  if (partnerPreferences.length > 0) {
    parts.push(`\nZoekt in een partner:\n- ${partnerPreferences.join('\n- ')}`);
  }

  // Interests
  if (userData?.interests && Array.isArray(userData.interests) && userData.interests.length > 0) {
    parts.push(`\nInteresses: ${(userData.interests as string[]).join(', ')}`);
  }

  return parts.join('\n');
}

async function generateWithAI(context: string, stylePrompt: string, style: string): Promise<string[]> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    console.log('No OpenRouter API key, using fallback profiles');
    return getFallbackProfiles(style);
  }

  const systemPrompt = `Je bent een expert dating profiel schrijver voor de Nederlandse markt.

${stylePrompt}

BELANGRIJK:
- Schrijf in natuurlijk Nederlands (geen formeel taalgebruik)
- Gebruik Nederlandse culturele elementen waar passend (gezelligheid, directheid)
- Houd profielen tussen 80-120 woorden
- Gebruik maximaal 1-2 emoji's per profiel (of geen)
- Eindig met een uitnodigende vraag of call-to-action
- Maak elk profiel uniek en persoonlijk
- Vermijd clichés als "wandelen op het strand" tenzij specifiek genoemd

Je genereert precies 3 verschillende profielen in dezelfde stijl.
Geef alleen de 3 profielen, gescheiden door "---", zonder extra tekst.`;

  const userPrompt = `Genereer 3 unieke dating profielen voor deze persoon:

${context}

Geef precies 3 profielen, gescheiden door "---".`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://liefdevooriedereen.nl',
        'X-Title': 'Liefde Voor Iedereen - Profile Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse the 3 profiles
    const profiles = content
      .split('---')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 50);

    if (profiles.length >= 3) {
      return profiles.slice(0, 3);
    }

    // If parsing failed, try to split by double newlines
    const altProfiles = content
      .split('\n\n')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 50);

    if (altProfiles.length >= 3) {
      return altProfiles.slice(0, 3);
    }

    // Fallback to pre-written profiles
    return getFallbackProfiles(style);
  } catch (error) {
    console.error('AI generation failed:', error);
    return getFallbackProfiles(style);
  }
}

function getFallbackProfiles(style: string): string[] {
  const profiles = FALLBACK_PROFILES[style as keyof typeof FALLBACK_PROFILES];
  return profiles || FALLBACK_PROFILES.authentic;
}
