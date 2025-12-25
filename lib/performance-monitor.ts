/**
 * Performance Monitoring System
 *
 * Comprehensive performance tracking for:
 * - API response times
 * - Database query performance
 * - Component render times
 * - User experience metrics
 */

// ==================== TYPES ====================

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 's' | 'bytes' | 'count'
  timestamp: number
  tags?: Record<string, string>
  rating?: 'good' | 'needs-improvement' | 'poor'
}

export interface APIMetric extends PerformanceMetric {
  endpoint: string
  method: string
  statusCode: number
  cached: boolean
}

export interface DatabaseMetric extends PerformanceMetric {
  query: string
  table: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION'
}

// ==================== THRESHOLDS ====================

const THRESHOLDS = {
  api: {
    good: 200, // ms
    needsImprovement: 500,
    poor: 1000,
  },
  database: {
    good: 50, // ms
    needsImprovement: 200,
    poor: 500,
  },
  render: {
    good: 16, // ms (60fps)
    needsImprovement: 50,
    poor: 100,
  },
}

// ==================== METRICS STORAGE ====================

class MetricsBuffer {
  private buffer: PerformanceMetric[] = []
  private maxSize = 100
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      // Flush every 30 seconds
      this.flushInterval = setInterval(() => this.flush(), 30000)

      // Flush on page unload
      window.addEventListener('beforeunload', () => this.flush())
    }
  }

  add(metric: PerformanceMetric) {
    this.buffer.push(metric)

    if (this.buffer.length >= this.maxSize) {
      this.flush()
    }
  }

  flush() {
    if (this.buffer.length === 0) return

    const metrics = [...this.buffer]
    this.buffer = []

    // Send to analytics endpoint
    this.sendMetrics(metrics)
  }

  private async sendMetrics(metrics: PerformanceMetric[]) {
    if (typeof window === 'undefined') return

    const endpoint = process.env.NEXT_PUBLIC_METRICS_ENDPOINT || '/api/analytics/events'

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance_batch',
          metrics,
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          },
        }),
        keepalive: true,
      })
    } catch (error) {
      console.error('[Performance] Failed to send metrics:', error)
    }
  }

  getStats(): {
    count: number
    avgResponseTime: number
    slowRequests: number
  } {
    const apiMetrics = this.buffer.filter((m) => m.name.startsWith('api.'))

    return {
      count: apiMetrics.length,
      avgResponseTime:
        apiMetrics.length > 0
          ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length
          : 0,
      slowRequests: apiMetrics.filter((m) => m.rating === 'poor').length,
    }
  }
}

// Singleton buffer
const metricsBuffer = typeof window !== 'undefined' ? new MetricsBuffer() : null

// ==================== API MONITORING ====================

/**
 * Measure API response time
 */
export async function measureAPI<T>(
  endpoint: string,
  method: string,
  fetchFn: () => Promise<Response>
): Promise<{ response: Response; duration: number }> {
  const start = performance.now()
  const response = await fetchFn()
  const duration = performance.now() - start

  const rating = getRating(duration, THRESHOLDS.api)

  const metric: APIMetric = {
    name: `api.${method.toLowerCase()}.${endpoint.replace(/\//g, '.')}`,
    value: duration,
    unit: 'ms',
    timestamp: Date.now(),
    endpoint,
    method,
    statusCode: response.status,
    cached: response.headers.get('x-cache') === 'HIT',
    rating,
    tags: {
      endpoint,
      method,
      status: String(response.status),
    },
  }

  metricsBuffer?.add(metric)

  // Log slow requests
  if (rating === 'poor') {
    console.warn(`[Performance] Slow API: ${method} ${endpoint} took ${duration.toFixed(2)}ms`)
  }

  return { response, duration }
}

/**
 * Create instrumented fetch wrapper
 */
export function createInstrumentedFetch() {
  return async function instrumentedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = init?.method || 'GET'

    const { response } = await measureAPI(url, method, () => fetch(input, init))
    return response
  }
}

// ==================== DATABASE MONITORING ====================

/**
 * Measure database query time (for server-side use)
 */
export async function measureQuery<T>(
  queryName: string,
  table: string,
  operation: DatabaseMetric['operation'],
  queryFn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await queryFn()
  const duration = performance.now() - start

  const rating = getRating(duration, THRESHOLDS.database)

  const metric: DatabaseMetric = {
    name: `db.${operation.toLowerCase()}.${table}`,
    value: duration,
    unit: 'ms',
    timestamp: Date.now(),
    query: queryName,
    table,
    operation,
    rating,
  }

  // Log slow queries
  if (rating === 'poor') {
    console.warn(`[Performance] Slow Query: ${queryName} on ${table} took ${duration.toFixed(2)}ms`)
  }

  // In production, send to monitoring
  if (process.env.NODE_ENV === 'production') {
    logServerMetric(metric)
  }

  return { result, duration }
}

// ==================== COMPONENT MONITORING ====================

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string) {
  if (typeof window === 'undefined') return

  const start = performance.now()

  // Use requestIdleCallback to measure after render
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const duration = performance.now() - start
      const rating = getRating(duration, THRESHOLDS.render)

      if (rating !== 'good') {
        console.warn(`[Performance] Slow Render: ${componentName} took ${duration.toFixed(2)}ms`)
      }

      metricsBuffer?.add({
        name: `render.${componentName}`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        rating,
      })
    })
  }
}

// ==================== MEMORY MONITORING ====================

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number } | null {
  if (typeof window === 'undefined') return null

  const memory = (performance as any).memory
  if (!memory) return null

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
  }
}

/**
 * Monitor memory for leaks
 */
export function monitorMemory(thresholdMB: number = 100) {
  if (typeof window === 'undefined') return

  setInterval(() => {
    const memory = getMemoryUsage()
    if (!memory) return

    const usedMB = memory.usedJSHeapSize / (1024 * 1024)

    if (usedMB > thresholdMB) {
      console.warn(`[Performance] High Memory Usage: ${usedMB.toFixed(2)}MB`)

      metricsBuffer?.add({
        name: 'memory.heap.high',
        value: usedMB,
        unit: 'bytes',
        timestamp: Date.now(),
        rating: 'poor',
      })
    }
  }, 60000) // Check every minute
}

// ==================== NETWORK MONITORING ====================

/**
 * Get network connection info
 */
export function getNetworkInfo(): {
  effectiveType: string
  downlink: number
  rtt: number
} | null {
  if (typeof window === 'undefined') return null

  const connection = (navigator as any).connection
  if (!connection) return null

  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
  }
}

// ==================== UTILITIES ====================

function getRating(
  value: number,
  thresholds: { good: number; needsImprovement: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}

function logServerMetric(metric: PerformanceMetric) {
  // In production, send to monitoring service
  console.log('[Metric]', JSON.stringify(metric))
}

// ==================== PERFORMANCE OBSERVER ====================

/**
 * Initialize performance observers
 */
export function initPerformanceObservers() {
  if (typeof window === 'undefined') return

  // Long Task Observer
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            metricsBuffer?.add({
              name: 'longtask',
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              rating: entry.duration > 100 ? 'poor' : 'needs-improvement',
            })
          }
        }
      })

      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      // Long task observer not supported
    }

    // Resource Timing Observer
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming

          // Only track slow resources
          if (resource.duration > 500) {
            metricsBuffer?.add({
              name: `resource.${resource.initiatorType}`,
              value: resource.duration,
              unit: 'ms',
              timestamp: Date.now(),
              rating: 'poor',
              tags: {
                url: resource.name.substring(0, 100),
                type: resource.initiatorType,
              },
            })
          }
        }
      })

      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (e) {
      // Resource observer not supported
    }
  }
}

// ==================== EXPORTS ====================

export const PerformanceMonitor = {
  measureAPI,
  measureQuery,
  useRenderTime,
  getMemoryUsage,
  monitorMemory,
  getNetworkInfo,
  initPerformanceObservers,
  createInstrumentedFetch,
}

export default PerformanceMonitor
