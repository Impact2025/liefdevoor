/**
 * API Type Definitions
 *
 * Standardized types for all API requests and responses.
 * This ensures type safety across the entire application.
 */

import { Gender, Role } from '@prisma/client'

// ==============================================
// GENERIC API TYPES
// ==============================================

/**
 * Standard API Response wrapper
 * All API endpoints should return this structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  pagination?: Pagination
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

// ==============================================
// USER TYPES
// ==============================================

/**
 * Basic user information
 */
export interface User {
  id: string
  name: string | null
  email: string | null
  profileImage: string | null
  role: Role
  createdAt: Date
}

/**
 * Full user profile with all details
 */
export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  profileImage: string | null
  bio: string | null
  birthDate: string | null // ISO date string
  gender: Gender | null
  city: string | null
  postcode: string | null
  // Lifestyle fields
  occupation: string | null
  education: string | null
  height: number | null
  drinking: string | null
  smoking: string | null
  children: string | null
  // Preferences & other
  preferences: UserPreferences | null
  voiceIntro: string | null
  role: Role
  isVerified: boolean
  safetyScore: number
  latitude: number | null
  longitude: number | null
  createdAt: Date
  updatedAt: Date
  photos?: Photo[]
  // Psychological profile
  psychProfile?: PsychProfileData | null
  // Dealbreakers/filters
  dealbreakers?: DealbreakersData | null
}

/**
 * Psychological profile data
 */
export interface PsychProfileData {
  relationshipGoal?: string | null
  introvertScale?: number | null
  emotionalScale?: number | null
  spontaneityScale?: number | null
  adventureScale?: number | null
  conflictStyle?: string | null
  communicationStyle?: string | null
  loveLangWords?: number | null
  loveLangTime?: number | null
  loveLangGifts?: number | null
  loveLangActs?: number | null
  loveLangTouch?: number | null
}

/**
 * User dealbreakers/filters
 */
export interface DealbreakersData {
  mustNotSmoke?: boolean | null
  mustNotDrink?: boolean | null
  mustWantChildren?: boolean | null
  mustNotHaveChildren?: boolean | null
  mustBeVerified?: boolean | null
  maxDistance?: number | null
  minHeight?: number | null
  maxHeight?: number | null
}

/**
 * User preferences for matching
 */
export interface UserPreferences {
  minAge?: number
  maxAge?: number
  genderPreference?: Gender
  maxDistance?: number // in km
  interests?: string[]
}

/**
 * Photo object
 */
export interface Photo {
  id: string
  url: string
  order: number
}

/**
 * Compatibility breakdown scores
 */
export interface CompatibilityBreakdown {
  overall: number
  interests: number
  bio: number
  location: number
  activity: number
  personality?: number
  loveLanguage?: number
  lifestyle?: number
}

/**
 * Discover user - profile shown in discover feed
 */
export interface DiscoverUser extends Omit<UserProfile, 'email' | 'preferences'> {
  distance?: number
  compatibility?: number
  compatibilityBreakdown?: CompatibilityBreakdown
  matchReasons?: string[]  // "Jullie houden allebei van reizen"
  photos: Photo[]
  interests?: string  // Comma-separated interests
}

/**
 * Public user profile (limited info for privacy)
 */
export interface PublicUserProfile {
  id: string
  name: string
  profileImage: string | null
  bio: string | null
  age: number
  city: string | null
  photos: Photo[]
}

// ==============================================
// MATCH & MESSAGE TYPES
// ==============================================

/**
 * Match between two users
 */
export interface Match {
  id: string
  createdAt: Date
  otherUser: MatchUser
  lastMessage?: Message | null
  unreadCount?: number
}

/**
 * User information in a match
 */
export interface MatchUser {
  id: string
  name: string | null
  profileImage: string | null
  city: string | null
}

/**
 * Message in a conversation
 */
export interface Message {
  id: string
  content: string | null
  audioUrl?: string | null
  gifUrl?: string | null
  read: boolean
  createdAt: Date
  senderId: string
  sender?: MessageSender
  isFromMe?: boolean
}

/**
 * Message sender information
 */
export interface MessageSender {
  id: string
  name: string | null
  profileImage: string | null
}

// ==============================================
// SWIPE & ACTION TYPES
// ==============================================

/**
 * Swipe action
 */
export interface SwipeAction {
  swipedId: string
  isLike: boolean
  isSuperLike?: boolean
}

/**
 * Swipe limits info
 */
export interface SwipeLimits {
  swipesRemaining: number  // -1 for unlimited
  superLikesRemaining: number  // -1 for unlimited
}

/**
 * Swipe result
 */
export interface SwipeResult {
  success: boolean
  isMatch?: boolean
  match?: Match
  limits?: SwipeLimits
}

// ==============================================
// BLOG TYPES
// ==============================================

/**
 * Blog post
 */
export interface BlogPost {
  id: string
  title: string
  content: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
  likeCount: number
  author: BlogAuthor
  category: BlogCategory
  readTime?: number
}

/**
 * Blog post preview (list view)
 */
export interface BlogPostPreview {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  createdAt: Date
  likeCount: number
  author: BlogAuthor
  category: BlogCategory
  readTime?: number
}

/**
 * Blog author
 */
export interface BlogAuthor {
  id: string
  name: string
  profileImage: string | null
  bio?: string | null
}

/**
 * Blog category
 */
export interface BlogCategory {
  id: string
  name: string
  icon: string
  color: string
  description?: string | null
}

/**
 * Blog comment
 */
export interface BlogComment {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string
    profileImage: string | null
  }
}

// ==============================================
// NOTIFICATION TYPES
// ==============================================

/**
 * Notification types
 */
export type NotificationType = 'new_match' | 'new_message' | 'admin_alert' | 'system'

/**
 * Notification
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedId: string | null
  createdAt: Date
}

// ==============================================
// SUBSCRIPTION TYPES
// ==============================================

/**
 * Subscription plans
 */
export type SubscriptionPlan = 'basic' | 'premium' | 'gold'

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'

/**
 * Subscription
 */
export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate: Date
  endDate: Date | null
  features: SubscriptionFeature[]
}

/**
 * Subscription feature
 */
export interface SubscriptionFeature {
  name: string
  description: string
  included: boolean
}

// ==============================================
// REPORT & MODERATION TYPES
// ==============================================

/**
 * Report reason
 */
export type ReportReason =
  | 'harassment'
  | 'inappropriate_content'
  | 'spam'
  | 'fake_profile'
  | 'underage'
  | 'other'

/**
 * Report status
 */
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

/**
 * Report
 */
export interface Report {
  id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  createdAt: Date
  reportedUser: {
    id: string
    name: string
    profileImage: string | null
  }
}

// ==============================================
// FORM INPUT TYPES
// ==============================================

/**
 * Login form data
 */
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Register form data
 */
export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  birthDate: string
  gender: Gender
  acceptedTerms: boolean
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  name?: string
  bio?: string
  birthDate?: string
  gender?: Gender
  city?: string
  postcode?: string
  interests?: string
  preferences?: UserPreferences
}

/**
 * Report user data
 */
export interface ReportUserData {
  userId: string
  reason: ReportReason
  description?: string
}

// ==============================================
// FILTER & SEARCH TYPES
// ==============================================

/**
 * Discover filters
 */
export interface DiscoverFilters {
  name?: string
  minAge?: number
  maxAge?: number
  gender?: Gender
  city?: string
  postcode?: string
  maxDistance?: number
  page?: number
  limit?: number

  // Lifestyle filters
  smoking?: string[]
  drinking?: string[]
  children?: string[]

  // Physical
  minHeight?: number
  maxHeight?: number

  // Background (Premium)
  education?: string[]
  religion?: string[]
  languages?: string[]
  ethnicity?: string[]

  // Interests
  interests?: string[]
  sports?: string[]

  // Relationship
  relationshipGoal?: string[]

  // Other
  verifiedOnly?: boolean
  onlineRecently?: boolean
}

/**
 * Blog filters
 */
export interface BlogFilters {
  category?: string
  page?: number
  limit?: number
}

// ==============================================
// VALIDATION TYPES
// ==============================================

/**
 * Validation error
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
