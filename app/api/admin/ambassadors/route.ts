import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-helpers'
import { hasPermission, AdminPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { z } from 'zod'
import React from 'react'
import { render } from '@react-email/render'
import AmbassadorInviteEmail from '@/lib/email/templates/ambassador/invite'

const inviteSchema = z.object({
  userId: z.string().min(1, 'userId is verplicht'),
  sendInviteEmail: z.boolean().default(true),
  adminNotes: z.string().max(2000).optional(),
})

// GET /api/admin/ambassadors - Lijst van alle ambassadeurs
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!await hasPermission(admin.id, AdminPermission.MANAGE_AMBASSADORS)) {
      return NextResponse.json({ success: false, error: 'Geen toegang tot ambassadeursprogramma' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.slice(0, 100)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const where: any = {}
    if (status && ['INVITED', 'ACTIVE', 'INACTIVE'].includes(status)) where.status = status
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const offset = (page - 1) * limit
    const [ambassadors, total, stats] = await Promise.all([
      prisma.ambassador.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              city: true,
              createdAt: true,
              subscriptionTier: true,
            },
          },
        },
        orderBy: { invitedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.ambassador.count({ where }),
      prisma.ambassador.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: ambassadors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        invited: stats.find(s => s.status === 'INVITED')?._count.status ?? 0,
        active: stats.find(s => s.status === 'ACTIVE')?._count.status ?? 0,
        inactive: stats.find(s => s.status === 'INACTIVE')?._count.status ?? 0,
        total,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/ambassadors error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/ambassadors - Nodig een gebruiker uit als ambassadeur
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!await hasPermission(admin.id, AdminPermission.MANAGE_AMBASSADORS)) {
      return NextResponse.json({ success: false, error: 'Geen toegang tot ambassadeursprogramma' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json({ success: false, error: first.message }, { status: 400 })
    }
    const { userId, sendInviteEmail: doSendEmail, adminNotes } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, ambassador: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Gebruiker niet gevonden' }, { status: 404 })
    }
    if (!user.email) {
      return NextResponse.json({ success: false, error: 'Gebruiker heeft geen e-mailadres' }, { status: 400 })
    }
    if (user.ambassador) {
      return NextResponse.json({ success: false, error: 'Gebruiker is al ambassadeur' }, { status: 409 })
    }

    const ticket = await prisma.helpDeskTicket.create({
      data: {
        userId,
        subject: 'Ambassadeursprogramma - Liefde Voor Iedereen',
        description: 'Dit is jouw persoonlijke berichtenplek voor het ambassadeursprogramma. Hier kun je vragen stellen en ideeën delen.',
        category: 'AMBASSADOR',
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    })

    const ambassador = await prisma.ambassador.create({
      data: {
        userId,
        status: 'INVITED',
        ticketId: ticket.id,
        adminNotes: adminNotes || null,
        freeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (doSendEmail) {
      const acceptUrl = `${process.env.NEXTAUTH_URL}/ambassadeur`
      const html = await render(
        React.createElement(AmbassadorInviteEmail, {
          userName: user.name || 'daar',
          acceptUrl,
        })
      )
      const text = `Hoi ${user.name || 'daar'}! Wil jij ambassadeur worden van Liefde Voor Iedereen? Ga naar: ${acceptUrl}`

      await sendEmail({
        to: user.email,
        subject: 'Wil jij ambassadeur worden? 🌟',
        html,
        text,
        category: 'AMBASSADOR_INVITE',
      })
    }

    return NextResponse.json({ success: true, data: ambassador }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/ambassadors error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
