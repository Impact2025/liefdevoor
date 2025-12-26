/**
 * Admin API Validation Schemas
 *
 * Zod schemas voor alle admin operations
 * Gebruikt in combinatie met validateBody() helper
 */

import { z } from 'zod'

/**
 * User Management Schemas
 */
export const userActionSchema = z.object({
  userId: z.string().cuid('Invalid user ID format'),
  action: z.enum(['ban', 'unban', 'promote', 'demote'], {
    errorMap: () => ({ message: 'Action must be ban, unban, promote, or demote' })
  }),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .optional()
})

export const bulkUserActionSchema = z.object({
  userIds: z.array(z.string().cuid())
    .min(1, 'At least one user ID required')
    .max(50, 'Cannot perform bulk action on more than 50 users at once'),
  action: z.enum(['ban', 'unban', 'approve', 'reject']),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters for audit trail')
    .max(500, 'Reason must not exceed 500 characters')
})

export const userSearchSchema = z.object({
  search: z.string().max(100).optional(),
  role: z.enum(['USER', 'ADMIN', 'BANNED', '']).optional(),
  isVerified: z.enum(['true', 'false', '']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

/**
 * Report Management Schemas
 */
export const reportActionSchema = z.object({
  reportId: z.string().cuid('Invalid report ID format'),
  action: z.enum(['resolve', 'dismiss', 'escalate'], {
    errorMap: () => ({ message: 'Action must be resolve, dismiss, or escalate' })
  }),
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  resolution: z.string()
    .min(10, 'Resolution description required (min 10 characters)')
    .max(500)
    .optional()
})

export const bulkReportActionSchema = z.object({
  reportIds: z.array(z.string().cuid())
    .min(1)
    .max(50),
  action: z.enum(['resolve', 'dismiss']),
  notes: z.string().max(500).optional()
})

/**
 * Verification Management Schemas
 */
export const verificationActionSchema = z.object({
  verificationId: z.string().cuid(),
  action: z.enum(['approve', 'reject']),
  reason: z.string()
    .min(10)
    .max(500)
    .optional()
    .refine(
      (val, ctx) => {
        // Reason required for rejections
        if (ctx.parent.action === 'reject' && !val) {
          return false
        }
        return true
      },
      { message: 'Rejection reason is required' }
    )
})

export const bulkVerificationActionSchema = z.object({
  verificationIds: z.array(z.string().cuid())
    .min(1)
    .max(50),
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional()
})

/**
 * Blog Management Schemas
 */
export const blogPostCreateSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(50000, 'Content must not exceed 50,000 characters'),
  excerpt: z.string()
    .min(20, 'Excerpt must be at least 20 characters')
    .max(500, 'Excerpt must not exceed 500 characters')
    .trim(),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  categoryId: z.string().cuid('Invalid category ID').optional(),
  tags: z.array(z.string().trim().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().optional()
})

export const blogPostUpdateSchema = blogPostCreateSchema.partial().extend({
  id: z.string().cuid()
})

export const blogPostDeleteSchema = z.object({
  id: z.string().cuid()
})

/**
 * Coupon Management Schemas
 */
export const couponCreateSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code must not exceed 50 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores')
    .trim()
    .toUpperCase(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number()
    .positive('Discount value must be positive')
    .refine(
      (val, ctx) => {
        if (ctx.parent.discountType === 'PERCENTAGE' && val > 100) {
          return false
        }
        return true
      },
      { message: 'Percentage discount cannot exceed 100%' }
    ),
  maxUses: z.number()
    .int()
    .positive()
    .optional(),
  maxUsesPerUser: z.number()
    .int()
    .positive()
    .max(10, 'Max uses per user cannot exceed 10')
    .optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  applicablePlans: z.array(z.enum(['PREMIUM', 'GOLD']))
    .min(1, 'At least one applicable plan required')
    .optional()
})

export const couponUpdateSchema = couponCreateSchema.partial().extend({
  id: z.string().cuid()
})

export const couponToggleSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean()
})

/**
 * Email Management Schemas
 */
export const emailTestSchema = z.object({
  type: z.enum([
    'welcome',
    'verification',
    'match',
    'message',
    'password_reset',
    'subscription_confirmation',
    'subscription_cancelled'
  ], {
    errorMap: () => ({ message: 'Invalid email type' })
  })
})

export const emailBroadcastSchema = z.object({
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters')
    .trim(),
  content: z.string()
    .min(20, 'Content must be at least 20 characters')
    .max(10000, 'Content must not exceed 10,000 characters'),
  recipientFilter: z.object({
    role: z.enum(['USER', 'ADMIN', 'ALL']).optional(),
    subscriptionTier: z.enum(['FREE', 'PREMIUM', 'GOLD', 'ALL']).optional(),
    isVerified: z.boolean().optional(),
    lastActiveAfter: z.string().datetime().optional()
  }).optional(),
  scheduleFor: z.string().datetime().optional()
})

/**
 * Moderation Schemas
 */
export const conversationModerationSchema = z.object({
  matchId: z.string().cuid(),
  action: z.enum(['warn_user', 'delete_messages', 'ban_user', 'dismiss']),
  userId: z.string().cuid().optional(), // Which user to action
  messageIds: z.array(z.string().cuid()).optional(),
  reason: z.string()
    .min(10)
    .max(500)
    .optional()
    .refine(
      (val, ctx) => {
        // Reason required for ban and delete actions
        if (['ban_user', 'delete_messages'].includes(ctx.parent.action) && !val) {
          return false
        }
        return true
      },
      { message: 'Reason required for this action' }
    )
})

/**
 * Export Schemas
 */
export const dataExportSchema = z.object({
  type: z.enum(['users', 'matches', 'reports', 'subscriptions', 'audit_logs']),
  filters: z.record(z.any()).optional(),
  format: z.enum(['csv', 'json']).default('csv'),
  fields: z.array(z.string()).optional() // Specific fields to export
})

/**
 * Analytics Schemas
 */
export const analyticsQuerySchema = z.object({
  metric: z.enum([
    'user_growth',
    'daily_matches',
    'message_volume',
    'conversion_funnel',
    'cohort_retention',
    'dau_mau',
    'subscription_trends'
  ]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  filters: z.record(z.any()).optional()
})

/**
 * Subscription Management Schemas
 */
export const subscriptionActionSchema = z.object({
  subscriptionId: z.string().cuid(),
  action: z.enum(['cancel', 'reactivate', 'change_plan']),
  newPlan: z.enum(['FREE', 'PREMIUM', 'GOLD']).optional(),
  reason: z.string().max(500).optional()
})

/**
 * Audit Log Schemas
 */
export const auditLogQuerySchema = z.object({
  action: z.string().optional(),
  userId: z.string().cuid().optional(),
  targetUserId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  success: z.enum(['true', 'false', '']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50)
})

/**
 * Generic ID Schema
 */
export const idSchema = z.object({
  id: z.string().cuid('Invalid ID format')
})

/**
 * Type exports for TypeScript
 */
export type UserActionInput = z.infer<typeof userActionSchema>
export type BulkUserActionInput = z.infer<typeof bulkUserActionSchema>
export type ReportActionInput = z.infer<typeof reportActionSchema>
export type VerificationActionInput = z.infer<typeof verificationActionSchema>
export type BlogPostCreateInput = z.infer<typeof blogPostCreateSchema>
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>
export type CouponCreateInput = z.infer<typeof couponCreateSchema>
export type CouponUpdateInput = z.infer<typeof couponUpdateSchema>
export type EmailTestInput = z.infer<typeof emailTestSchema>
export type EmailBroadcastInput = z.infer<typeof emailBroadcastSchema>
export type ConversationModerationInput = z.infer<typeof conversationModerationSchema>
export type DataExportInput = z.infer<typeof dataExportSchema>
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>
export type SubscriptionActionInput = z.infer<typeof subscriptionActionSchema>
export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>
