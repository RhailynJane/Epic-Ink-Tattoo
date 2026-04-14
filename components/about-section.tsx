"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EditableText, EditableImage } from "@/components/editable";
import { useEditMode } from "@/components/edit-mode";

export function AboutSection() {
  const edit = useEditMode();
  const artistImage = useQuery(api.artistImage.get);
  const artistUrl = artistImage?.url ?? "/images/artist.jpg";

  async function onArtistUploaded(storageId: string) {
    await fetch("/api/admin/artist-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storageId }),
    });
  }

  return (
    <section id="about" className="relative bg-background py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="relative lg:col-span-5">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl border border-border">
              <Image
                src={artistUrl}
                alt="Eman — The Artist at Epic Ink Tattoo"
                fill
                className="object-cover"
                unoptimized={artistUrl.startsWith("http")}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <EditableText
                  section="about"
                  k="artistLabel"
                  as="p"
                  className="font-serif text-5xl italic text-primary md:text-6xl"
                />
              </div>
              {edit?.enabled && (
                <EditableImage
                  currentUrl={artistUrl}
                  onUploaded={onArtistUploaded}
                  alt="Artist image"
                  aspect=""
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-6">
            <EditableText
              section="about"
              k="eyebrow"
              as="p"
              className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80"
            />
            <h2 className="mb-8 max-w-xl font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              <EditableText section="about" k="titleLine1" as="span" />
              <br />
              <EditableText
                section="about"
                k="titleLine2"
                as="span"
                className="italic text-primary"
              />
            </h2>

            <blockquote className="mb-8 border-l-2 border-primary/70 pl-4 font-serif text-lg italic text-foreground/80">
              <EditableText section="about" k="quote" multiline as="span" />
            </blockquote>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <EditableText
                  section="about"
                  k="journeyTitle"
                  as="p"
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80"
                />
                <EditableText
                  section="about"
                  k="journey"
                  multiline
                  as="p"
                  className="text-sm leading-relaxed text-foreground/75"
                />
              </div>
              <div>
                <EditableText
                  section="about"
                  k="studioTitle"
                  as="p"
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80"
                />
                <EditableText
                  section="about"
                  k="studio"
                  multiline
                  as="p"
                  className="text-sm leading-relaxed text-foreground/75"
                />
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[1, 2, 3].map((n) => (
                <div key={n}>
                  <EditableText
                    section="about"
                    k={`stat${n}Value`}
                    as="p"
                    className="font-serif text-3xl text-primary"
                  />
                  <EditableText
                    section="about"
                    k={`stat${n}Label`}
                    as="p"
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
