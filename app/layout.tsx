import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/layout/Navigation";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liefde Voor Iedereen",
  description: "Vind je perfecte match - De Nederlandse dating app voor iedereen",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
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
  themeColor: "#ec4899",
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
  return (
    <html lang="nl">
      <body className={inter.className}>
        <GoogleAnalytics />
        <Providers>
          <AnalyticsProvider>
            <Navigation />
            {children}
            <CookieBanner />
            <InstallPrompt />
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
