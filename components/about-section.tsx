import Image from "next/image";

export function AboutSection() {
  return (
    <section id="about" className="bg-secondary py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* About Epic Ink Tattoo */}
        <div className="mb-24 flex flex-col items-center gap-12 lg:flex-row">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-border lg:w-1/2">
            <Image
              src="/images/logo.jpg"
              alt="Epic Ink Tattoo Studio logo and branding"
              fill
              className="object-cover"
            />
          </div>

          <div className="lg:w-1/2">
            <h2 className="mb-6 font-serif text-3xl font-bold text-primary md:text-4xl">
              Epic Ink Tattoo
            </h2>
            <div className="flex flex-col gap-4 text-foreground/80">
              <p className="leading-relaxed">
                {'"'}Epic Ink Tattoo{'"'} was carefully chosen as the name for
                Eman{"'"}s tattoo shop to encapsulate the essence of the artistry
                and experience offered within its walls.
              </p>
              <p className="leading-relaxed">
                The word {'"'}Epic{'"'} suggests something grand, monumental, and
                awe-inspiring. By associating the shop with this adjective, it
                sets a high standard for the quality and impact of the tattoos
                produced there. Each tattoo created at Epic Ink Tattoo is
                envisioned to be more than just ink on skin; it{"'"}s intended to
                be a masterpiece, a narrative, or a symbol that holds
                significance for the wearer.
              </p>
              <p className="leading-relaxed">
                {'"'}Ink{'"'} is a direct reference to the medium of tattooing.
                It signifies the artistry and skill involved in the tattooing
                process. By prominently featuring {'"'}Ink{'"'} in the name, the
                shop emphasizes its dedication to the craft of tattooing and the
                mastery of this particular form of artistic expression.
              </p>
              <p className="leading-relaxed">
                The name {'"'}Epic Ink Tattoo{'"'} allows for versatility in the
                types of tattoos offered and the artistic styles practiced at the
                shop. Whether clients seek intricate designs, bold statements, or
                subtle symbolism, the shop{"'"}s name suggests that it can cater
                to a wide range of artistic preferences and creative visions.
              </p>
            </div>
          </div>
        </div>

        {/* The Artist */}
        <div className="flex flex-col items-center gap-12 lg:flex-row-reverse">
          <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border border-border lg:w-1/2">
            <Image
              src="/images/artist.jpg"
              alt="Eman - The Artist at Epic Ink Tattoo"
              fill
              className="object-cover"
            />
          </div>

          <div className="lg:w-1/2">
            <h2 className="mb-4 font-serif text-3xl font-bold text-primary md:text-4xl">
              The Artist
            </h2>
            <blockquote className="mb-6 border-l-2 border-primary pl-4 italic text-foreground/70">
              {'"'}All you need is passion. If you have a passion for something,
              you{"'"}ll create the talent.{'"'}
            </blockquote>
            <div className="flex flex-col gap-4 text-foreground/80">
              <p className="leading-relaxed">
                This has been Eman{"'"}s unwavering mantra ever since he first
                picked up a tattoo needle. Eman{"'"}s journey into the world of
                tattoo artistry began 15 years ago, when he stumbled upon an old
                tattoo magazine in a dusty corner of a bookstore. Mesmerized by
                the intricate designs and the stories they told, he knew he had
                discovered his calling.
              </p>
              <p className="leading-relaxed">
                With each stroke of ink, Eman poured his soul into his art,
                infusing every design with meaning and emotion. His reputation as
                a gifted tattoo artist began to spread, drawing clients from far
                and wide who sought not just his skill, but the passion and
                dedication evident in every piece he created.
              </p>
              <p className="leading-relaxed">
                Over the years, Eman{"'"}s journey has been marked by both
                triumphs and challenges. Yet through it all, his unwavering
                belief in the power of passion has remained steadfast. For him,
                tattooing isn{"'"}t just a profession{"---"}it{"'"}s a way of
                life, a testament to the transformative power of following one
                {"'"}s heart.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
