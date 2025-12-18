import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { auditLog, getClientInfo } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reportedId, reason, description } = body

    if (!reportedId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate reason
    const validReasons = ['harassment', 'inappropriate_content', 'spam', 'fake_profile', 'other']
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }

    const reporter = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!reporter) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is trying to report themselves
    if (reporter.id === reportedId) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 })
    }

    // Check if reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedId },
      select: { id: true },
    })

    if (!reportedUser) {
      return NextResponse.json({ error: 'Reported user not found' }, { status: 404 })
    }

    // Check if user has already reported this person recently (prevent spam)
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: reporter.id,
        reportedId: reportedId,
        status: 'pending',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    })

    if (existingReport) {
      return NextResponse.json({ error: 'You have already reported this user recently' }, { status: 400 })
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        reporterId: reporter.id,
        reportedId: reportedId,
        reason: reason,
        description: description || null,
      },
      include: {
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Optionally, decrease safety score of reported user
    await prisma.user.update({
      where: { id: reportedId },
      data: {
        safetyScore: {
          decrement: 5, // Decrease by 5 points
        },
      },
    })

    // Audit log the report creation
    const clientInfo = getClientInfo(request)
    auditLog('REPORT_CREATED', {
      userId: reporter.id,
      targetUserId: reportedId,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: { reason, reportId: report.id },
      success: true
    })

    return NextResponse.json({
      message: 'Report submitted successfully',
      report: {
        id: report.id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
    })
  } catch (error) {
    console.error('Report creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only admins can view reports
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    const reports = await prisma.report.findMany({
      where: {
        status: status,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
            safetyScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit,
    })

    const total = await prisma.report.count({
      where: { status: status },
    })

    return NextResponse.json({
      reports: reports,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Reports fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { reportId, action } = body // action: 'resolve' or 'dismiss'

    if (!reportId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, status: true, reportedId: true },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (report.status !== 'pending') {
      return NextResponse.json({ error: 'Report has already been processed' }, { status: 400 })
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'resolve' ? 'resolved' : 'dismissed',
        resolvedAt: new Date(),
        resolvedBy: user.id,
      },
    })

    // If resolving, further decrease safety score
    if (action === 'resolve') {
      await prisma.user.update({
        where: { id: report.reportedId },
        data: {
          safetyScore: {
            decrement: 10, // Additional penalty for confirmed reports
          },
        },
      })
    }

    // Audit log the report resolution
    const clientInfo = getClientInfo(request)
    auditLog('REPORT_RESOLVED', {
      userId: user.id,
      targetUserId: report.reportedId,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: { reportId, action, status: updatedReport.status },
      success: true
    })

    return NextResponse.json({
      message: `Report ${action}d successfully`,
      report: updatedReport,
    })
  } catch (error) {
    console.error('Report update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}