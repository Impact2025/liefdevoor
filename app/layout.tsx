import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/layout/Navigation";
import { Sidebar } from "@/components/layout/Sidebar";
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
  themeColor: "#f43f5e",
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
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main content with sidebar offset on desktop */}
            <div className="lg:pl-64">
              <Navigation />
              {children}
            </div>

            <CookieBanner />
            <InstallPrompt />
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
