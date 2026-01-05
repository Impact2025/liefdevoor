/**
 * Centralized Caching Module
 *
 * This module provides reusable caching functions using Next.js unstable_cache.
 * Cache is automatically revalidated based on time or tags.
 *
 * Benefits:
 * - Reduces database load
 * - Improves API response times
 * - Automatic cache invalidation
 * - Production-ready with Edge support
 */

import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATION = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 900,        // 15 minutes
  HOUR: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
} as const

/**
 * Cache tags for selective invalidation
 */
export const CACHE_TAGS = {
  USER_PROFILE: 'user-profile',
  BLOG_POSTS: 'blog-posts',
  BLOG_POST: 'blog-post',
  CATEGORIES: 'categories',
  MATCHES: 'matches',
  NOTIFICATIONS: 'notifications',
} as const

/**
 * Get cached user profile by ID
 *
 * Cache duration: 5 minutes
 * Revalidate on: user profile updates
 */
export const getCachedProfile = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        birthDate: true,
        gender: true,
        city: true,
        postcode: true,
        preferences: true,
        profileImage: true,
        voiceIntro: true,
        role: true,
        isVerified: true,
        safetyScore: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        // Lifestyle fields
        occupation: true,
        education: true,
        height: true,
        drinking: true,
        smoking: true,
        children: true,
        photos: {
          select: {
            id: true,
            url: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!user) return null

    return {
      ...user,
      preferences: user.preferences || null,
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
    }
  },
  ['user-profile'],
  {
    revalidate: CACHE_DURATION.MEDIUM,
    tags: [CACHE_TAGS.USER_PROFILE]
  }
)

/**
 * Get cached user profile with photos by ID
 *
 * Cache duration: 5 minutes
 */
export const getCachedProfileWithPhotos = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        birthDate: true,
        gender: true,
        city: true,
        postcode: true,
        preferences: true,
        profileImage: true,
        voiceIntro: true,
        role: true,
        isVerified: true,
        safetyScore: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        // Lifestyle fields
        occupation: true,
        education: true,
        height: true,
        drinking: true,
        smoking: true,
        children: true,
        photos: {
          select: {
            id: true,
            url: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!user) return null

    return {
      ...user,
      preferences: user.preferences || null,
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
    }
  },
  ['user-profile-with-photos'],
  {
    revalidate: CACHE_DURATION.MEDIUM,
    tags: [CACHE_TAGS.USER_PROFILE]
  }
)

/**
 * Get cached published blog posts
 *
 * Cache duration: 1 hour
 * Revalidate on: new posts published
 */
export const getCachedBlogPosts = unstable_cache(
  async (options: { limit?: number; categoryId?: string } = {}) => {
    const { limit, categoryId } = options

    const posts = await prisma.post.findMany({
      where: {
        published: true,
        ...(categoryId && { categoryId }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        bannerText: true,
        createdAt: true,
        updatedAt: true,
        likeCount: true,
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: limit }),
    })

    return posts
  },
  ['blog-posts'],
  {
    revalidate: CACHE_DURATION.HOUR,
    tags: [CACHE_TAGS.BLOG_POSTS]
  }
)

/**
 * Get cached blog post by slug
 *
 * Cache duration: 1 hour
 */
export const getCachedBlogPost = unstable_cache(
  async (slug: string) => {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        likeCount: true,
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            description: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return post
  },
  ['blog-post'],
  {
    revalidate: CACHE_DURATION.HOUR,
    tags: [CACHE_TAGS.BLOG_POST]
  }
)

/**
 * Get cached blog categories
 *
 * Cache duration: 24 hours
 */
export const getCachedCategories = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        description: true,
        color: true,
        _count: {
          select: {
            posts: {
              where: { published: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    })

    return categories
  },
  ['blog-categories'],
  {
    revalidate: CACHE_DURATION.DAY,
    tags: [CACHE_TAGS.CATEGORIES]
  }
)

/**
 * Get cached matches for a user
 *
 * Cache duration: 1 minute (frequently changing data)
 */
export const getCachedMatches = unstable_cache(
  async (userId: string) => {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            city: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            city: true,
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            read: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1, // Only get last message
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1
      const lastMessage = match.messages[0] || null

      return {
        id: match.id,
        createdAt: match.createdAt,
        otherUser,
        lastMessage,
      }
    })
  },
  ['user-matches'],
  {
    revalidate: CACHE_DURATION.SHORT,
    tags: [CACHE_TAGS.MATCHES]
  }
)

/**
 * Cache invalidation helper
 *
 * Use this to invalidate specific cache tags after mutations
 */
export async function revalidateCache(tag: string) {
  // Use Next.js revalidateTag for cache invalidation
  const { revalidateTag } = await import('next/cache')
  revalidateTag(tag)
  console.log(`[Cache] Revalidated tag: ${tag}`)
}

/**
 * Cache warmup helper for critical data
 *
 * Call this during app initialization or deployment
 */
export async function warmupCache() {
  console.log('[Cache] Starting cache warmup...')

  try {
    // Warmup blog categories (most frequently accessed)
    await getCachedCategories()

    // Warmup recent blog posts
    await getCachedBlogPosts({ limit: 10 })

    console.log('[Cache] Warmup completed successfully')
  } catch (error) {
    console.error('[Cache] Warmup failed:', error)
  }
}
