/**
 * Canonieke basis-URL van de site.
 *
 * De site draait op www; https://liefdevooriedereen.nl geeft een redirect naar
 * https://www.liefdevooriedereen.nl. Canonicals die naar de non-www variant
 * wezen, verwezen dus naar een URL die zelf doorverwijst — Google negeert zo'n
 * canonical en splitst de signalen. Gebruik altijd SITE_URL / canonical().
 */
/**
 * Bewust niet NEXTAUTH_URL: die verschilt per deployment (preview-URL's van
 * Vercel), waardoor previews canonicals naar zichzelf zouden uitzenden. Een
 * canonical hoort altijd het productiedomein aan te wijzen.
 */
const RAW = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.liefdevooriedereen.nl'

export const SITE_URL = RAW.replace(/\/+$/, '')

/** Bouwt een absolute canonical URL voor een pad ('/prijzen' of 'prijzen'). */
export function canonical(path = ''): string {
  if (!path || path === '/') return SITE_URL
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`
}
