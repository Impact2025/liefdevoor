import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { LayoutContent } from "@/components/layout/LayoutContent";

// Optimized font loading with display swap for better CLS
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

// Base URL for canonical links and OG images
const baseUrl = process.env.NEXTAUTH_URL || 'https://www.liefdevooriedereen.nl'

export const metadata: Metadata = {
  title: {
    default: "Liefde Voor Iedereen - Nederlandse Dating App",
    template: "%s | Liefde Voor Iedereen",
  },
  description: "Ontmoet singles in Nederland en België. Liefde Voor Iedereen is de dating app met AI-matching, video verificatie en 100% Nederlandse ondersteuning.",
  keywords: ["dating app", "dating nederland", "singles ontmoeten", "liefde vinden", "relatie", "Nederlandse dating", "gratis dating"],
  authors: [{ name: "Liefde Voor Iedereen" }],
  creator: "Liefde Voor Iedereen",
  publisher: "Liefde Voor Iedereen",
  manifest: "/manifest.json",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
    languages: {
      "nl-NL": "/",
      "nl-BE": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/favicon.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LVI Dating",
    startupImage: [
      { url: "/icons/icon-512x512.png" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: baseUrl,
    siteName: "Liefde Voor Iedereen",
    title: "Liefde Voor Iedereen - Vind Echte Liefde",
    description: "Ontmoet singles in Nederland en België. Dating app met AI-matching, video verificatie en 100% Nederlandse ondersteuning.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Liefde Voor Iedereen - Nederlandse Dating App",
        type: "image/png",
      },
      {
        url: "/images/og-image-square.png",
        width: 600,
        height: 600,
        alt: "Liefde Voor Iedereen Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@liefdevooriedereen",
    creator: "@liefdevooriedereen",
    title: "Liefde Voor Iedereen - Nederlandse Dating App",
    description: "Ontmoet singles in Nederland en België. AI-matching, video verificatie, 100% Nederlands.",
    images: ["/images/og-image.png"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "dating",
};

export const viewport: Viewport = {
  themeColor: "#C34C60",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Comprehensive JSON-LD Structured Data for SEO
  // Includes Organization, WebApplication, and SoftwareApplication schemas
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'Liefde Voor Iedereen',
    alternateName: 'LVI Dating',
    description: 'Nederlandse dating app voor iedereen - Vind je perfecte match met AI-matching',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/LiefdevoorIedereen_logo.png`,
      width: 512,
      height: 512,
    },
    image: `${baseUrl}/images/og-image.png`,
    foundingDate: '2024',
    areaServed: [
      { '@type': 'Country', name: 'Netherlands', alternateName: 'NL' },
      { '@type': 'Country', name: 'Belgium', alternateName: 'BE' },
    ],
    availableLanguage: {
      '@type': 'Language',
      name: 'Dutch',
      alternateName: 'nl',
    },
    sameAs: [
      'https://instagram.com/liefdevooriedereen',
      'https://facebook.com/liefdevooriedereen',
      'https://twitter.com/liefdevooriedereen',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@liefdevooriedereen.nl',
      availableLanguage: 'Dutch',
    },
  }

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${baseUrl}/#app`,
    name: 'Liefde Voor Iedereen',
    description: 'Dating app met AI-matching, video verificatie en Nederlandse ondersteuning',
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Web, iOS, Android',
    url: baseUrl,
    author: {
      '@id': `${baseUrl}/#organization`,
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Gratis',
        price: '0',
        priceCurrency: 'EUR',
        description: 'Basis functies gratis',
      },
      {
        '@type': 'Offer',
        name: 'Premium',
        price: '9.95',
        priceCurrency: 'EUR',
        description: 'Onbeperkt swipen, meer filters',
      },
      {
        '@type': 'Offer',
        name: 'Gold',
        price: '24.95',
        priceCurrency: 'EUR',
        description: 'Alle functies, prioriteit matching',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '523',
      bestRating: '5',
      worstRating: '1',
    },
    screenshot: `${baseUrl}/images/screenshot-discover.png`,
    featureList: [
      'AI-powered matching',
      'Video verificatie',
      'Voice introductions',
      'Real-time chat',
      'Nederlandse ondersteuning',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'Liefde Voor Iedereen',
    url: baseUrl,
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'nl-NL',
  }

  // Combine all schemas into a single graph
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, softwareAppSchema, websiteSchema],
  }

  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <GoogleAnalytics />
        <Providers>
          <AnalyticsProvider>
            <LayoutContent>{children}</LayoutContent>
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
