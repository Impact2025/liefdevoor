import { notFound } from 'next/navigation'
import { getDoelgroepBySlug } from '@/lib/doelgroepen-data'
import DoelgroepLandingClient from './DoelgroepLandingClient'

/**
 * Server component voor de doelgroep-landingspagina's.
 *
 * De hele pagina was eerder een client component die de doelgroepdata pas in
 * een useEffect ophaalde. De server-HTML bevatte daardoor niets dan een
 * laadspinner: geen h1, geen koppen, geen tekst. Door de data hier op te lossen
 * en als prop door te geven, staat de volledige inhoud in de eerste response.
 */
export default function DoelgroepPage({ params }: { params: { slug: string } }) {
  const data = getDoelgroepBySlug(params.slug)

  if (!data) {
    notFound()
  }

  return <DoelgroepLandingClient data={data} />
}
