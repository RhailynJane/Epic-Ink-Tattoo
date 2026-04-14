import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { StructuredData } from "@/components/structured-data";
import { getSiteUrl } from "@/lib/site-url";
import { Toaster } from "sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const _caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Epic Ink Tattoo Studio Calgary | Custom Tattoos in Balzac, AB",
    template: "%s | Epic Ink Tattoo Calgary",
  },
  description:
    "Epic Ink Tattoo is Calgary's premier custom tattoo studio at New Horizon Mall in Balzac, AB. Award-winning artists specializing in realism, fine line, black & grey, colour, cover-ups and custom designs. Book your consultation today.",
  applicationName: "Epic Ink Tattoo",
  keywords: [
    "tattoo Calgary",
    "Calgary tattoo",
    "Calgary tattoo shop",
    "Calgary tattoo studio",
    "best tattoo shop Calgary",
    "tattoo artist Calgary",
    "custom tattoo Calgary",
    "tattoo Balzac",
    "tattoo Airdrie",
    "tattoo shop near me",
    "New Horizon Mall tattoo",
    "fine line tattoo Calgary",
    "realism tattoo Calgary",
    "black and grey tattoo Calgary",
    "colour tattoo Calgary",
    "cover up tattoo Calgary",
    "sleeve tattoo Calgary",
    "portrait tattoo Calgary",
    "Japanese tattoo Calgary",
    "traditional tattoo Calgary",
    "neo traditional tattoo Calgary",
    "watercolour tattoo Calgary",
    "script tattoo Calgary",
    "small tattoo Calgary",
    "walk in tattoo Calgary",
    "female tattoo artist Calgary",
    "tattoo consultation Calgary",
    "tattoo shop Alberta",
    "Epic Ink Tattoo",
  ],
  authors: [{ name: "Epic Ink Tattoo" }],
  creator: "Epic Ink Tattoo",
  publisher: "Epic Ink Tattoo",
  category: "Tattoo Studio",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: "Epic Ink Tattoo",
    title: "Epic Ink Tattoo Studio Calgary | Custom Tattoos in Balzac, AB",
    description:
      "Calgary's premier custom tattoo studio at New Horizon Mall, Balzac. Realism, fine line, black & grey, colour, cover-ups and custom designs by award-winning artists.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Epic Ink Tattoo Studio — Calgary / Balzac, AB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Epic Ink Tattoo Studio Calgary | Custom Tattoos",
    description:
      "Calgary's premier custom tattoo studio at New Horizon Mall, Balzac, AB. Book your consultation today.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2D2D2D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${_playfair.variable} ${_caveat.variable}`}>
      <body className="font-sans antialiased">
        <StructuredData siteUrl={SITE_URL} />
        <ConvexClientProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "oklch(0.25 0.005 60)",
                color: "oklch(0.92 0.01 80)",
                border: "1px solid oklch(0.35 0.01 60)",
              },
            }}
          />
        </ConvexClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
