/**
 * Cron Request Authentication
 *
 * Single fail-closed check for every /api/cron/* route.
 *
 * A request is accepted when:
 *  1. It carries `Authorization: Bearer <CRON_SECRET>` (external schedulers, manual runs), or
 *  2. It carries the `x-vercel-cron` header. Vercel strips incoming `x-vercel-*`
 *     headers from external traffic, so this only appears on genuine platform crons.
 *
 * Outside production every request is allowed, so local testing stays simple.
 *
 * Important: an unset CRON_SECRET must never disable the check. The previous
 * per-route pattern `if (cronSecret && authHeader !== ...)` did exactly that,
 * leaving the endpoints publicly callable whenever the variable was missing.
 */

export function isAuthorizedCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && request.headers.get('authorization') === `Bearer ${cronSecret}`) {
    return true
  }

  if (request.headers.get('x-vercel-cron')) {
    return true
  }

  return process.env.NODE_ENV !== 'production'
}
