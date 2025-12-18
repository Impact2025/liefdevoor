/**
 * Real-time Presence Service
 *
 * Tracks user online status and last seen timestamps
 */

import { prisma } from '@/lib/prisma'

// In-memory store for active heartbeats (for performance)
const activeHeartbeats = new Map<string, NodeJS.Timeout>()

// Time in ms before user is considered offline
const OFFLINE_THRESHOLD = 5 * 60 * 1000 // 5 minutes

/**
 * Update user presence (call on every API request or heartbeat)
 */
export async function updatePresence(userId: string): Promise<void> {
  // Clear existing timeout
  const existingTimeout = activeHeartbeats.get(userId)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }

  // Update database
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastSeen: new Date(),
      isOnline: true,
    },
  })

  // Set timeout to mark offline
  const timeout = setTimeout(async () => {
    await markOffline(userId)
    activeHeartbeats.delete(userId)
  }, OFFLINE_THRESHOLD)

  activeHeartbeats.set(userId, timeout)
}

/**
 * Mark user as offline
 */
export async function markOffline(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline: false,
      lastSeen: new Date(),
    },
  })
}

/**
 * Get presence status for multiple users
 */
export async function getPresenceStatus(userIds: string[]): Promise<Map<string, { isOnline: boolean; lastSeen: Date | null }>> {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      isOnline: true,
      lastSeen: true,
    },
  })

  const result = new Map<string, { isOnline: boolean; lastSeen: Date | null }>()
  users.forEach(u => {
    result.set(u.id, {
      isOnline: u.isOnline,
      lastSeen: u.lastSeen,
    })
  })

  return result
}

/**
 * Get online users count
 */
export async function getOnlineCount(): Promise<number> {
  return prisma.user.count({
    where: { isOnline: true },
  })
}

/**
 * Format "last seen" for display
 */
export function formatLastSeen(lastSeen: Date | null, isOnline: boolean): string {
  if (isOnline) return 'Online'
  if (!lastSeen) return 'Onbekend'

  const now = new Date()
  const diff = now.getTime() - lastSeen.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Net gezien'
  if (minutes < 60) return `${minutes} min geleden`
  if (hours < 24) return `${hours} uur geleden`
  if (days === 1) return 'Gisteren'
  if (days < 7) return `${days} dagen geleden`
  return lastSeen.toLocaleDateString('nl-NL')
}

/**
 * Cleanup stale online statuses (run periodically)
 */
export async function cleanupStalePresence(): Promise<number> {
  const threshold = new Date(Date.now() - OFFLINE_THRESHOLD)

  const result = await prisma.user.updateMany({
    where: {
      isOnline: true,
      lastSeen: { lt: threshold },
    },
    data: {
      isOnline: false,
    },
  })

  return result.count
}
