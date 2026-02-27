import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src="/images/hero-bg.jpg"
        alt="Tattoo artist at work in studio"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-background/80" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-full border-2 border-primary/30 md:h-40 md:w-40">
          <Image
            src="/images/logo.jpg"
            alt="Epic Ink Tattoo Studio Logo"
            fill
            className="object-cover"
            priority
          />
        </div>

        <h1 className="font-serif text-5xl font-bold tracking-tight text-primary md:text-7xl lg:text-8xl">
          <span className="text-balance">Epic Ink Tattoo</span>
        </h1>

        <div className="flex flex-col items-center gap-2 text-foreground/80">
          <p className="text-base md:text-lg">Unit A23, New Horizon Mall</p>
          <p className="text-base md:text-lg">
            260300 Writing Creek Cres, Balzac, AB T4A 0X8
          </p>
          <p className="mt-1 text-lg font-medium text-primary md:text-xl">
            Call (780) 286-7773
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="mt-4 border-2 border-primary bg-transparent px-12 py-7 text-lg font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 tracking-wide"
        >
          <a href="#contact">Book an Appointment</a>
        </Button>
      </div>
    </section>
  );
}
