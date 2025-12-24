/**
 * OptimizedImage - Performance-optimized image component
 *
 * Features:
 * - Automatic srcset with responsive sizes
 * - Blur placeholder for better UX
 * - Lazy loading by default
 * - Error fallback
 * - Aspect ratio preservation
 */

'use client'

import { useState, memo } from 'react'
import Image, { ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4' | '9:16'
  showSkeleton?: boolean
}

// Blur data URL for placeholder (tiny transparent image with blur)
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+'

// Default fallback image
const DEFAULT_FALLBACK = '/images/placeholder-avatar.png'

// Responsive sizes for common use cases
const RESPONSIVE_SIZES = {
  avatar: '(max-width: 768px) 48px, (max-width: 1024px) 64px, 96px',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  hero: '100vw',
  thumbnail: '(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 200px',
  profile: '(max-width: 768px) 100vw, 500px',
}

// Aspect ratio to padding-bottom percentage
const ASPECT_RATIO_MAP = {
  '1:1': '100%',
  '4:3': '75%',
  '16:9': '56.25%',
  '3:4': '133.33%',
  '9:16': '177.78%',
}

function OptimizedImageInner({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  aspectRatio,
  showSkeleton = true,
  sizes,
  priority = false,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const imageSrc = hasError ? fallbackSrc : src

  // Auto-detect sizes based on className patterns
  const autoSizes = (() => {
    if (sizes) return sizes
    if (className.includes('avatar')) return RESPONSIVE_SIZES.avatar
    if (className.includes('hero')) return RESPONSIVE_SIZES.hero
    if (className.includes('card')) return RESPONSIVE_SIZES.card
    if (className.includes('thumb')) return RESPONSIVE_SIZES.thumbnail
    return RESPONSIVE_SIZES.profile
  })()

  return (
    <div
      className={`relative overflow-hidden ${aspectRatio ? '' : ''}`}
      style={aspectRatio ? { paddingBottom: ASPECT_RATIO_MAP[aspectRatio] } : undefined}
    >
      {/* Skeleton loader */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        sizes={autoSizes}
        priority={priority}
        placeholder={!priority ? 'blur' : undefined}
        blurDataURL={!priority ? BLUR_DATA_URL : undefined}
        quality={85}
        loading={priority ? undefined : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export const OptimizedImage = memo(OptimizedImageInner)

// Named exports for common use cases
export const AvatarImage = memo(function AvatarImage(
  props: Omit<OptimizedImageProps, 'aspectRatio'>
) {
  return (
    <OptimizedImage
      {...props}
      aspectRatio="1:1"
      sizes={RESPONSIVE_SIZES.avatar}
      className={`rounded-full object-cover ${props.className || ''}`}
    />
  )
})

export const CardImage = memo(function CardImage(
  props: Omit<OptimizedImageProps, 'aspectRatio'>
) {
  return (
    <OptimizedImage
      {...props}
      aspectRatio="4:3"
      sizes={RESPONSIVE_SIZES.card}
      className={`object-cover ${props.className || ''}`}
    />
  )
})

export const HeroImage = memo(function HeroImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority
      sizes={RESPONSIVE_SIZES.hero}
      className={`object-cover ${props.className || ''}`}
    />
  )
})

export default OptimizedImage
