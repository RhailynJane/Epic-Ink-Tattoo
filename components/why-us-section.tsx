"use client";

import Image from "next/image";
import { Shield, Heart, Sparkles, Palette } from "lucide-react";
import { EditableText } from "@/components/editable";

const features = [
  { icon: Palette, titleKey: "feature1Title", bodyKey: "feature1Body" },
  { icon: Shield, titleKey: "feature2Title", bodyKey: "feature2Body" },
  { icon: Heart, titleKey: "feature3Title", bodyKey: "feature3Body" },
  { icon: Sparkles, titleKey: "feature4Title", bodyKey: "feature4Body" },
];

const portfolioImages = [
  { src: "/images/whyus-1.jpg", alt: "Detailed black and grey tattoo artwork" },
  { src: "/images/whyus-2.jpg", alt: "Beautiful botanical floral tattoo design" },
  { src: "/images/whyus-3.jpg", alt: "Vibrant color traditional tattoo art" },
];

export function WhyUsSection() {
  return (
    <section id="why-us" className="theme-paper bg-background py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-6 text-center font-serif text-4xl font-bold text-primary md:text-5xl">
          Why Us?
        </h2>
        <EditableText
          section="whyUs"
          k="intro"
          as="p"
          multiline
          className="mx-auto mb-16 block max-w-3xl text-center text-lg leading-relaxed text-foreground/80"
        />

        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="flex gap-5 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <EditableText
                  section="whyUs"
                  k={feature.titleKey}
                  as="h3"
                  className="mb-2 block font-serif text-xl font-semibold text-primary"
                />
                <EditableText
                  section="whyUs"
                  k={feature.bodyKey}
                  as="p"
                  multiline
                  className="block leading-relaxed text-foreground/70"
                />
              </div>
            </div>
          ))}
        </div>

        <EditableText
          section="whyUs"
          k="closing"
          as="p"
          multiline
          className="mt-12 block text-center text-lg italic text-foreground/70"
        />

        {/* Portfolio Preview */}
        <div className="mt-16 grid grid-cols-3 gap-3 overflow-hidden rounded-xl">
          {portfolioImages.map((img) => (
            <div key={img.src} className="relative aspect-4/3 overflow-hidden">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
