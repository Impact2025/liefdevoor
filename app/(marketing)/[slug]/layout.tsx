import { Metadata } from 'next'
import { getDoelgroepBySlug, alleDoelgroepen } from '@/lib/doelgroepen-data'

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
    title: data.metaTitle,
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
      canonical: `https://liefdevooriedereen.nl/${data.slug}`,
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
