import Image from "next/image";

export function AboutSection() {
  return (
    <section id="about" className="relative bg-background py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="relative lg:col-span-5">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl border border-border">
              <Image
                src="/images/artist.jpg"
                alt="Eman — The Artist at Epic Ink Tattoo"
                fill
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-serif text-5xl italic text-primary md:text-6xl">
                  Eman
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80">
              Meet The Artist
            </p>
            <h2 className="mb-8 max-w-xl font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Passion, patience,
              <br />
              <span className="italic text-primary">and ink that lasts.</span>
            </h2>

            <blockquote className="mb-8 border-l-2 border-primary/70 pl-4 font-serif text-lg italic text-foreground/80">
              &ldquo;All you need is passion. If you have a passion for something,
              you&rsquo;ll create the talent.&rdquo;
            </blockquote>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
                  The Journey
                </p>
                <p className="text-sm leading-relaxed text-foreground/75">
                  Eman&rsquo;s path into tattoo artistry began 15 years ago with a
                  dusty magazine and a quiet calling. Every design since has been
                  a promise — clean lines, honest intent, work that holds up.
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
                  The Studio
                </p>
                <p className="text-sm leading-relaxed text-foreground/75">
                  Epic Ink Tattoo is an appointment-first studio. Custom
                  consults, careful placement, and aftercare that treats your
                  skin like a canvas worth protecting.
                </p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <div>
                <p className="font-serif text-3xl text-primary">15+</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Years of craft
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl text-primary">1 / 1</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Custom designs
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl text-primary">48h</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Reply window
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
