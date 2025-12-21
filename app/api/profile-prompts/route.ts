/**
 * Profile Prompts API - Hinge-style Q&A for profiles
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AVAILABLE_PROMPTS, MAX_PROMPTS } from '@/lib/prompts'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Get user's prompts
    const prompts = await prisma.profilePrompt.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      prompts,
      availablePrompts: AVAILABLE_PROMPTS,
      maxPrompts: MAX_PROMPTS,
    })
  } catch (error) {
    console.error('Error fetching profile prompts:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const body = await request.json()
    const { question, answer } = body

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Vraag en antwoord zijn verplicht' },
        { status: 400 }
      )
    }

    if (!AVAILABLE_PROMPTS.includes(question)) {
      return NextResponse.json(
        { error: 'Ongeldige prompt' },
        { status: 400 }
      )
    }

    if (answer.length > 500) {
      return NextResponse.json(
        { error: 'Antwoord mag maximaal 500 karakters zijn' },
        { status: 400 }
      )
    }

    // Check current count
    const currentCount = await prisma.profilePrompt.count({
      where: { userId: user.id },
    })

    if (currentCount >= MAX_PROMPTS) {
      return NextResponse.json(
        { error: `Je kunt maximaal ${MAX_PROMPTS} prompts hebben` },
        { status: 400 }
      )
    }

    // Check if this prompt already exists for this user
    const existing = await prisma.profilePrompt.findFirst({
      where: { userId: user.id, question },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Je hebt deze prompt al beantwoord' },
        { status: 400 }
      )
    }

    // Create the prompt
    const prompt = await prisma.profilePrompt.create({
      data: {
        userId: user.id,
        question,
        answer,
        order: currentCount,
      },
    })

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error creating profile prompt:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
