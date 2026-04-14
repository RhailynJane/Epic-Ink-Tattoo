import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GallerySection } from "@/components/gallery-section";

export const metadata: Metadata = {
  title: "Gallery | Epic Ink Tattoo Studio",
  description:
    "Browse the full portfolio of custom tattoos by Eman at Epic Ink Tattoo Studio.",
};

export default function GalleryPage() {
  return (
    <main>
      <SiteHeader />
      <div className="pt-24">
        <GallerySection />
      </div>
      <SiteFooter />
    </main>
  );
}
