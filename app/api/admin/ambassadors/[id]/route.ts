import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-helpers'
import { hasPermission, AdminPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['INVITED', 'ACTIVE', 'INACTIVE'] as const
type AmbassadorStatus = typeof VALID_STATUSES[number]

// GET /api/admin/ambassadors/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()
    if (!await hasPermission(admin.id, AdminPermission.MANAGE_AMBASSADORS)) {
      return NextResponse.json({ success: false, error: 'Geen toegang' }, { status: 403 })
    }

    const ambassador = await prisma.ambassador.findUnique({
      where: { id: params.id },
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
    })

    if (!ambassador) {
      return NextResponse.json({ success: false, error: 'Niet gevonden' }, { status: 404 })
    }

    let messages: any[] = []
    if (ambassador.ticketId) {
      const ticket = await prisma.helpDeskTicket.findUnique({
        where: { id: ambassador.ticketId },
        include: {
          messages: {
            include: {
              author: { select: { id: true, name: true, profileImage: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      })
      messages = ticket?.messages ?? []
    }

    return NextResponse.json({ success: true, data: { ...ambassador, messages } })
  } catch (error) {
    console.error('GET /api/admin/ambassadors/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/admin/ambassadors/[id] - Status, notities of freeUntil bijwerken
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()
    if (!await hasPermission(admin.id, AdminPermission.MANAGE_AMBASSADORS)) {
      return NextResponse.json({ success: false, error: 'Geen toegang' }, { status: 403 })
    }

    const body = await request.json()
    const { status, adminNotes, freeUntil } = body

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Ongeldige status' }, { status: 400 })
    }

    const existing = await prisma.ambassador.findUnique({
      where: { id: params.id },
      select: { userId: true, status: true, freeUntil: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Niet gevonden' }, { status: 404 })
    }

    const data: any = { updatedAt: new Date() }
    if (status !== undefined) {
      data.status = status
      if (status === 'ACTIVE' && existing.status !== 'ACTIVE') data.activatedAt = new Date()
      if (status === 'INACTIVE' && existing.status !== 'INACTIVE') data.deactivatedAt = new Date()
    }
    if (adminNotes !== undefined) data.adminNotes = String(adminNotes).slice(0, 2000)
    if (freeUntil !== undefined) data.freeUntil = new Date(freeUntil)

    const ambassador = await prisma.ambassador.update({
      where: { id: params.id },
      data,
      include: { user: { select: { id: true, name: true, email: true, subscriptionTier: true } } },
    })

    // Sync subscriptionTier bij statuswijziging
    if (status === 'ACTIVE' && existing.status !== 'ACTIVE') {
      await prisma.user.updateMany({
        where: { id: existing.userId, subscriptionTier: 'FREE' },
        data: { subscriptionTier: 'PREMIUM' },
      })
    } else if (status === 'INACTIVE' && existing.status !== 'INACTIVE') {
      await revertSubscriptionIfNeeded(existing.userId)
    }

    return NextResponse.json({ success: true, data: ambassador })
  } catch (error) {
    console.error('PATCH /api/admin/ambassadors/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/ambassadors/[id] - Soft delete: zet op INACTIVE
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()
    if (!await hasPermission(admin.id, AdminPermission.MANAGE_AMBASSADORS)) {
      return NextResponse.json({ success: false, error: 'Geen toegang' }, { status: 403 })
    }

    const existing = await prisma.ambassador.findUnique({
      where: { id: params.id },
      select: { userId: true, status: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Niet gevonden' }, { status: 404 })
    }

    await prisma.ambassador.update({
      where: { id: params.id },
      data: { status: 'INACTIVE', deactivatedAt: new Date() },
    })

    if (existing.status !== 'INACTIVE') {
      await revertSubscriptionIfNeeded(existing.userId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/ambassadors/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

async function revertSubscriptionIfNeeded(userId: string) {
  const activePaidSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
  })
  if (!activePaidSub) {
    await prisma.user.updateMany({
      where: { id: userId, subscriptionTier: 'PREMIUM' },
      data: { subscriptionTier: 'FREE' },
    })
  }
}
