/**
 * Dynamic Open Graph Image Generator
 *
 * Generates beautiful OG images for social sharing.
 * Uses Vercel's @vercel/og package for edge rendering.
 *
 * Usage:
 * - /api/og - Default site image
 * - /api/og?title=Custom%20Title - Custom title
 * - /api/og?type=profile&name=John&age=28 - Profile card
 */

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Image dimensions for OG images
const OG_WIDTH = 1200
const OG_HEIGHT = 630

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get parameters
    const type = searchParams.get('type') || 'default'
    const title = searchParams.get('title') || 'Liefde Voor Iedereen'
    const description = searchParams.get('description') || 'Vind je perfecte match'

    // Profile-specific params
    const name = searchParams.get('name')
    const age = searchParams.get('age')
    const photo = searchParams.get('photo')

    if (type === 'profile' && name) {
      return generateProfileImage({ name, age, photo })
    }

    return generateDefaultImage({ title, description })
  } catch (error) {
    console.error('[OG] Error generating image:', error)
    return new Response('Error generating image', { status: 500 })
  }
}

async function generateDefaultImage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #C34C60 0%, #E8788C 50%, #F5A9B8 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Heart decoration */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 60,
            fontSize: 120,
            opacity: 0.2,
          }}
        >
          ❤️
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 40,
            fontSize: 80,
            opacity: 0.15,
          }}
        >
          💕
        </div>

        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            ❤️
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            textShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '80%',
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.9)',
            marginTop: 20,
            textAlign: 'center',
            maxWidth: '70%',
          }}
        >
          {description}
        </div>

        {/* Features badges */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['AI Matching', 'Video Verificatie', '100% Nederlands'].map((feature) => (
            <div
              key={feature}
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '12px 24px',
                borderRadius: 50,
                color: 'white',
                fontSize: 18,
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            fontSize: 20,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          liefdevooriederen.nl
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    }
  )
}

async function generateProfileImage({
  name,
  age,
  photo,
}: {
  name: string
  age?: string | null
  photo?: string | null
}) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Profile photo area */}
        <div
          style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={name}
              style={{
                width: 400,
                height: 400,
                borderRadius: 20,
                objectFit: 'cover',
                border: '4px solid rgba(255,255,255,0.2)',
              }}
            />
          ) : (
            <div
              style={{
                width: 300,
                height: 300,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #C34C60, #E8788C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 120,
                color: 'white',
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info area */}
        <div
          style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
            }}
          >
            {name}
            {age && (
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 400,
                  marginLeft: 16,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {age}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 20,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#4ade80',
              }}
            />
            <span
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              Actief op Liefde Voor Iedereen
            </span>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: 40,
              background: 'linear-gradient(135deg, #C34C60, #E8788C)',
              padding: '16px 32px',
              borderRadius: 50,
              fontSize: 24,
              fontWeight: 600,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'fit-content',
            }}
          >
            Bekijk profiel →
          </div>
        </div>

        {/* Brand */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 32 }}>❤️</span>
          <span
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            liefdevooriederen.nl
          </span>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    }
  )
}
