/**
 * Image Optimizer - Wereldklasse
 *
 * Optimizes images for blog posts:
 * - Compression & resizing with sharp
 * - WebP conversion for modern browsers
 * - Multiple responsive sizes
 * - AI-generated SEO alt text
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

export interface ImageOptimizationOptions {
  title: string  // Blog post title for context
  category?: string  // Blog category for context
  maxWidth?: number  // Default: 1920px
  quality?: number  // Default: 85
  generateWebP?: boolean  // Default: true
  generateResponsiveSizes?: boolean  // Default: true
}

export interface OptimizedImage {
  originalUrl: string
  optimizedUrl: string  // Main optimized image
  webpUrl?: string  // WebP version
  thumbnailUrl?: string  // 400px width
  mediumUrl?: string  // 800px width
  largeUrl?: string  // 1200px width
  alt: string  // AI-generated alt text
  width: number
  height: number
  format: string
  size: number  // File size in bytes
}

/**
 * Optimize image for blog post
 * This function handles the complete optimization pipeline
 */
export async function optimizeImage(
  imageBuffer: Buffer,
  filename: string,
  options: ImageOptimizationOptions
): Promise<OptimizedImage> {
  const {
    title,
    category,
    maxWidth = 1920,
    quality = 85,
    generateWebP = true,
    generateResponsiveSizes = true
  } = options

  console.log('[Image Optimizer] Starting optimization for:', filename)

  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata()
  const originalWidth = metadata.width || 1920
  const originalHeight = metadata.height || 1080

  // Calculate optimal dimensions (maintain aspect ratio)
  let targetWidth = Math.min(originalWidth, maxWidth)
  let targetHeight = Math.round((originalHeight / originalWidth) * targetWidth)

  // Generate base filename without extension
  const baseName = path.basename(filename, path.extname(filename))
  const timestamp = Date.now()

  // Optimize main image
  const optimizedBuffer = await sharp(imageBuffer)
    .resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality, mozjpeg: true })  // Use mozjpeg for better compression
    .toBuffer()

  console.log(`[Image Optimizer] Optimized from ${imageBuffer.length} to ${optimizedBuffer.length} bytes`)

  // Generate WebP version (better compression, modern browsers)
  let webpBuffer: Buffer | null = null
  if (generateWebP) {
    webpBuffer = await sharp(imageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: quality + 5 })  // WebP can handle higher quality with smaller file
      .toBuffer()

    console.log(`[Image Optimizer] WebP version: ${webpBuffer.length} bytes`)
  }

  // Generate responsive sizes
  const responsiveSizes: { [key: string]: Buffer } = {}
  if (generateResponsiveSizes) {
    // Thumbnail: 400px
    if (originalWidth > 400) {
      responsiveSizes.thumbnail = await sharp(imageBuffer)
        .resize(400, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer()
    }

    // Medium: 800px
    if (originalWidth > 800) {
      responsiveSizes.medium = await sharp(imageBuffer)
        .resize(800, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer()
    }

    // Large: 1200px
    if (originalWidth > 1200) {
      responsiveSizes.large = await sharp(imageBuffer)
        .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer()
    }

    console.log('[Image Optimizer] Generated responsive sizes:', Object.keys(responsiveSizes))
  }

  // Generate AI alt text
  const altText = await generateAltText({
    title,
    category,
    filename
  })

  // In a real implementation, you would:
  // 1. Upload optimized images to your CDN/storage (S3, Cloudinary, UploadThing, etc.)
  // 2. Return the CDN URLs
  //
  // For now, we'll return placeholder URLs with the filename
  // You should integrate with your existing upload system

  const result: OptimizedImage = {
    originalUrl: `/uploads/${filename}`,
    optimizedUrl: `/uploads/optimized/${baseName}-${timestamp}.jpg`,
    webpUrl: webpBuffer ? `/uploads/optimized/${baseName}-${timestamp}.webp` : undefined,
    thumbnailUrl: responsiveSizes.thumbnail ? `/uploads/optimized/${baseName}-${timestamp}-thumb.jpg` : undefined,
    mediumUrl: responsiveSizes.medium ? `/uploads/optimized/${baseName}-${timestamp}-medium.jpg` : undefined,
    largeUrl: responsiveSizes.large ? `/uploads/optimized/${baseName}-${timestamp}-large.jpg` : undefined,
    alt: altText,
    width: targetWidth,
    height: targetHeight,
    format: 'jpeg',
    size: optimizedBuffer.length
  }

  console.log('[Image Optimizer] Optimization complete:', result)

  return result
}

/**
 * Generate SEO-optimized alt text using AI
 */
export async function generateAltText(context: {
  title: string
  category?: string
  filename?: string
}): Promise<string> {
  const { title, category, filename } = context

  // If no OpenRouter API key, return basic alt text
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('[Image Optimizer] No OPENROUTER_API_KEY, using fallback alt text')
    return `Afbeelding voor: ${title}`
  }

  try {
    const prompt = `Je bent een SEO expert voor Nederlandse dating content. Genereer een korte, beschrijvende alt text (max 125 karakters) voor een afbeelding in een blog post.

Context:
- Blog titel: "${title}"
${category ? `- Categorie: "${category}"` : ''}
${filename ? `- Bestandsnaam: "${filename}"` : ''}

Vereisten:
- Beschrijf WAT er te zien is (niet "afbeelding van...")
- Relevant voor dating/relatie context
- Bevat primary keyword waar mogelijk
- Natuurlijk Nederlands
- Max 125 karakters
- GEEN emoji's

Geef alleen de alt text terug, geen extra tekst.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Wereldklasse Dating App - Alt Text Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const altText = data.choices?.[0]?.message?.content?.trim()

    if (!altText) {
      throw new Error('No alt text received from AI')
    }

    // Ensure max length
    const cleanedAltText = altText.substring(0, 125)

    console.log('[Image Optimizer] Generated alt text:', cleanedAltText)

    return cleanedAltText

  } catch (error) {
    console.error('[Image Optimizer] Alt text generation failed:', error)
    // Fallback to basic alt text
    return `Afbeelding voor: ${title}`.substring(0, 125)
  }
}

/**
 * Validate image before processing
 */
export function validateImage(buffer: Buffer, maxSizeInMB = 10): { valid: boolean; error?: string } {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  if (buffer.length > maxSizeInBytes) {
    return {
      valid: false,
      error: `Afbeelding te groot. Maximaal ${maxSizeInMB}MB toegestaan.`
    }
  }

  return { valid: true }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata()
  return {
    width: metadata.width || 0,
    height: metadata.height || 0
  }
}
