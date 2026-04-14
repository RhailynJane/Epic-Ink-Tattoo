import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { WhyUsSection } from "@/components/why-us-section";
import { GallerySection } from "@/components/gallery-section";
import { InstagramSection } from "@/components/instagram-section";
import { ProcessSection } from "@/components/process-section";
import { AboutSection } from "@/components/about-section";
import { FaqSection } from "@/components/faq-section";
import { ReviewsSection } from "@/components/reviews-section";
import { ContactSection } from "@/components/contact-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <WhyUsSection />
      <GallerySection preview />
      <InstagramSection />
      <ProcessSection />
      <AboutSection />
      <ReviewsSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
