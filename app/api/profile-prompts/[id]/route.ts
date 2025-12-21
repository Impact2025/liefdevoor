/**
 * Profile Prompt API - Individual prompt operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  id: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
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

    const { id } = params
    const body = await request.json()
    const { answer } = body

    if (!answer) {
      return NextResponse.json(
        { error: 'Antwoord is verplicht' },
        { status: 400 }
      )
    }

    if (answer.length > 500) {
      return NextResponse.json(
        { error: 'Antwoord mag maximaal 500 karakters zijn' },
        { status: 400 }
      )
    }

    // Find and verify ownership
    const existing = await prisma.profilePrompt.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt niet gevonden' },
        { status: 404 }
      )
    }

    // Update the prompt
    const prompt = await prisma.profilePrompt.update({
      where: { id },
      data: { answer },
    })

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error updating profile prompt:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
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

    const { id } = params

    // Find and verify ownership
    const existing = await prisma.profilePrompt.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt niet gevonden' },
        { status: 404 }
      )
    }

    // Delete the prompt
    await prisma.profilePrompt.delete({ where: { id } })

    // Reorder remaining prompts
    const remaining = await prisma.profilePrompt.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' },
    })

    for (let i = 0; i < remaining.length; i++) {
      await prisma.profilePrompt.update({
        where: { id: remaining[i].id },
        data: { order: i },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting profile prompt:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
