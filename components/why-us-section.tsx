"use client";

import Image from "next/image";
import { Shield, Heart, Sparkles, Palette } from "lucide-react";
import { EditableText } from "@/components/editable";

const features = [
  {
    icon: Palette,
    title: "Artistry & Skill",
    description:
      "Whether you're looking for intricate black and grey realism, vibrant color work, traditional designs, or custom creations, our artists have the skill and passion to bring your ideas to life.",
  },
  {
    icon: Shield,
    title: "Professionalism & Hygiene",
    description:
      "With a commitment to professionalism, hygiene, and customer satisfaction, we strive to create a welcoming and safe environment for all our clients.",
  },
  {
    icon: Heart,
    title: "Warmth & Respect",
    description:
      "From the moment you walk through our doors, you'll be greeted with warmth, respect, and a dedication to making your tattoo experience unforgettable.",
  },
  {
    icon: Sparkles,
    title: "Lasting Statements",
    description:
      "Explore our portfolio to see the artistry and diversity of our work, and feel free to reach out to schedule a consultation or appointment. Let us help you make a statement that lasts a lifetime.",
  },
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
              key={feature.title}
              className="flex gap-5 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-foreground/70">
                  {feature.description}
                </p>
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
