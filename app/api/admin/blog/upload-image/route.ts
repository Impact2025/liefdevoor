import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { optimizeImage, validateImage } from '@/lib/blog/image-optimizer'

export const runtime = 'nodejs' // Required for sharp
export const dynamic = 'force-dynamic'

/**
 * Upload and optimize blog post images
 * POST /api/admin/blog/upload-image
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string || 'Blog afbeelding'
    const category = formData.get('category') as string || undefined

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand geüpload' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate image
    const validation = validateImage(buffer, 10) // Max 10MB
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    console.log(`[Upload] Processing image: ${file.name}, size: ${buffer.length} bytes`)

    // Optimize image
    const optimized = await optimizeImage(buffer, file.name, {
      title,
      category,
      maxWidth: 1920,
      quality: 85,
      generateWebP: true,
      generateResponsiveSizes: true
    })

    // Calculate compression ratio
    const compressionRatio = ((1 - optimized.size / buffer.length) * 100).toFixed(1)

    console.log(`[Upload] Image optimized: ${compressionRatio}% size reduction`)

    // Return optimized image info
    // NOTE: In production, you would upload the optimized buffers to your CDN here
    // For now, we're returning the metadata and placeholder URLs
    return NextResponse.json({
      success: true,
      image: optimized,
      stats: {
        originalSize: buffer.length,
        optimizedSize: optimized.size,
        compressionRatio: `${compressionRatio}%`,
        savings: buffer.length - optimized.size
      }
    })

  } catch (error) {
    console.error('[Upload] Image optimization error:', error)
    return NextResponse.json({
      error: 'Afbeelding optimalisatie mislukt',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Optional: GET endpoint to retrieve image optimization status
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    status: 'ready',
    features: {
      compression: true,
      webp: true,
      responsiveSizes: true,
      aiAltText: !!process.env.OPENROUTER_API_KEY
    },
    limits: {
      maxSize: '10MB',
      maxWidth: 1920,
      quality: 85
    }
  })
}
