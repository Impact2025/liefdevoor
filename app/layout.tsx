import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/layout/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liefde Voor Iedereen",
  description: "Vind je perfecte match - De Nederlandse dating app voor iedereen",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LVI Dating",
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
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
