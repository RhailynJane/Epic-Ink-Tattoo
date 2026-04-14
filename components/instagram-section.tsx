"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function InstagramSection() {
  const embeds = useQuery(api.instagramEmbeds.list);

  useEffect(() => {
    if (embeds && embeds.length > 0) {
      const id = window.setTimeout(() => {
        window.instgrm?.Embeds.process();
      }, 200);
      return () => window.clearTimeout(id);
    }
  }, [embeds]);

  if (!embeds || embeds.length === 0) return null;

  return (
    <section id="instagram" className="bg-background py-24">
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => window.instgrm?.Embeds.process()}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80">
            From the Studio
          </p>
          <h2 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Follow on <span className="italic text-primary">Instagram</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {embeds.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-lg border border-border bg-card p-2"
            >
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={item.url}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  borderRadius: 3,
                  margin: 0,
                  padding: 0,
                  width: "100%",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
