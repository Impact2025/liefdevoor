import { Metadata } from 'next'
import { getDoelgroepBySlug, alleDoelgroepen } from '@/lib/doelgroepen-data'
import { SITE_URL } from '@/lib/site-url'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = getDoelgroepBySlug(slug)

  if (!data) {
    return {
      title: 'Pagina niet gevonden | Liefde Voor Iedereen',
    }
  }

  return {
    // absolute: de root-layout plakt er anders nóg een "| Liefde Voor Iedereen"
    // achter, wat de title over de SERP-limiet duwde.
    title: { absolute: `${data.metaTitle} | Liefde Voor Iedereen` },
    description: data.metaDescription,
    keywords: data.contentTags.join(', '),
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: 'website',
      locale: 'nl_NL',
      siteName: 'Liefde Voor Iedereen',
      images: [
        {
          url: data.heroImage || '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: data.heroTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
    },
    alternates: {
      canonical: `${SITE_URL}/${data.slug}`,
    },
  }
}

export async function generateStaticParams() {
  return alleDoelgroepen.map((doelgroep) => ({
    slug: doelgroep.slug,
  }))
}

export default function DoelgroepLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
