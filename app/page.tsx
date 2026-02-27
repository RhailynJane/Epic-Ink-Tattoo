import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { WhyUsSection } from "@/components/why-us-section";
import { GallerySection } from "@/components/gallery-section";
import { AboutSection } from "@/components/about-section";
import { ReviewsSection } from "@/components/reviews-section";
import { ContactSection } from "@/components/contact-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <WhyUsSection />
      <GallerySection />
      <AboutSection />
      <ReviewsSection />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
