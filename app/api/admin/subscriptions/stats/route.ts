/**
 * Subscription & Payment Stats API
 *
 * GET - Fetch subscription and payment statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // 1. Active subscriptions by tier
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      select: {
        plan: true,
        userId: true
      }
    })

    const subscriptionsByPlan = activeSubscriptions.reduce((acc, sub) => {
      acc[sub.plan] = (acc[sub.plan] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 2. Monthly revenue calculation
    // Note: This is a simplified calculation based on plan pricing
    // You should adjust based on your actual pricing
    const planPricing: Record<string, number> = {
      'basic': 0,      // Free
      'premium': 9.99, // €9.99/month
      'gold': 19.99    // €19.99/month
    }

    const monthlyRevenue = Object.entries(subscriptionsByPlan).reduce((total, [plan, count]) => {
      return total + (planPricing[plan] || 0) * count
    }, 0)

    // 3. New subscriptions this month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = await prisma.subscription.count({
      where: {
        createdAt: { gte: firstDayOfMonth }
      }
    })

    // 4. Churned subscriptions (cancelled in last 30 days)
    const churnedCount = await prisma.subscription.count({
      where: {
        status: 'cancelled',
        cancelledAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      }
    })

    // Calculate churn rate
    const previousActiveCount = await prisma.subscription.count({
      where: {
        createdAt: { lte: thirtyDaysAgo },
        OR: [
          { status: 'active' },
          {
            status: 'cancelled',
            cancelledAt: { gte: thirtyDaysAgo }
          }
        ]
      }
    })

    const churnRate = previousActiveCount > 0
      ? ((churnedCount / previousActiveCount) * 100).toFixed(2)
      : '0.00'

    // 5. Recent subscriptions (last 20)
    const recentSubscriptions = await prisma.subscription.findMany({
      where: {},
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // 6. Subscription trends (daily for last 30 days)
    const trends = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))

      const newSubs = await prisma.subscription.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })

      const cancelled = await prisma.subscription.count({
        where: {
          cancelledAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })

      trends.push({
        date: startOfDay.toISOString().split('T')[0],
        newSubscriptions: newSubs,
        cancelled: cancelled,
        net: newSubs - cancelled
      })
    }

    // 7. Payment stats (if SubscriptionPayment model exists)
    let paymentStats = null
    try {
      const recentPayments = await prisma.subscriptionPayment.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      const failedPayments = await prisma.subscriptionPayment.count({
        where: {
          status: 'failed',
          createdAt: { gte: thirtyDaysAgo }
        }
      })

      const totalRevenue = await prisma.subscriptionPayment.aggregate({
        where: {
          status: 'paid',
          paidAt: { gte: thirtyDaysAgo }
        },
        _sum: {
          amount: true
        }
      })

      paymentStats = {
        recentPayments,
        failedPayments,
        totalRevenue: totalRevenue._sum.amount || 0
      }
    } catch (error) {
      // SubscriptionPayment table might not exist
      console.log('Payment stats unavailable')
    }

    return NextResponse.json({
      overview: {
        totalActive: activeSubscriptions.length,
        monthlyRevenue: monthlyRevenue.toFixed(2),
        newThisMonth,
        churnRate,
        churnedCount
      },
      subscriptionsByPlan,
      recentSubscriptions: recentSubscriptions.map(sub => ({
        id: sub.id,
        userName: sub.user.name || 'Unknown',
        userEmail: sub.user.email,
        plan: sub.plan,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        cancelledAt: sub.cancelledAt,
        createdAt: sub.createdAt
      })),
      trends,
      paymentStats
    })

  } catch (error) {
    console.error('Error fetching subscription stats:', error)
    return NextResponse.json({
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
