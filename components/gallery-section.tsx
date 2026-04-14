"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GalleryItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  category?: string;
  mediaType?: "image" | "video";
  createdAt?: number;
}

const ALBUM_ORDER = [
  "Reels",
  "Cover Up",
  "Portrait",
  "Realism",
  "Black & Grey",
  "Color",
  "Fine Line",
  "Traditional",
  "Flash",
  "Custom",
];

const fallbackGallery: GalleryItem[] = [
  { id: "1", title: "Maple Leaf Portrait", artist: "Eman", url: "/images/gallery/tattoo-1.jpg" },
  { id: "2", title: "Tiger Cub", artist: "Eman", url: "/images/gallery/tattoo-2.jpg" },
  { id: "3", title: "Butterfly Art", artist: "Eman", url: "/images/gallery/tattoo-3.jpg" },
  { id: "4", title: "Dog Portrait", artist: "Eman", url: "/images/gallery/tattoo-4.jpg" },
  { id: "5", title: "Feather Design", artist: "Eman", url: "/images/gallery/tattoo-5.jpg" },
  { id: "6", title: "Lion Realism", artist: "Eman", url: "/images/gallery/tattoo-6.jpg" },
];

const rotations = [-4, 3, -2, 5, -6, 2, -3, 4, -5];
const offsets = [0, 14, -10, 18, -6, 10, -14, 6, -4];

function formatPolaroidDate(ts?: number, i = 0) {
  const d = ts ? new Date(ts) : new Date(2026, 0, 1 + (i * 7) % 30);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.20${yy}`;
}

export function GallerySection({ preview = false }: { preview?: boolean }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [album, setAlbum] = useState<string>("All");

  const remote = useQuery(api.gallery.list);
  const items: GalleryItem[] = (remote && remote.length > 0
    ? remote
        .filter((i) => !!i.url)
        .map((i) => ({
          id: i._id as unknown as string,
          title: i.title,
          artist: i.artist,
          url: i.url as string,
          category: i.category,
          mediaType: i.mediaType,
          createdAt: i.createdAt,
        }))
    : fallbackGallery);

  const shown = preview ? items.slice(0, 6) : items;

  if (preview) {
    return (
      <section id="gallery" className="relative bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80">
                On The Board
              </p>
              <h2 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Our <span className="italic text-primary">Gallery</span>
              </h2>
            </div>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              View full gallery
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="relative grid grid-cols-2 gap-x-6 gap-y-10 px-2 pt-4 md:grid-cols-3 md:gap-x-10 md:gap-y-16 md:px-6">
            {shown.map((item, index) => (
              <PolaroidCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => setSelected(item)}
              />
            ))}

            {/* Sticky notes overlays */}
            {shown.length >= 4 && (
              <span
                className="pointer-events-none absolute -top-2 left-[18%] hidden rotate-[-8deg] rounded-sm bg-amber-200 px-3 py-2 text-[11px] font-semibold text-amber-900 shadow-md md:block"
                style={{ fontFamily: "var(--font-caveat), 'Caveat', cursive" }}
              >
                a lot of
                <br />
                details here!
              </span>
            )}
            {shown.length >= 6 && (
              <span
                className="pointer-events-none absolute bottom-4 right-[22%] hidden rotate-6 rounded-sm bg-amber-200 px-3 py-2 text-[11px] font-semibold text-amber-900 shadow-md md:block"
                style={{ fontFamily: "var(--font-caveat), 'Caveat', cursive" }}
              >
                fine line
                <br />
                favorite ♥
              </span>
            )}
          </div>

          {items.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              No gallery items yet.
            </p>
          )}
        </div>

        <MediaModal selected={selected} onClose={() => setSelected(null)} />
      </section>
    );
  }

  // FULL gallery page layout (non-preview) — minimalist with album tabs
  const albums = useMemo(() => {
    const present = new Set<string>();
    for (const it of items) {
      if (it.category) present.add(it.category);
    }
    const ordered = ALBUM_ORDER.filter((a) => present.has(a));
    const extras = [...present].filter((a) => !ALBUM_ORDER.includes(a)).sort();
    return ["All", ...ordered, ...extras];
  }, [items]);

  const visible =
    album === "All" ? shown : shown.filter((i) => i.category === album);

  return (
    <section id="gallery" className="relative bg-background py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80">
            Portfolio
          </p>
          <h2 className="mb-4 font-serif text-5xl font-semibold leading-tight text-foreground md:text-6xl">
            Our <span className="italic text-primary">Gallery</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-foreground/60 md:text-base">
            A collection of custom, appointment-only work — each piece designed
            and inked by Eman.
          </p>
        </div>

        {albums.length > 1 && (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            {albums.map((a) => {
              const active = a === album;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlbum(a)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-foreground/70 hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
          {visible.map((item) => (
            <button
              key={item.id}
              className="group relative overflow-hidden"
              onClick={() => setSelected(item)}
              aria-label={`${item.title} — by ${item.artist}`}
            >
              <div className="relative aspect-square">
                {item.mediaType === "video" ? (
                  <video
                    src={item.url}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                )}
                <div className="absolute inset-0 flex items-end justify-start bg-linear-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div>
                    <p className="font-serif text-lg font-semibold text-primary">
                      {item.title}
                    </p>
                    <p className="text-xs text-foreground/70">
                      By {item.artist}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No gallery items yet.
          </p>
        )}
        {items.length > 0 && visible.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            No items in this album yet.
          </p>
        )}
      </div>

      <MediaModal selected={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function PolaroidCard({
  item,
  index,
  onClick,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
}) {
  const rotate = rotations[index % rotations.length];
  const yOffset = offsets[index % offsets.length];

  return (
    <button
      onClick={onClick}
      className="group relative mx-auto block w-full max-w-65 cursor-pointer outline-hidden"
      style={{
        transform: `translateY(${yOffset}px) rotate(${rotate}deg)`,
      }}
      aria-label={`${item.title} — by ${item.artist}`}
    >
      <div className="relative bg-[#f7f4ec] p-3 pb-10 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-0">
        {/* Tape strips */}
        <span className="pointer-events-none absolute -top-2 left-4 h-5 w-14 rotate-[-8deg] bg-amber-100/80 shadow-sm" />
        <span className="pointer-events-none absolute -top-2 right-4 h-5 w-14 rotate-10 bg-amber-100/80 shadow-sm" />

        <div className="relative aspect-square w-full overflow-hidden bg-black">
          {item.mediaType === "video" ? (
            <video
              src={item.url}
              className="h-full w-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          ) : (
            <Image
              src={item.url}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 45vw, 260px"
              className="object-cover"
            />
          )}
        </div>

        <p
          className="absolute bottom-3 left-0 right-0 text-center text-sm tracking-wide text-neutral-700"
          style={{ fontFamily: "var(--font-caveat), 'Caveat', 'Dancing Script', cursive" }}
        >
          {formatPolaroidDate(item.createdAt, index)}
        </p>
      </div>
    </button>
  );
}

function MediaModal({
  selected,
  onClose,
}: {
  selected: GalleryItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!selected} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-hidden border-border bg-card p-0">
        {selected && (
          <div>
            <div className="relative aspect-video w-full">
              {selected.mediaType === "video" ? (
                <video
                  src={selected.url}
                  className="h-full w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <Image
                  src={selected.url}
                  alt={selected.title}
                  fill
                  className="object-contain"
                />
              )}
            </div>
            <div className="p-6">
              <h3 className="font-serif text-xl font-bold text-primary">
                {selected.title}
              </h3>
              <p className="text-foreground/70">By {selected.artist}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
