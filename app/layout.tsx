import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { Toaster } from "sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Epic Ink Tattoo Studio | Balzac, AB",
  description:
    "Epic Ink Tattoo - Where art meets skin in the most exquisite way. Professional tattoo studio at New Horizon Mall, Balzac, AB. Book your appointment today.",
  keywords: [
    "tattoo",
    "tattoo studio",
    "Epic Ink Tattoo",
    "Balzac",
    "Alberta",
    "New Horizon Mall",
    "tattoo artist",
    "custom tattoo",
  ],
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
    <html lang="en" className={_playfair.variable}>
      <body className="font-sans antialiased">
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
