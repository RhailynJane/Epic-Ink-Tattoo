"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const fallbackGallery: GalleryItem[] = [
  {
    id: "1",
    title: "Maple Leaf Portrait",
    artist: "Eman",
    url: "/images/gallery/tattoo-1.jpg",
  },
  {
    id: "2",
    title: "Tiger Cub",
    artist: "Eman",
    url: "/images/gallery/tattoo-2.jpg",
  },
  {
    id: "3",
    title: "Butterfly Art",
    artist: "Eman",
    url: "/images/gallery/tattoo-3.jpg",
  },
  {
    id: "4",
    title: "Dog Portrait",
    artist: "Eman",
    url: "/images/gallery/tattoo-4.jpg",
  },
  {
    id: "5",
    title: "Feather Design",
    artist: "Eman",
    url: "/images/gallery/tattoo-5.jpg",
  },
  {
    id: "6",
    title: "Lion Realism",
    artist: "Eman",
    url: "/images/gallery/tattoo-6.jpg",
  },
];

interface GalleryItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  mediaType?: "image" | "video";
}

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Use Convex gallery data when connected, fallback to local images
  const galleryItems = fallbackGallery;

  return (
    <section id="gallery" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-4 text-center font-serif text-4xl font-bold text-primary md:text-5xl">
          Our Gallery
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-foreground/70">
          Explore the artistry and diversity of our work. Each piece is a unique
          masterpiece crafted with passion.
        </p>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {galleryItems.map((item, index) => (
            <button
              key={item.id}
              className={`group relative overflow-hidden rounded-lg ${
                index === 0 ? "col-span-2 row-span-2" : ""
              }`}
              onClick={() => setSelectedImage(item)}
            >
              <div className={`relative ${index === 0 ? "aspect-square" : "aspect-square"}`}>
                {item.mediaType === "video" ? (
                  <video
                    src={item.url}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="border border-primary px-4 py-2 font-serif text-lg font-semibold text-primary">
                    {item.title}
                  </span>
                  <span className="mt-2 text-sm text-foreground/70">
                    By {item.artist}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl border-border bg-card p-0 overflow-hidden">
          {selectedImage && (
            <div>
              <div className="relative aspect-video w-full">
                {selectedImage.mediaType === "video" ? (
                  <video
                    src={selectedImage.url}
                    className="h-full w-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-primary">
                  {selectedImage.title}
                </h3>
                <p className="text-foreground/70">By {selectedImage.artist}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
