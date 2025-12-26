/**
 * Data Export Utilities
 *
 * CSV and JSON export functionality for admin data
 */

import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'

export type ExportType = 'users' | 'matches' | 'reports' | 'subscriptions' | 'audit_logs'
export type ExportFormat = 'csv' | 'json'

interface ExportOptions {
  type: ExportType
  format: ExportFormat
  filters?: Record<string, any>
  fields?: string[]
}

/**
 * Export users data
 */
async function exportUsers(filters?: Record<string, any>, fields?: string[]) {
  const where: any = {}

  if (filters?.role) where.role = filters.role
  if (filters?.isVerified !== undefined) where.isVerified = filters.isVerified === 'true'
  if (filters?.isBanned === 'true') where.role = 'BANNED'

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      safetyScore: true,
      createdAt: true,
      lastSeen: true,
      _count: {
        select: {
          matches1: true,
          matches2: true,
          outgoingSwipes: true
        }
      }
    },
    take: 10000 // Limit to prevent memory issues
  })

  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name || '',
    role: user.role,
    verified: user.isVerified ? 'Yes' : 'No',
    banned: user.role === 'BANNED' ? 'Yes' : 'No',
    safetyScore: user.safetyScore,
    totalMatches: (user._count.matches1 || 0) + (user._count.matches2 || 0),
    totalSwipes: user._count.outgoingSwipes || 0,
    createdAt: user.createdAt.toISOString(),
    lastSeen: user.lastSeen?.toISOString() || ''
  }))
}

/**
 * Export matches data
 */
async function exportMatches(filters?: Record<string, any>) {
  const where: any = {}

  if (filters?.dateFrom) {
    where.createdAt = { ...where.createdAt, gte: new Date(filters.dateFrom) }
  }
  if (filters?.dateTo) {
    where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) }
  }

  const matches = await prisma.match.findMany({
    where,
    include: {
      user1: { select: { email: true, name: true } },
      user2: { select: { email: true, name: true } },
      _count: { select: { messages: true } }
    },
    take: 10000
  })

  return matches.map(match => ({
    id: match.id,
    user1Email: match.user1.email,
    user1Name: match.user1.name || '',
    user2Email: match.user2.email,
    user2Name: match.user2.name || '',
    messageCount: match._count.messages,
    createdAt: match.createdAt.toISOString()
  }))
}

/**
 * Export reports data
 */
async function exportReports(filters?: Record<string, any>) {
  const where: any = {}

  if (filters?.status) where.status = filters.status

  const reports = await prisma.report.findMany({
    where,
    include: {
      reporter: { select: { email: true, name: true } },
      reported: { select: { email: true, name: true } }
    },
    take: 10000
  })

  return reports.map(report => ({
    id: report.id,
    reporterEmail: report.reporter.email,
    reporterName: report.reporter.name || '',
    reportedEmail: report.reported.email,
    reportedName: report.reported.name || '',
    reason: report.reason || '',
    description: report.description || '',
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    resolvedAt: report.resolvedAt?.toISOString() || ''
  }))
}

/**
 * Export subscriptions data
 */
async function exportSubscriptions(filters?: Record<string, any>) {
  const where: any = {}

  if (filters?.plan) where.plan = filters.plan
  if (filters?.status) where.status = filters.status

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      user: { select: { email: true, name: true } }
    },
    take: 10000
  })

  return subscriptions.map(sub => ({
    id: sub.id,
    userEmail: sub.user.email,
    userName: sub.user.name || '',
    plan: sub.plan,
    status: sub.status,
    startDate: sub.startDate.toISOString(),
    endDate: sub.endDate?.toISOString() || '',
    cancelledAt: sub.cancelledAt?.toISOString() || '',
    recurring: sub.recurringId ? 'Yes' : 'No',
    createdAt: sub.createdAt.toISOString()
  }))
}

/**
 * Export audit logs data
 */
async function exportAuditLogs(filters?: Record<string, any>) {
  const where: any = {}

  if (filters?.action) where.action = filters.action
  if (filters?.userId) where.userId = filters.userId
  if (filters?.dateFrom) {
    where.createdAt = { ...where.createdAt, gte: new Date(filters.dateFrom) }
  }
  if (filters?.dateTo) {
    where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    take: 10000,
    orderBy: { createdAt: 'desc' }
  })

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    userId: log.userId || '',
    targetUserId: log.targetUserId || '',
    details: log.details || '',
    ipAddress: log.ipAddress || '',
    userAgent: log.userAgent || '',
    success: log.success ? 'Yes' : 'No',
    createdAt: log.createdAt.toISOString()
  }))
}

/**
 * Main export function
 */
export async function exportData(options: ExportOptions): Promise<string> {
  let data: any[]

  switch (options.type) {
    case 'users':
      data = await exportUsers(options.filters, options.fields)
      break
    case 'matches':
      data = await exportMatches(options.filters)
      break
    case 'reports':
      data = await exportReports(options.filters)
      break
    case 'subscriptions':
      data = await exportSubscriptions(options.filters)
      break
    case 'audit_logs':
      data = await exportAuditLogs(options.filters)
      break
    default:
      throw new Error(`Unknown export type: ${options.type}`)
  }

  if (options.format === 'csv') {
    return Papa.unparse(data)
  } else {
    return JSON.stringify(data, null, 2)
  }
}

/**
 * Get filename for export
 */
export function getExportFilename(type: ExportType, format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `${type}_export_${timestamp}.${format}`
}
