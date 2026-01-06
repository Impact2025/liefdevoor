/**
 * IP Reputation Tracker
 *
 * Houdt bij welke IP adressen verdacht gedrag vertonen:
 * - Meerdere mislukte registraties
 * - Spam accounts aangemaakt
 * - Rate limit overtredingen
 * - Verdachte patronen
 *
 * Gebruikt Redis voor persistente opslag en snelle lookups.
 */

import { getUpstash } from '../upstash'

export interface IPReputation {
  ip: string
  score: number // 0-100, hoger = slechter
  failedRegistrations: number
  successfulRegistrations: number
  spamAccountsCreated: number
  rateLimitHits: number
  lastActivity: string
  firstSeen: string
  flags: string[]
  isBlocked: boolean
}

export interface IPReputationUpdate {
  failedRegistration?: boolean
  successfulRegistration?: boolean
  spamAccountCreated?: boolean
  rateLimitHit?: boolean
  flag?: string
}

const IP_REPUTATION_PREFIX = 'spam:ip:'
const IP_REPUTATION_TTL = 30 * 24 * 60 * 60 // 30 dagen

// Bekende VPN/Proxy/Datacenter IP ranges (subset)
// In productie zou je een service als IPQualityScore of MaxMind gebruiken
const KNOWN_DATACENTER_RANGES = [
  // AWS
  '3.', '13.', '18.', '34.', '35.', '44.', '50.', '52.', '54.', '99.',
  // Google Cloud
  '34.', '35.', '104.', '108.', '142.',
  // Azure
  '13.', '20.', '40.', '51.', '52.', '65.', '104.',
  // DigitalOcean
  '104.131.', '104.236.', '107.170.', '138.68.', '139.59.', '142.93.',
  '157.230.', '159.65.', '161.35.', '164.90.', '165.22.', '167.71.',
  '167.172.', '174.138.', '178.62.', '178.128.', '188.166.', '192.241.',
  '198.199.', '206.189.', '209.97.',
  // Linode
  '45.33.', '45.56.', '45.79.', '50.116.', '66.175.', '69.164.',
  '72.14.', '74.207.', '96.126.', '97.107.', '139.162.', '172.104.',
  '173.230.', '173.255.', '176.58.', '178.79.', '192.155.', '198.58.',
  '198.74.', '212.71.',
  // Vultr
  '45.32.', '45.63.', '45.76.', '45.77.', '64.156.', '64.237.',
  '66.42.', '78.141.', '95.179.', '104.156.', '104.207.', '104.238.',
  '107.191.', '108.61.', '136.244.', '140.82.', '141.164.', '144.202.',
  '149.28.', '155.138.', '167.179.', '192.248.', '199.247.', '207.148.',
  '208.167.', '209.250.', '217.69.',
]

// Bekende Tor exit nodes (kleine subset, in productie gebruik een actuele lijst)
const KNOWN_TOR_EXITS = new Set([
  '185.220.101.', '185.220.102.', '185.220.103.',
  '162.247.74.', '162.247.72.', '162.247.73.',
  '104.244.72.', '104.244.73.', '104.244.74.',
  '199.249.230.', '209.141.32.', '209.141.33.',
])

/**
 * Check of een IP van een datacenter komt
 */
export function isDatacenterIP(ip: string): boolean {
  return KNOWN_DATACENTER_RANGES.some(range => ip.startsWith(range))
}

/**
 * Check of een IP een bekende Tor exit node is
 */
export function isTorExitNode(ip: string): boolean {
  return Array.from(KNOWN_TOR_EXITS).some(prefix => ip.startsWith(prefix))
}

/**
 * Haal IP reputation op uit Redis
 */
export async function getIPReputation(ip: string): Promise<IPReputation | null> {
  const redis = getUpstash()
  if (!redis) return null

  try {
    const data = await redis.get(`${IP_REPUTATION_PREFIX}${ip}`)
    if (!data) return null

    if (typeof data === 'string') {
      return JSON.parse(data) as IPReputation
    }
    return data as IPReputation
  } catch (error) {
    console.error('[IPReputation] Error getting reputation:', error)
    return null
  }
}

/**
 * Update IP reputation
 */
export async function updateIPReputation(
  ip: string,
  update: IPReputationUpdate
): Promise<IPReputation> {
  const redis = getUpstash()
  const now = new Date().toISOString()

  // Haal bestaande data op of maak nieuw
  let reputation = await getIPReputation(ip) || {
    ip,
    score: 0,
    failedRegistrations: 0,
    successfulRegistrations: 0,
    spamAccountsCreated: 0,
    rateLimitHits: 0,
    lastActivity: now,
    firstSeen: now,
    flags: [],
    isBlocked: false,
  }

  // Update counters
  if (update.failedRegistration) {
    reputation.failedRegistrations++
    reputation.score += 10
  }

  if (update.successfulRegistration) {
    reputation.successfulRegistrations++
    // Succesvolle registraties verlagen score niet direct
    // maar te veel is ook verdacht
    if (reputation.successfulRegistrations > 5) {
      reputation.score += 5
      if (!reputation.flags.includes('multiple_accounts')) {
        reputation.flags.push('multiple_accounts')
      }
    }
  }

  if (update.spamAccountCreated) {
    reputation.spamAccountsCreated++
    reputation.score += 30 // Zwaar bestraffen
    if (!reputation.flags.includes('spam_creator')) {
      reputation.flags.push('spam_creator')
    }
  }

  if (update.rateLimitHit) {
    reputation.rateLimitHits++
    reputation.score += 5
    if (reputation.rateLimitHits > 10) {
      if (!reputation.flags.includes('rate_limit_abuser')) {
        reputation.flags.push('rate_limit_abuser')
      }
    }
  }

  if (update.flag && !reputation.flags.includes(update.flag)) {
    reputation.flags.push(update.flag)
  }

  // Check voor datacenter/Tor
  if (isDatacenterIP(ip) && !reputation.flags.includes('datacenter_ip')) {
    reputation.flags.push('datacenter_ip')
    reputation.score += 15
  }

  if (isTorExitNode(ip) && !reputation.flags.includes('tor_exit')) {
    reputation.flags.push('tor_exit')
    reputation.score += 25
  }

  // Update timestamp
  reputation.lastActivity = now

  // Cap score at 100
  reputation.score = Math.min(100, reputation.score)

  // Auto-block bij hoge score
  if (reputation.score >= 80) {
    reputation.isBlocked = true
  }

  // Opslaan in Redis
  if (redis) {
    try {
      await redis.setex(
        `${IP_REPUTATION_PREFIX}${ip}`,
        IP_REPUTATION_TTL,
        JSON.stringify(reputation)
      )
    } catch (error) {
      console.error('[IPReputation] Error saving reputation:', error)
    }
  }

  return reputation
}

/**
 * Check of een IP geblokkeerd moet worden
 */
export async function shouldBlockIP(ip: string): Promise<{
  blocked: boolean
  reason?: string
  reputation?: IPReputation
}> {
  const reputation = await getIPReputation(ip)

  // Check bestaande block
  if (reputation?.isBlocked) {
    return {
      blocked: true,
      reason: 'IP is geblokkeerd vanwege verdacht gedrag',
      reputation,
    }
  }

  // Check score threshold
  if (reputation && reputation.score >= 70) {
    return {
      blocked: true,
      reason: `IP heeft een te hoge risicoscore (${reputation.score})`,
      reputation,
    }
  }

  // Check voor spam account creators
  if (reputation && reputation.spamAccountsCreated >= 2) {
    return {
      blocked: true,
      reason: 'IP heeft meerdere spam accounts aangemaakt',
      reputation,
    }
  }

  // Check voor te veel registraties in korte tijd
  if (reputation && reputation.successfulRegistrations >= 10) {
    return {
      blocked: true,
      reason: 'Te veel accounts aangemaakt vanaf dit IP',
      reputation,
    }
  }

  return { blocked: false, reputation: reputation || undefined }
}

/**
 * Markeer een account als spam (update IP reputation)
 */
export async function markAccountAsSpam(ip: string): Promise<void> {
  await updateIPReputation(ip, { spamAccountCreated: true })
}

/**
 * Haal alle geblokkeerde IPs op (voor admin dashboard)
 */
export async function getBlockedIPs(): Promise<IPReputation[]> {
  const redis = getUpstash()
  if (!redis) return []

  try {
    // Dit is een simpele implementatie
    // In productie zou je een aparte index bijhouden
    const keys = await redis.keys(`${IP_REPUTATION_PREFIX}*`)
    const blocked: IPReputation[] = []

    for (const key of keys.slice(0, 100)) { // Limit to 100
      const data = await redis.get(key)
      if (data) {
        const reputation = typeof data === 'string' ? JSON.parse(data) : data
        if (reputation.isBlocked || reputation.score >= 70) {
          blocked.push(reputation as IPReputation)
        }
      }
    }

    return blocked.sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error('[IPReputation] Error getting blocked IPs:', error)
    return []
  }
}

// Named export
export const IPReputationTracker = {
  get: getIPReputation,
  update: updateIPReputation,
  shouldBlock: shouldBlockIP,
  markSpam: markAccountAsSpam,
  getBlocked: getBlockedIPs,
  isDatacenter: isDatacenterIP,
  isTor: isTorExitNode,
}
