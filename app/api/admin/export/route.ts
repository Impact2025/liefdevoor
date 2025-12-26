/**
 * Data Export API
 *
 * POST - Export admin data in CSV or JSON format
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dataExportSchema, validateBody } from '@/lib/validations/admin-schemas'
import { checkAdminRateLimit, rateLimitErrorResponse } from '@/lib/rate-limit-admin'
import { auditLogImmediate, getClientInfo } from '@/lib/audit'
import { exportData, getExportFilename } from '@/lib/admin/export-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body
    const validation = await validateBody(request, dataExportSchema)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        field: validation.field,
        message: validation.message
      }, { status: 400 })
    }

    const { type, filters, format, fields } = validation.data

    // Rate limiting - strict for exports (5 per hour)
    const rateLimit = await checkAdminRateLimit(session.user.id, 'export', 5, 3600)
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Perform export
    const exportedData = await exportData({
      type,
      format,
      filters,
      fields
    })

    const filename = getExportFilename(type, format)

    // Audit log
    const clientInfo = getClientInfo(request)
    await auditLogImmediate('ADMIN_ACTION', {
      userId: session.user.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        action: 'DATA_EXPORT',
        exportType: type,
        format,
        filters: filters || {},
        recordCount: exportedData.split('\n').length - 1, // Approximate record count
        filename
      },
      success: true
    })

    // Return as downloadable file
    const headers = new Headers()
    headers.set('Content-Type', format === 'csv' ? 'text/csv' : 'application/json')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    return new NextResponse(exportedData, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error in data export:', error)

    // Log failed action
    const clientInfo = getClientInfo(request)
    await auditLogImmediate('ADMIN_ACTION', {
      userId: (await getServerSession(authOptions))?.user?.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        endpoint: '/api/admin/export',
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      success: false
    })

    return NextResponse.json({
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
