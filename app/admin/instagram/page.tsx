"use client";

import { useState } from "react";
import Script from "next/script";
import { Trash2, Loader2, Instagram } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export default function AdminInstagramPage() {
  const embeds = useQuery(api.instagramEmbeds.list);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Paste an Instagram embed code or URL.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embed: input }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add embed.");
      }
      toast.success("Instagram post added.");
      setInput("");
      setTimeout(() => window.instgrm?.Embeds.process(), 300);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/instagram/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete.");
      toast.success("Embed removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => window.instgrm?.Embeds.process()}
      />

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Instagram Embeds
        </h1>
        <p className="mt-1 text-muted-foreground">
          Paste the full Instagram embed code (or just the post/reel URL) to
          feature it on the homepage.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="mb-10 rounded-lg border border-border bg-card p-6"
      >
        <Label htmlFor="embed" className="text-foreground/80">
          Embed code or URL
        </Label>
        <Textarea
          id="embed"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste the <blockquote class="instagram-media">…</blockquote> code, or an instagram.com/reel/… URL'
          rows={6}
          className="mt-2 border-border bg-input font-mono text-xs text-foreground placeholder:text-muted-foreground"
        />
        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Instagram className="mr-2 h-4 w-4" />
            )}
            Add embed
          </Button>
        </div>
      </form>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {embeds === undefined && (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {embeds && embeds.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">
            No Instagram posts added yet.
          </p>
        )}
        {embeds?.map((item) => (
          <div
            key={item._id}
            className="relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs text-primary hover:underline"
              >
                {item.url}
              </a>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={deleting === item._id}
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-border bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                      Remove Instagram embed?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This will stop showing this post on the site.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-muted">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(item._id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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
  );
}
