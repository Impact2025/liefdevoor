/**
 * UI Components Export
 *
 * Central export for all reusable UI components.
 * Import from here for clean imports across the app.
 *
 * Usage:
 *   import { Button, Card, LoadingSpinner, Input, Modal } from '@/components/ui'
 */

// Buttons
export { Button } from './Button'
export type { ButtonProps } from './Button'

// Cards
export { Card, CardHeader, CardBody, CardFooter } from './Card'
export type { CardProps } from './Card'

// Loading
export { LoadingSpinner, PageLoading, InlineLoading } from './LoadingSpinner'
export type { LoadingSpinnerProps } from './LoadingSpinner'

// Forms
export { Input } from './Input'
export type { InputProps } from './Input'

export { Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

export { Textarea } from './Textarea'
export type { TextareaProps } from './Textarea'

export { Checkbox } from './Checkbox'
export type { CheckboxProps } from './Checkbox'

// Modals
export { Modal } from './Modal'
export type { ModalProps } from './Modal'

// Avatars & Badges
export { Avatar, AvatarGroup } from './Avatar'
export type { AvatarProps, AvatarGroupProps } from './Avatar'

export { Badge, NotificationBadge } from './Badge'
export type { BadgeProps, NotificationBadgeProps } from './Badge'

// Feedback
export { Alert } from './Alert'
export type { AlertProps } from './Alert'

export { Skeleton, SkeletonCard, SkeletonProfile, SkeletonList } from './Skeleton'
export type { SkeletonProps } from './Skeleton'

export { OnlineIndicator } from './OnlineIndicator'
export type { OnlineIndicatorProps } from './OnlineIndicator'

export { VerifiedBadge } from './VerifiedBadge'
export type { VerifiedBadgeProps } from './VerifiedBadge'

export { CompatibilityBadge } from './CompatibilityBadge'
export type { CompatibilityBadgeProps } from './CompatibilityBadge'

// Audio
export { AudioRecorder } from './AudioRecorder'
export type { AudioRecorderProps } from './AudioRecorder'
