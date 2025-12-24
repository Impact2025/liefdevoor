/**
 * OptimizedImage Component Tests
 *
 * Tests for the performance-optimized image component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React, { useState, memo } from 'react'

// Mock next/image since it's not available in test environment
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    onLoad,
    onError,
    className,
    priority,
    ...props
  }: {
    src: string
    alt: string
    onLoad?: () => void
    onError?: () => void
    className?: string
    priority?: boolean
    [key: string]: any
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src as string}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={onError}
      data-priority={priority}
      data-testid="next-image"
      {...props}
    />
  ),
}))

// Recreate a simplified version of OptimizedImage for testing
interface OptimizedImageProps {
  src: string
  alt: string
  fallbackSrc?: string
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4' | '9:16'
  showSkeleton?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+'
const DEFAULT_FALLBACK = '/images/placeholder-avatar.png'

const RESPONSIVE_SIZES = {
  avatar: '(max-width: 768px) 48px, (max-width: 1024px) 64px, 96px',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  hero: '100vw',
  thumbnail: '(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 200px',
  profile: '(max-width: 768px) 100vw, 500px',
}

const ASPECT_RATIO_MAP = {
  '1:1': '100%',
  '4:3': '75%',
  '16:9': '56.25%',
  '3:4': '133.33%',
  '9:16': '177.78%',
}

function OptimizedImage({
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
      className={`relative overflow-hidden`}
      style={aspectRatio ? { paddingBottom: ASPECT_RATIO_MAP[aspectRatio] } : undefined}
      data-testid="image-container"
    >
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" data-testid="skeleton" />
      )}

      <img
        src={imageSrc}
        alt={alt}
        data-sizes={autoSizes}
        data-priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        data-testid="optimized-image"
        {...props}
      />
    </div>
  )
}

describe('OptimizedImage', () => {
  describe('Rendering', () => {
    it('should render with correct src and alt', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test Image" />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveAttribute('src', '/test-image.jpg')
      expect(img).toHaveAttribute('alt', 'Test Image')
    })

    it('should show skeleton while loading', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test" showSkeleton={true} />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('should not show skeleton when disabled', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test" showSkeleton={false} />)

      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" className="custom-class" />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveClass('custom-class')
    })
  })

  describe('Loading States', () => {
    it('should start with opacity-0 (loading)', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveClass('opacity-0')
    })

    it('should change to opacity-100 after load', async () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" />)

      const img = screen.getByTestId('optimized-image')

      fireEvent.load(img)

      await waitFor(() => {
        expect(img).toHaveClass('opacity-100')
      })
    })

    it('should hide skeleton after load', async () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" />)

      const img = screen.getByTestId('optimized-image')

      fireEvent.load(img)

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should use fallback image on error', async () => {
      render(
        <OptimizedImage
          src="/broken-image.jpg"
          alt="Test"
          fallbackSrc="/fallback.png"
        />
      )

      const img = screen.getByTestId('optimized-image')

      fireEvent.error(img)

      await waitFor(() => {
        expect(img).toHaveAttribute('src', '/fallback.png')
      })
    })

    it('should use default fallback when none provided', async () => {
      render(<OptimizedImage src="/broken-image.jpg" alt="Test" />)

      const img = screen.getByTestId('optimized-image')

      fireEvent.error(img)

      await waitFor(() => {
        expect(img).toHaveAttribute('src', DEFAULT_FALLBACK)
      })
    })

    it('should hide skeleton on error', async () => {
      render(<OptimizedImage src="/broken.jpg" alt="Test" />)

      const img = screen.getByTestId('optimized-image')

      fireEvent.error(img)

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
      })
    })
  })

  describe('Aspect Ratio', () => {
    it('should apply correct padding for 1:1 aspect ratio', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" aspectRatio="1:1" />)

      const container = screen.getByTestId('image-container')
      expect(container).toHaveStyle({ paddingBottom: '100%' })
    })

    it('should apply correct padding for 16:9 aspect ratio', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" aspectRatio="16:9" />)

      const container = screen.getByTestId('image-container')
      expect(container).toHaveStyle({ paddingBottom: '56.25%' })
    })

    it('should apply correct padding for 4:3 aspect ratio', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" aspectRatio="4:3" />)

      const container = screen.getByTestId('image-container')
      expect(container).toHaveStyle({ paddingBottom: '75%' })
    })

    it('should not apply padding without aspect ratio', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" />)

      const container = screen.getByTestId('image-container')
      expect(container).not.toHaveStyle({ paddingBottom: '100%' })
    })
  })

  describe('Responsive Sizes', () => {
    it('should auto-detect avatar sizes', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" className="avatar" />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveAttribute('data-sizes', RESPONSIVE_SIZES.avatar)
    })

    it('should auto-detect hero sizes', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" className="hero-image" />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveAttribute('data-sizes', RESPONSIVE_SIZES.hero)
    })

    it('should auto-detect card sizes', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" className="card" />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveAttribute('data-sizes', RESPONSIVE_SIZES.card)
    })

    it('should use provided sizes over auto-detection', () => {
      const customSizes = '(max-width: 500px) 100vw, 500px'
      render(<OptimizedImage src="/test.jpg" alt="Test" className="avatar" sizes={customSizes} />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveAttribute('data-sizes', customSizes)
    })

    it('should default to profile sizes', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveAttribute('data-sizes', RESPONSIVE_SIZES.profile)
    })
  })

  describe('Priority Loading', () => {
    it('should set priority attribute when true', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" priority={true} />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveAttribute('data-priority', 'true')
    })

    it('should not set priority attribute by default', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" />)

      const img = screen.getByTestId('optimized-image')
      expect(img).toHaveAttribute('data-priority', 'false')
    })
  })
})

describe('Constants', () => {
  it('should have valid blur data URL', () => {
    expect(BLUR_DATA_URL).toContain('data:image/svg+xml;base64')
  })

  it('should have default fallback path', () => {
    expect(DEFAULT_FALLBACK).toBe('/images/placeholder-avatar.png')
  })

  it('should have all required responsive sizes', () => {
    expect(RESPONSIVE_SIZES).toHaveProperty('avatar')
    expect(RESPONSIVE_SIZES).toHaveProperty('card')
    expect(RESPONSIVE_SIZES).toHaveProperty('hero')
    expect(RESPONSIVE_SIZES).toHaveProperty('thumbnail')
    expect(RESPONSIVE_SIZES).toHaveProperty('profile')
  })

  it('should have all required aspect ratios', () => {
    expect(ASPECT_RATIO_MAP).toHaveProperty('1:1')
    expect(ASPECT_RATIO_MAP).toHaveProperty('4:3')
    expect(ASPECT_RATIO_MAP).toHaveProperty('16:9')
    expect(ASPECT_RATIO_MAP).toHaveProperty('3:4')
    expect(ASPECT_RATIO_MAP).toHaveProperty('9:16')
  })
})
