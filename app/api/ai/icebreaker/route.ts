import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { matchId } = await request.json()

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID required' }, { status: 400 })
    }

    // Get the match and other user
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            bio: true,
            interests: true,
            city: true,
            birthDate: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            bio: true,
            interests: true,
            city: true,
            birthDate: true
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Determine which user is the other person
    const otherUser = match.user1.id === session.user.id ? match.user2 : match.user1
    const currentUser = match.user1.id === session.user.id ? match.user1 : match.user2

    // Generate icebreaker using OpenRouter
    const prompt = `Generate a fun, personalized icebreaker message for a dating app conversation. 

Current user: ${currentUser.name}, ${currentUser.bio || 'No bio'}, from ${currentUser.city || 'Unknown city'}, interests: ${currentUser.interests || 'Not specified'}

Other user: ${otherUser.name}, ${otherUser.bio || 'No bio'}, from ${otherUser.city || 'Unknown city'}, interests: ${otherUser.interests || 'Not specified'}

Create a natural, engaging opening message that references something from their profiles. Keep it under 100 characters. Make it flirty but respectful.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Liefde Voor Iedereen Dating App'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
    }

    const data = await response.json()
    const icebreaker = data.choices?.[0]?.message?.content?.trim()

    if (!icebreaker) {
      return NextResponse.json({ error: 'Failed to generate icebreaker' }, { status: 500 })
    }

    return NextResponse.json({ icebreaker })

  } catch (error) {
    console.error('Icebreaker generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}