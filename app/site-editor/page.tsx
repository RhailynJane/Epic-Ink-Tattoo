"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  ImageIcon,
  Info,
  LogOut,
  X,
} from "lucide-react";
import { EditModeProvider, useEditMode } from "@/components/edit-mode";
import { HeroSection } from "@/components/hero-section";
import { WhyUsSection } from "@/components/why-us-section";
import { AboutSection } from "@/components/about-section";
import { ProcessSection } from "@/components/process-section";
import { FaqSection } from "@/components/faq-section";
import { ContactSection } from "@/components/contact-section";
import { SiteFooter } from "@/components/site-footer";

function EditorToolbar() {
  const edit = useEditMode();
  const router = useRouter();
  const [dismissHint, setDismissHint] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.replace("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-primary/40 bg-background/90 px-3 py-1.5 text-xs shadow-lg backdrop-blur">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary" />
        <strong className="text-foreground">Edit mode</strong>
        <span className="hidden text-muted-foreground sm:inline">
          · {edit?.pending ? `Saving ${edit.pending}…` : "All changes saved"}
        </span>

        <span className="mx-1 h-4 w-px bg-border" />

        <Link
          href="/admin"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-foreground hover:bg-muted"
          title="Admin dashboard"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Admin
        </Link>
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-foreground hover:bg-muted"
          title="Manage gallery"
        >
          <ImageIcon className="h-3.5 w-3.5" /> Gallery
        </Link>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-foreground hover:bg-muted"
          title="View live site"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Live
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-foreground hover:bg-muted disabled:opacity-60"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {signingOut ? "…" : "Sign out"}
          </span>
        </button>
      </div>

      {!dismissHint && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-xl">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-foreground">
              Click any text to edit. Hover the artist photo to change it.
            </p>
            <p className="mt-1">
              Gallery items (images &amp; videos) are managed on the{" "}
              <Link
                href="/admin/gallery"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Gallery
              </Link>{" "}
              page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissHint(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss hint"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}

export default function SiteEditorPage() {
  return (
    <EditModeProvider enabled>
      <main className="min-h-screen overflow-x-hidden bg-background">
        <EditorToolbar />
        <HeroSection />
        <WhyUsSection />
        <ProcessSection />
        <AboutSection />
        <FaqSection />
        <ContactSection />
        <SiteFooter />
      </main>
    </EditModeProvider>
  );
}
