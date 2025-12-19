/**
 * Image Optimization Utilities
 * Client-side image compression and optimization before upload
 */

interface OptimizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
}

const DEFAULT_OPTIONS: OptimizeOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: 'webp',
}

/**
 * Compress and optimize an image file before upload
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      // Draw image with smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      const mimeType = opts.format === 'webp' ? 'image/webp' :
                       opts.format === 'png' ? 'image/png' : 'image/jpeg'

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        mimeType,
        opts.quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create a thumbnail from an image
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'webp',
  })
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Check if file is a valid image
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Validate image file
 */
export async function validateImage(
  file: File,
  options: {
    maxSize?: number // in bytes
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    minWidth = 200,
    minHeight = 200,
    maxWidth = 4000,
    maxHeight = 4000,
  } = options

  if (!isValidImage(file)) {
    return { valid: false, error: 'Ongeldig bestandstype. Gebruik JPEG, PNG of WebP.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `Bestand is te groot. Maximum is ${formatFileSize(maxSize)}.` }
  }

  try {
    const { width, height } = await getImageDimensions(file)

    if (width < minWidth || height < minHeight) {
      return { valid: false, error: `Afbeelding is te klein. Minimum is ${minWidth}x${minHeight}px.` }
    }

    if (width > maxWidth || height > maxHeight) {
      return { valid: false, error: `Afbeelding is te groot. Maximum is ${maxWidth}x${maxHeight}px.` }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Kon afbeelding niet laden.' }
  }
}

/**
 * Batch optimize multiple images
 */
export async function optimizeImages(
  files: File[],
  options: OptimizeOptions = {}
): Promise<Blob[]> {
  return Promise.all(files.map((file) => optimizeImage(file, options)))
}

/**
 * Generate blurhash placeholder (simplified version)
 * In production, use blurhash library
 */
export function generatePlaceholder(file: File, size: number = 4): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }

    img.onload = () => {
      canvas.width = size
      canvas.height = size
      ctx.drawImage(img, 0, 0, size, size)

      // Get averaged color as simple placeholder
      const imageData = ctx.getImageData(0, 0, size, size)
      const { data } = imageData

      let r = 0, g = 0, b = 0
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }

      const pixels = data.length / 4
      r = Math.round(r / pixels)
      g = Math.round(g / pixels)
      b = Math.round(b / pixels)

      resolve(`rgb(${r},${g},${b})`)
      URL.revokeObjectURL(img.src)
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
