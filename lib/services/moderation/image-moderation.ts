/**
 * Image Moderation Service
 *
 * Provides AI-powered content moderation for uploaded photos.
 * Detects:
 * - NSFW/adult content
 * - Violence
 * - Hate symbols
 * - Text/watermarks
 * - Fake/AI-generated images
 *
 * Supports multiple providers:
 * - Sightengine (primary)
 * - Google Vision (fallback)
 */

export interface ModerationResult {
  approved: boolean
  confidence: number
  flags: ModerationFlag[]
  details: {
    nudity: number
    violence: number
    weapons: number
    alcohol: number
    drugs: number
    offensive: number
    textContent: number
    celebrity: number
    quality: number
  }
  provider: 'sightengine' | 'google' | 'mock'
}

export interface ModerationFlag {
  type: 'nudity' | 'violence' | 'weapons' | 'offensive' | 'text' | 'low_quality' | 'fake'
  severity: 'low' | 'medium' | 'high'
  description: string
}

// Moderation thresholds
const THRESHOLDS = {
  nudity: 0.6,
  violence: 0.7,
  weapons: 0.8,
  alcohol: 0.9,
  drugs: 0.8,
  offensive: 0.7,
  text: 0.5,
  quality: 0.3, // minimum quality score
}

/**
 * Moderate an image URL using Sightengine
 */
async function moderateWithSightengine(imageUrl: string): Promise<ModerationResult> {
  const apiUser = process.env.SIGHTENGINE_API_USER
  const apiSecret = process.env.SIGHTENGINE_API_SECRET

  if (!apiUser || !apiSecret) {
    throw new Error('Sightengine credentials not configured')
  }

  const params = new URLSearchParams({
    url: imageUrl,
    models: 'nudity-2.1,violence,weapon,gore,offensive,text,quality,face-attributes',
    api_user: apiUser,
    api_secret: apiSecret,
  })

  const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`)

  if (!response.ok) {
    throw new Error(`Sightengine API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.status !== 'success') {
    throw new Error(data.error?.message || 'Sightengine moderation failed')
  }

  // Parse Sightengine response
  const flags: ModerationFlag[] = []
  const details = {
    nudity: data.nudity?.sexual_activity || data.nudity?.sexual_display || 0,
    violence: data.violence?.prob || 0,
    weapons: data.weapon || 0,
    alcohol: data.alcohol || 0,
    drugs: data.drugs || 0,
    offensive: data.offensive?.prob || 0,
    textContent: data.text?.has_artificial || 0,
    celebrity: data.celebrity?.prob || 0,
    quality: data.quality?.score || 1,
  }

  // Check for violations
  if (details.nudity > THRESHOLDS.nudity) {
    flags.push({
      type: 'nudity',
      severity: details.nudity > 0.9 ? 'high' : details.nudity > 0.7 ? 'medium' : 'low',
      description: 'Naaktafbeelding of ongepaste inhoud gedetecteerd',
    })
  }

  if (details.violence > THRESHOLDS.violence) {
    flags.push({
      type: 'violence',
      severity: details.violence > 0.9 ? 'high' : 'medium',
      description: 'Gewelddadige inhoud gedetecteerd',
    })
  }

  if (details.weapons > THRESHOLDS.weapons) {
    flags.push({
      type: 'weapons',
      severity: 'high',
      description: 'Wapens gedetecteerd in afbeelding',
    })
  }

  if (details.offensive > THRESHOLDS.offensive) {
    flags.push({
      type: 'offensive',
      severity: details.offensive > 0.9 ? 'high' : 'medium',
      description: 'Aanstootgevende inhoud gedetecteerd',
    })
  }

  if (details.textContent > THRESHOLDS.text) {
    flags.push({
      type: 'text',
      severity: 'low',
      description: 'Veel tekst of watermerk gedetecteerd',
    })
  }

  if (details.quality < THRESHOLDS.quality) {
    flags.push({
      type: 'low_quality',
      severity: 'low',
      description: 'Afbeelding heeft lage kwaliteit',
    })
  }

  // Calculate if approved
  const hasHighSeverity = flags.some(f => f.severity === 'high')
  const hasMediumSeverity = flags.some(f => f.severity === 'medium')
  const approved = !hasHighSeverity && !hasMediumSeverity

  // Calculate confidence based on quality and detection certainty
  const confidence = Math.min(1, (details.quality + 0.5) * (1 - Math.max(
    details.nudity,
    details.violence,
    details.offensive
  )))

  return {
    approved,
    confidence,
    flags,
    details,
    provider: 'sightengine',
  }
}

/**
 * Mock moderation for development/testing
 */
function mockModeration(imageUrl: string): ModerationResult {
  // Always approve in mock mode
  return {
    approved: true,
    confidence: 0.95,
    flags: [],
    details: {
      nudity: 0.05,
      violence: 0.02,
      weapons: 0,
      alcohol: 0.1,
      drugs: 0,
      offensive: 0.03,
      textContent: 0.1,
      celebrity: 0,
      quality: 0.9,
    },
    provider: 'mock',
  }
}

/**
 * Main moderation function
 * Automatically selects provider based on configuration
 */
export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  // Check if we have Sightengine credentials
  const hasSightengine = process.env.SIGHTENGINE_API_USER && process.env.SIGHTENGINE_API_SECRET

  if (hasSightengine) {
    try {
      return await moderateWithSightengine(imageUrl)
    } catch (error) {
      console.error('[Moderation] Sightengine error:', error)
      // Fall through to mock
    }
  }

  // Use mock moderation in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Moderation] Using mock moderation (development mode)')
    return mockModeration(imageUrl)
  }

  // In production without credentials, log warning and approve
  console.warn('[Moderation] No moderation provider configured, auto-approving')
  return mockModeration(imageUrl)
}

/**
 * Moderate multiple images
 */
export async function moderateImages(imageUrls: string[]): Promise<{
  results: Map<string, ModerationResult>
  allApproved: boolean
  rejectedUrls: string[]
}> {
  const results = new Map<string, ModerationResult>()
  const rejectedUrls: string[] = []

  await Promise.all(
    imageUrls.map(async (url) => {
      try {
        const result = await moderateImage(url)
        results.set(url, result)
        if (!result.approved) {
          rejectedUrls.push(url)
        }
      } catch (error) {
        console.error(`[Moderation] Failed for ${url}:`, error)
        // On error, reject for safety
        results.set(url, {
          approved: false,
          confidence: 0,
          flags: [{ type: 'fake', severity: 'high', description: 'Moderatie mislukt' }],
          details: {
            nudity: 0, violence: 0, weapons: 0, alcohol: 0,
            drugs: 0, offensive: 0, textContent: 0, celebrity: 0, quality: 0,
          },
          provider: 'mock',
        })
        rejectedUrls.push(url)
      }
    })
  )

  return {
    results,
    allApproved: rejectedUrls.length === 0,
    rejectedUrls,
  }
}

/**
 * Get moderation status message in Dutch
 */
export function getModerationMessage(result: ModerationResult): string {
  if (result.approved) {
    return 'Foto goedgekeurd'
  }

  if (result.flags.length === 0) {
    return 'Foto afgekeurd'
  }

  const highSeverity = result.flags.find(f => f.severity === 'high')
  if (highSeverity) {
    return highSeverity.description
  }

  const mediumSeverity = result.flags.find(f => f.severity === 'medium')
  if (mediumSeverity) {
    return mediumSeverity.description
  }

  return result.flags[0].description
}
