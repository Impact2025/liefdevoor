import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { LayoutContent } from "@/components/layout/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liefde Voor Iedereen",
  description: "Vind je perfecte match - De Nederlandse dating app voor iedereen",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/LiefdevoorIedereen_logo.png", sizes: "32x32", type: "image/png" },
      { url: "/images/LiefdevoorIedereen_logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/images/LiefdevoorIedereen_logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/images/LiefdevoorIedereen_logo.png" },
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
    siteName: "Liefde Voor Iedereen",
    title: "Liefde Voor Iedereen - Dating App",
    description: "Vind je perfecte match - De Nederlandse dating app voor iedereen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Liefde Voor Iedereen",
    description: "Vind je perfecte match - De Nederlandse dating app voor iedereen",
  },
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
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Liefde Voor Iedereen',
    description: 'Nederlandse dating app voor iedereen - Vind je perfecte match',
    url: 'https://liefdevooriederen.nl',
    logo: 'https://liefdevooriederen.nl/images/LiefdevoorIedereen_logo.png',
    image: 'https://liefdevooriederen.nl/images/LiefdevoorIedereen_logo.png',
    telephone: '',
    areaServed: ['NL', 'BE'],
    availableLanguage: 'nl',
    priceRange: '€0 - €24.95',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '523',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: '0',
      highPrice: '24.95',
      offerCount: '3',
    },
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
