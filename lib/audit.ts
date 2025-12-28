/**
 * Audit Logging System
 * Logs important security-related events for monitoring and compliance
 */

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_RATE_LIMITED'
  | 'LOGIN_TURNSTILE_MISSING'
  | 'LOGIN_TURNSTILE_FAILED'
  | 'LOGOUT'
  | 'REGISTER'
  | 'REGISTER_TURNSTILE_FAILED'
  | 'OAUTH_SIGNUP'
  | 'OAUTH_LOGIN'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'PASSWORD_RESET_FAILED'
  | 'PASSWORD_RESET_EMAIL_SENT'
  | 'PASSWORD_RESET_EMAIL_FAILED'
  // Email Verification (World Class System)
  | 'EMAIL_VERIFIED'
  | 'EMAIL_VERIFICATION_FAILED'
  | 'EMAIL_VERIFICATION_RATE_LIMITED'
  | 'EMAIL_SCANNER_BLOCKED'
  // Profile & User Management
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
  | 'SECURITY_VIOLATION'
  | 'PHOTO_VERIFICATION_SUBMITTED'
  | 'PHOTO_VERIFICATION_REVIEWED'
  // Helpdesk & Support System
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_RESOLVED'
  | 'TICKET_CLOSED'
  | 'TICKET_REOPENED'
  | 'TICKET_MESSAGE_SENT'
  | 'FAQ_ARTICLE_VIEWED'
  | 'FAQ_ARTICLE_CREATED'
  | 'FAQ_ARTICLE_UPDATED'
  | 'FAQ_ARTICLE_DELETED'
  | 'FAQ_FEEDBACK_SUBMITTED'
  | 'CHATBOT_CONVERSATION_STARTED'
  | 'CHATBOT_ESCALATED'

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

// Buffer for batch writing with database persistence
const auditBuffer: AuditLogEntry[] = []
const BUFFER_SIZE = 50 // Smaller batch size for more frequent writes
const FLUSH_INTERVAL = 30000 // 30 seconds - more frequent in production

// Flag to track if we're currently flushing
let isFlushing = false

/**
 * Log an audit event - non-blocking, writes to database in production
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

  // Always log to console for immediate visibility
  const logLevel = entry.success ? 'info' : 'warn'
  const logPrefix = entry.success ? '[AUDIT]' : '[AUDIT:FAIL]'

  if (process.env.NODE_ENV === 'development') {
    console.log(logPrefix, JSON.stringify(entry, null, 2))
  } else {
    // Structured logging for production (JSON format for log aggregators)
    console.log(JSON.stringify({
      level: logLevel,
      type: 'audit',
      ...entry,
    }))
  }

  // Add to buffer for batch database write
  auditBuffer.push(entry)

  // Flush if buffer is full
  if (auditBuffer.length >= BUFFER_SIZE && !isFlushing) {
    flushAuditBuffer().catch(console.error)
  }
}

/**
 * Immediate audit log - writes directly to database for critical events
 * Use for: login failures, security violations, admin actions
 */
export async function auditLogImmediate(
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
): Promise<void> {
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

  // Log to console immediately
  console.log(JSON.stringify({
    level: entry.success ? 'info' : 'warn',
    type: 'audit_immediate',
    ...entry,
  }))

  // Write directly to database in production
  if (process.env.NODE_ENV === 'production') {
    try {
      await writeToDatabase([entry])
    } catch (error) {
      console.error('[AUDIT] Failed to write immediate log:', error)
      // Fallback: add to buffer
      auditBuffer.push(entry)
    }
  }
}

/**
 * Write audit entries to database
 */
async function writeToDatabase(entries: AuditLogEntry[]): Promise<void> {
  // Dynamic import to avoid circular dependencies
  const { prisma } = await import('./prisma')

  try {
    // Batch insert using createMany for efficiency
    await prisma.auditLog.createMany({
      data: entries.map(entry => ({
        action: entry.action,
        userId: entry.userId || null,
        targetUserId: entry.targetUserId || null,
        ipAddress: entry.ip || null,
        userAgent: entry.userAgent || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        success: entry.success,
        createdAt: new Date(entry.timestamp),
      })),
      skipDuplicates: true,
    })
  } catch (error: any) {
    // If AuditLog table doesn't exist yet, fall back to console logging
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.warn('[AUDIT] AuditLog table not found - logging to console only')
      entries.forEach(e => console.log('[AUDIT:FALLBACK]', JSON.stringify(e)))
    } else {
      throw error
    }
  }
}

/**
 * Flush audit buffer to persistent storage (database in production)
 */
async function flushAuditBuffer(): Promise<void> {
  if (auditBuffer.length === 0 || isFlushing) return

  isFlushing = true
  const entries = auditBuffer.splice(0, auditBuffer.length)

  try {
    if (process.env.NODE_ENV === 'production') {
      await writeToDatabase(entries)
    } else if (process.env.NODE_ENV !== 'test') {
      // Development: just log summary
      console.log('[AUDIT BATCH]', JSON.stringify({
        count: entries.length,
        actions: entries.map(e => e.action),
      }))
    }
  } catch (error) {
    console.error('[AUDIT] Failed to flush buffer:', error)
    // Re-add entries to buffer for retry (at the beginning)
    auditBuffer.unshift(...entries)
  } finally {
    isFlushing = false
  }
}

// Periodic flush - use dynamic interval to avoid issues in serverless
let flushInterval: NodeJS.Timeout | null = null

function startPeriodicFlush(): void {
  if (flushInterval) return
  if (typeof setInterval !== 'undefined') {
    flushInterval = setInterval(() => {
      flushAuditBuffer().catch(console.error)
    }, FLUSH_INTERVAL)

    // Ensure cleanup on process exit
    if (typeof process !== 'undefined') {
      process.on('beforeExit', async () => {
        if (flushInterval) clearInterval(flushInterval)
        await flushAuditBuffer()
      })
    }
  }
}

// Start periodic flush
startPeriodicFlush()

/**
 * Force flush - call before process exit or deployment
 */
export async function forceFlushAuditLogs(): Promise<void> {
  await flushAuditBuffer()
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
