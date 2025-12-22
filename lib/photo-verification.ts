/**
 * Photo Verification Service
 *
 * Analyzes photos for:
 * 1. AI-generated content detection
 * 2. Face presence and count
 * 3. Image quality assessment
 *
 * Uses OpenRouter API with vision-capable models
 */

interface PhotoAnalysisResult {
  isAiGenerated: boolean;
  aiConfidence: number; // 0.0 - 1.0
  hasFace: boolean;
  faceCount: number;
  qualityScore: number; // 0.0 - 1.0
  analysis: {
    aiIndicators: string[];
    qualityIssues: string[];
    recommendation: 'approve' | 'review' | 'reject';
    reasoning: string;
  };
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const ANALYSIS_PROMPT = `Je bent een expert foto-analysesysteem voor een datingplatform. Analyseer deze verificatiefoto en geef een JSON response.

BELANGRIJK: Dit is een verificatiefoto waarbij de gebruiker een selfie maakt om te bewijzen dat zij echt zijn.

Analyseer de foto op:
1. AI-GENERATED DETECTIE: Is deze foto mogelijk gemaakt door AI (Midjourney, Stable Diffusion, DALL-E, etc)?
   Let op: perfecte huid zonder poriën, onnatuurlijke ogen, vreemde achtergrond artefacten,
   asymmetrische oorbellen/accessoires, verkeerde anatomie, te perfecte belichting, waterige texturen

2. GEZICHTSDETECTIE: Is er een menselijk gezicht zichtbaar? Hoeveel gezichten?

3. KWALITEITSBEOORDELING: Is de foto geschikt voor profielverificatie?
   Let op: belichting, scherpte, gezicht zichtbaarheid, is het een echte foto (geen screenshot van andere foto)

Geef je antwoord ALLEEN als valid JSON in dit exacte format:
{
  "isAiGenerated": boolean,
  "aiConfidence": number (0.0-1.0, hoe zeker je bent dat het AI is),
  "hasFace": boolean,
  "faceCount": number,
  "qualityScore": number (0.0-1.0, overall kwaliteit),
  "aiIndicators": ["lijst van AI-kenmerken gevonden, of lege array"],
  "qualityIssues": ["lijst van kwaliteitsproblemen, of lege array"],
  "recommendation": "approve" | "review" | "reject",
  "reasoning": "Korte uitleg van je conclusie in het Nederlands"
}`;

/**
 * Analyze a photo using OpenRouter vision API
 */
export async function analyzePhoto(photoUrl: string): Promise<PhotoAnalysisResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not configured');
    // Return safe defaults that require manual review
    return getDefaultAnalysisResult('API niet geconfigureerd - handmatige review vereist');
  }

  try {
    // Use GPT-4o-mini for cost-effective vision analysis
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'LVI Photo Verification',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: ANALYSIS_PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: photoUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for consistent analysis
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return getDefaultAnalysisResult(`API fout: ${response.status}`);
    }

    const data = await response.json() as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenRouter response');
      return getDefaultAnalysisResult('Geen analyse ontvangen');
    }

    // Parse the JSON response
    const parsed = parseAnalysisResponse(content);
    return parsed;

  } catch (error) {
    console.error('Photo analysis error:', error);
    return getDefaultAnalysisResult(`Analyse fout: ${error instanceof Error ? error.message : 'Onbekend'}`);
  }
}

/**
 * Parse the AI response into our structured format
 */
function parseAnalysisResponse(content: string): PhotoAnalysisResult {
  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content);
      return getDefaultAnalysisResult('Kon analyse niet parsen');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and normalize the response
    return {
      isAiGenerated: Boolean(parsed.isAiGenerated),
      aiConfidence: normalizeScore(parsed.aiConfidence),
      hasFace: Boolean(parsed.hasFace),
      faceCount: Math.max(0, parseInt(parsed.faceCount) || 0),
      qualityScore: normalizeScore(parsed.qualityScore),
      analysis: {
        aiIndicators: Array.isArray(parsed.aiIndicators) ? parsed.aiIndicators : [],
        qualityIssues: Array.isArray(parsed.qualityIssues) ? parsed.qualityIssues : [],
        recommendation: validateRecommendation(parsed.recommendation),
        reasoning: String(parsed.reasoning || 'Geen uitleg beschikbaar'),
      },
    };
  } catch (error) {
    console.error('Failed to parse analysis response:', error, content);
    return getDefaultAnalysisResult('Parse error in analyse');
  }
}

/**
 * Normalize a score to 0.0 - 1.0 range
 */
function normalizeScore(value: unknown): number {
  const num = parseFloat(String(value));
  if (isNaN(num)) return 0.5;
  return Math.max(0, Math.min(1, num));
}

/**
 * Validate recommendation value
 */
function validateRecommendation(value: unknown): 'approve' | 'review' | 'reject' {
  if (value === 'approve' || value === 'review' || value === 'reject') {
    return value;
  }
  return 'review'; // Default to review if invalid
}

/**
 * Get default analysis result for error cases
 */
function getDefaultAnalysisResult(reason: string): PhotoAnalysisResult {
  return {
    isAiGenerated: false,
    aiConfidence: 0,
    hasFace: true, // Assume true to not auto-reject
    faceCount: 1,
    qualityScore: 0.5,
    analysis: {
      aiIndicators: [],
      qualityIssues: [reason],
      recommendation: 'review',
      reasoning: reason,
    },
  };
}

/**
 * Determine verification priority based on analysis
 * Higher = more urgent review needed
 */
export function calculatePriority(analysis: PhotoAnalysisResult): number {
  let priority = 0;

  // High confidence AI-generated = highest priority
  if (analysis.isAiGenerated && analysis.aiConfidence > 0.8) {
    priority += 100;
  } else if (analysis.isAiGenerated && analysis.aiConfidence > 0.5) {
    priority += 50;
  }

  // No face detected = high priority
  if (!analysis.hasFace) {
    priority += 75;
  }

  // Multiple faces = medium priority
  if (analysis.faceCount > 1) {
    priority += 25;
  }

  // Low quality = medium priority
  if (analysis.qualityScore < 0.3) {
    priority += 30;
  }

  // Recommendation-based priority
  if (analysis.analysis.recommendation === 'reject') {
    priority += 50;
  } else if (analysis.analysis.recommendation === 'review') {
    priority += 20;
  }

  return priority;
}

/**
 * Get status based on analysis
 */
export function getInitialStatus(analysis: PhotoAnalysisResult): 'pending' | 'flagged' {
  // Flag for immediate attention if high-confidence AI or no face
  if (
    (analysis.isAiGenerated && analysis.aiConfidence > 0.7) ||
    !analysis.hasFace ||
    analysis.analysis.recommendation === 'reject'
  ) {
    return 'flagged';
  }
  return 'pending';
}
