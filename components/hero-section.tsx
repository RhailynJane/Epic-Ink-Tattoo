"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/editable";
import { useSiteContent } from "@/lib/use-site-content";

const heroCards = [
  { src: "/images/gallery/tattoo-1.jpg", alt: "Maple Leaf Portrait tattoo", rotate: -6 },
  { src: "/images/gallery/tattoo-2.jpg", alt: "Tiger Cub tattoo", rotate: 4 },
  { src: "/images/gallery/tattoo-3.jpg", alt: "Butterfly Art tattoo", rotate: -3 },
  { src: "/images/gallery/tattoo-4.jpg", alt: "Dog Portrait tattoo", rotate: -4 },
  { src: "/images/gallery/tattoo-5.jpg", alt: "Feather Design tattoo", rotate: 6 },
  { src: "/images/gallery/tattoo-6.jpg", alt: "Lion Realism tattoo", rotate: -5 },
];

export function HeroSection() {
  const { get } = useSiteContent();
  const loop = [...heroCards, ...heroCards];

  return (
    <section className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-background pt-28 pb-20">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, oklch(0.75 0.12 85) 0%, transparent 45%), radial-gradient(circle at 80% 70%, oklch(0.75 0.12 85) 0%, transparent 50%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 text-center animate-fade-up">
        <EditableText
          section="hero"
          k="badge"
          className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-primary/90"
        />

        <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-[5.5rem]">
          <EditableText section="hero" k="titleLine1" as="span" />
          <br />
          <EditableText
            section="hero"
            k="titleLine2"
            as="span"
            className="italic text-primary"
          />
        </h1>

        <EditableText
          section="hero"
          k="subtitle"
          as="p"
          multiline
          className="max-w-2xl text-base leading-relaxed text-foreground/70 md:text-lg"
        />

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group bg-primary px-8 py-6 text-base font-medium text-primary-foreground hover:bg-primary/90"
          >
            <a href="#contact" className="flex items-center gap-2">
              {get("hero", "ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border bg-transparent px-8 py-6 text-base text-foreground hover:bg-muted"
          >
            <a href="/gallery">{get("hero", "ctaSecondary")}</a>
          </Button>
        </div>
      </div>

      <div className="relative mt-16 hero-card-stack">
        <div
          className="flex w-max animate-marquee-x px-4"
          style={{ ["--marquee-duration" as string]: "55s" }}
        >
          {loop.map((card, i) => (
            <div
              key={`row-${i}`}
              aria-hidden={i >= heroCards.length}
              className="relative mr-5 aspect-3/4 w-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] sm:w-56 md:w-64"
              style={{ transform: `rotate(${card.rotate}deg)` }}
            >
              <Image
                src={card.src}
                alt={card.alt}
                fill
                sizes="(max-width: 640px) 11rem, (max-width: 1024px) 14rem, 16rem"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
