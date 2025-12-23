'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SwipeDirection } from '@prisma/client';

/**
 * Log detailed swipe behavior for AI learning
 *
 * This captures HOW users interact, not just WHAT they choose.
 * This data is GOLD for improving matching algorithms.
 */
export async function logSwipeBehavior({
  targetId,
  direction,
  viewingDurationMs,
  photoViewCount = 1,
  bioExpanded = false,
  scrollDepth,
  voiceIntroPlayed = false,
  sessionPosition,
  platform,
}: {
  targetId: string;
  direction: 'LEFT' | 'RIGHT' | 'UP' | 'TIMEOUT';
  viewingDurationMs: number;
  photoViewCount?: number;
  bioExpanded?: boolean;
  scrollDepth?: number;
  voiceIntroPlayed?: boolean;
  sessionPosition?: number;
  platform?: string;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: 'Niet ingelogd' };
    }

    const userId = session.user.id;

    // Save to SwipeLog
    await prisma.swipeLog.create({
      data: {
        userId,
        targetProfileId: targetId,
        direction: direction as SwipeDirection,
        viewingDurationMs,
        photoViewCount,
        bioExpanded,
        scrollDepth,
        voiceIntroPlayed,
        sessionPosition,
        platform,
      },
    });

    // If user liked (RIGHT or UP), analyze for preference discrepancies
    if (direction === 'RIGHT' || direction === 'UP') {
      // Run async analysis - don't block the response
      analyzeUserPreference(userId, targetId).catch(console.error);
    }

    // If user spent > 10 seconds but swiped LEFT, that's interesting data
    // They were interested but something turned them off
    if (direction === 'LEFT' && viewingDurationMs > 10000) {
      logInterestButReject(userId, targetId, viewingDurationMs).catch(console.error);
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging swipe behavior:', error);
    return { success: false, error: 'Kon gedrag niet opslaan' };
  }
}

/**
 * Analyze if user's swipe behavior matches their stated preferences
 *
 * Example: User says they want ages 25-30, but consistently swipes right on 35-45.
 * This helps us improve matching by learning TRUE preferences.
 */
async function analyzeUserPreference(userId: string, targetId: string) {
  try {
    // Get user's explicit preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        minAgePreference: true,
        maxAgePreference: true,
        lookingFor: true,
      },
    });

    if (!user) return;

    // Get target profile info
    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        birthDate: true,
        gender: true,
        semanticTags: true,
      },
    });

    if (!target || !target.birthDate) return;

    // Calculate target's age
    const targetAge = Math.floor(
      (Date.now() - target.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    // Check for age discrepancy
    const isOutsideAgeRange =
      targetAge < user.minAgePreference || targetAge > user.maxAgePreference;

    if (isOutsideAgeRange) {
      // User swiped right on someone outside their stated age range
      // This is valuable data!

      // Get recent swipes to establish pattern
      const recentLikes = await prisma.swipeLog.findMany({
        where: {
          userId,
          direction: { in: ['RIGHT', 'UP'] },
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          targetProfileId: true,
        },
        take: 50,
      });

      // If pattern is consistent (e.g., >30% of likes are outside stated range)
      // We might want to record this discrepancy
      if (recentLikes.length >= 10) {
        // Count how many are outside the range
        const targetProfiles = await prisma.user.findMany({
          where: {
            id: { in: recentLikes.map(l => l.targetProfileId) },
          },
          select: {
            birthDate: true,
          },
        });

        let outsideRangeCount = 0;
        targetProfiles.forEach(p => {
          if (p.birthDate) {
            const age = Math.floor(
              (Date.now() - p.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
            );
            if (age < user.minAgePreference || age > user.maxAgePreference) {
              outsideRangeCount++;
            }
          }
        });

        const discrepancyRate = outsideRangeCount / targetProfiles.length;

        if (discrepancyRate > 0.3) {
          // Significant discrepancy detected
          // Upsert the discrepancy record
          await prisma.preferenceDiscrepancy.upsert({
            where: {
              id: `${userId}-age-preference`, // We'd need a proper unique field
            },
            create: {
              userId,
              explicitPref: `age: ${user.minAgePreference}-${user.maxAgePreference}`,
              implicitPref: `Consistently likes outside stated age range (${Math.round(discrepancyRate * 100)}%)`,
              confidence: discrepancyRate,
              sampleSize: targetProfiles.length,
            },
            update: {
              implicitPref: `Consistently likes outside stated age range (${Math.round(discrepancyRate * 100)}%)`,
              confidence: discrepancyRate,
              sampleSize: targetProfiles.length,
              updatedAt: new Date(),
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error analyzing user preference:', error);
  }
}

/**
 * Log when someone shows interest but ultimately rejects
 *
 * This helps identify what specific factors are deal-breakers.
 */
async function logInterestButReject(
  userId: string,
  targetId: string,
  viewingDurationMs: number
) {
  try {
    // For now, just log to console
    // In production, this could feed into ML models
    console.log(`[Implicit Data] User ${userId} showed interest (${viewingDurationMs}ms) but rejected ${targetId}`);

    // Future: Compare target's profile with user's stated preferences
    // to identify specific deal-breakers (e.g., smoking, children, etc.)
  } catch (error) {
    console.error('Error logging interest-but-reject:', error);
  }
}

/**
 * Track profile view for "Who viewed me" feature
 */
export async function logProfileView(viewedId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false };
    }

    const viewerId = session.user.id;

    // Don't log self-views
    if (viewerId === viewedId) return { success: true };

    // Upsert profile view (updates viewedAt if exists)
    await prisma.profileView.upsert({
      where: {
        viewerId_viewedId: { viewerId, viewedId },
      },
      create: {
        viewerId,
        viewedId,
      },
      update: {
        viewedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error logging profile view:', error);
    return { success: false };
  }
}

/**
 * Get behavioral insights for a user (admin/debug only)
 */
export async function getUserBehaviorInsights(targetUserId: string) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admins or the user themselves
    if (!session?.user?.id) {
      return { success: false, error: 'Niet ingelogd' };
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isSelf = session.user.id === targetUserId;

    if (!isAdmin && !isSelf) {
      return { success: false, error: 'Geen toegang' };
    }

    // Get swipe statistics
    const swipeLogs = await prisma.swipeLog.groupBy({
      by: ['direction'],
      where: { userId: targetUserId },
      _count: { id: true },
      _avg: { viewingDurationMs: true },
    });

    // Get average viewing time
    const avgViewingTime = await prisma.swipeLog.aggregate({
      where: { userId: targetUserId },
      _avg: { viewingDurationMs: true },
    });

    // Get bio expansion rate
    const totalSwipes = await prisma.swipeLog.count({
      where: { userId: targetUserId },
    });

    const bioExpandedCount = await prisma.swipeLog.count({
      where: { userId: targetUserId, bioExpanded: true },
    });

    return {
      success: true,
      insights: {
        swipeDistribution: swipeLogs,
        avgViewingTimeMs: avgViewingTime._avg.viewingDurationMs,
        bioExpansionRate: totalSwipes > 0 ? bioExpandedCount / totalSwipes : 0,
      },
    };
  } catch (error) {
    console.error('Error getting behavior insights:', error);
    return { success: false, error: 'Kon inzichten niet laden' };
  }
}
