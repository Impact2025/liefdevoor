/**
 * Audit Logging System
 * Logs important security-related events for monitoring and compliance
 */

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_RATE_LIMITED'
  | 'LOGOUT'
  | 'REGISTER'
  | 'OAUTH_SIGNUP'
  | 'OAUTH_LOGIN'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'PASSWORD_RESET_FAILED'
  | 'PASSWORD_RESET_EMAIL_SENT'
  | 'PASSWORD_RESET_EMAIL_FAILED'
  | 'PROFILE_UPDATE'
  | 'ADMIN_ACTION'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED'
  | 'USER_REPORTED'
  | 'USER_PROMOTED'
  | 'USER_DEMOTED'
  | 'REPORT_CREATED'
  | 'REPORT_RESOLVED'
  | 'ACCOUNT_DELETED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'PHOTO_VERIFICATION_SUBMITTED'
  | 'PHOTO_VERIFICATION_REVIEWED'

export interface AuditLogEntry {
  timestamp: string
  action: AuditAction
  userId?: string
  targetUserId?: string
  ip?: string
  userAgent?: string
  details?: Record<string, any>
  success: boolean
}

// In-memory buffer for batch writing (use external service in production)
const auditBuffer: AuditLogEntry[] = []
const BUFFER_SIZE = 100
const FLUSH_INTERVAL = 60000 // 1 minute

/**
 * Log an audit event
 */
export function auditLog(
  action: AuditAction,
  options: {
    userId?: string
    targetUserId?: string
    ip?: string
    userAgent?: string
    details?: Record<string, any> | string
    success?: boolean
    clientInfo?: { ip: string; userAgent: string }
  } = {}
): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId: options.userId,
    targetUserId: options.targetUserId,
    ip: options.ip ?? options.clientInfo?.ip,
    userAgent: options.userAgent ?? options.clientInfo?.userAgent,
    details: typeof options.details === 'string' ? { message: options.details } : options.details,
    success: options.success ?? true,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(entry))
  }

  // Add to buffer
  auditBuffer.push(entry)

  // Flush if buffer is full
  if (auditBuffer.length >= BUFFER_SIZE) {
    flushAuditBuffer()
  }
}

/**
 * Flush audit buffer to persistent storage
 * In production, this would send to an external logging service
 */
async function flushAuditBuffer(): Promise<void> {
  if (auditBuffer.length === 0) return

  const entries = auditBuffer.splice(0, auditBuffer.length)

  // In production, send to external logging service like:
  // - AWS CloudWatch
  // - Datadog
  // - Elasticsearch
  // - Custom logging API

  // For now, just log to console in a structured format
  if (process.env.NODE_ENV !== 'test') {
    console.log('[AUDIT BATCH]', JSON.stringify({
      count: entries.length,
      entries: entries.map(e => ({
        t: e.timestamp,
        a: e.action,
        u: e.userId,
        s: e.success
      }))
    }))
  }
}

// Periodic flush
if (typeof setInterval !== 'undefined') {
  setInterval(flushAuditBuffer, FLUSH_INTERVAL)
}

/**
 * Helper to extract client info from request
 */
export function getClientInfo(request: Request): { ip: string; userAgent: string } {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent') || 'unknown'

  let ip = 'unknown'
  if (forwarded) {
    ip = forwarded.split(',')[0].trim()
  } else if (realIP) {
    ip = realIP
  }

  return { ip, userAgent }
}

/**
 * Log admin actions with full context
 */
export function auditAdminAction(
  adminUserId: string,
  action: string,
  targetUserId: string,
  details: Record<string, any>,
  request?: Request
): void {
  const clientInfo = request ? getClientInfo(request) : { ip: undefined, userAgent: undefined }

  auditLog('ADMIN_ACTION', {
    userId: adminUserId,
    targetUserId,
    ip: clientInfo.ip,
    userAgent: clientInfo.userAgent,
    details: {
      action,
      ...details
    },
    success: true
  })
}

/**
 * Log security events (failed logins, rate limits, etc)
 */
export function auditSecurityEvent(
  action: AuditAction,
  email: string,
  request?: Request,
  details?: Record<string, any>
): void {
  const clientInfo = request ? getClientInfo(request) : { ip: undefined, userAgent: undefined }

  auditLog(action, {
    ip: clientInfo.ip,
    userAgent: clientInfo.userAgent,
    details: {
      email: email.substring(0, 3) + '***', // Partially mask email
      ...details
    },
    success: action === 'LOGIN_SUCCESS' || action === 'REGISTER'
  })
}
