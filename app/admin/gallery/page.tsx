"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit2,
  ImageIcon,
  Film,
  Loader2,
  Check,
  CircleAlert,
  X,
  UploadCloud,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface EditableItem {
  _id: string;
  title: string;
  artist: string;
  category?: string;
  url: string | null;
  mediaType?: "image" | "video";
}

type QueueStatus = "pending" | "uploading" | "done" | "error";
interface QueueItem {
  id: string;
  file: File;
  title: string;
  previewUrl: string;
  status: QueueStatus;
  error?: string;
}

const MAX_PARALLEL = 3;

function titleFromName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function AdminGalleryPage() {
  const items = useQuery(api.gallery.list);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editing, setEditing] = useState<EditableItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [artist, setArtist] = useState("Eman");
  const [category, setCategory] = useState("Color");

  function clearQueue() {
    setQueue((prev) => {
      for (const q of prev) URL.revokeObjectURL(q.previewUrl);
      return [];
    });
  }

  function resetForm() {
    setArtist("Eman");
    setCategory("Color");
    clearQueue();
    if (fileRef.current) fileRef.current.value = "";
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (list.length === 0) {
      toast.error("Only image and video files are allowed.");
      return;
    }
    setQueue((prev) => [
      ...prev,
      ...list.map<QueueItem>((f) => ({
        id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        title: titleFromName(f.name),
        previewUrl: URL.createObjectURL(f),
        status: "pending",
      })),
    ]);
  }, []);

  function removeFromQueue(id: string) {
    setQueue((prev) => {
      const found = prev.find((q) => q.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((q) => q.id !== id);
    });
  }

  function updateQueue(id: string, patch: Partial<QueueItem>) {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  async function uploadOne(item: QueueItem) {
    updateQueue(item.id, { status: "uploading", error: undefined });
    try {
      const urlRes = await fetch("/api/admin/upload-url", { method: "POST" });
      if (!urlRes.ok) throw new Error("Failed to get upload URL.");
      const { url: uploadUrl } = await urlRes.json();

      const putRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": item.file.type },
        body: item.file,
      });
      if (!putRes.ok) throw new Error("Upload failed.");
      const { storageId } = await putRes.json();

      const mediaType: "image" | "video" = item.file.type.startsWith("video/")
        ? "video"
        : "image";

      const addRes = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title || titleFromName(item.file.name) || "Untitled",
          artist,
          category,
          storageId,
          mediaType,
        }),
      });
      if (!addRes.ok) throw new Error("Save failed.");

      updateQueue(item.id, { status: "done" });
    } catch (err) {
      updateQueue(item.id, {
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed.",
      });
    }
  }

  async function handleUploadAll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pending = queue.filter((q) => q.status === "pending" || q.status === "error");
    if (pending.length === 0) {
      toast.error("Add at least one file.");
      return;
    }

    setUploading(true);

    const toProcess = [...pending];
    const workers: Promise<void>[] = [];
    const runNext = async (): Promise<void> => {
      const next = toProcess.shift();
      if (!next) return;
      await uploadOne(next);
      return runNext();
    };
    for (let i = 0; i < Math.min(MAX_PARALLEL, toProcess.length); i++) {
      workers.push(runNext());
    }
    await Promise.all(workers);

    setUploading(false);

    const latest = (currQueue: QueueItem[]) => currQueue;
    setQueue((curr) => {
      const done = latest(curr).filter((q) => q.status === "done").length;
      const failed = latest(curr).filter((q) => q.status === "error").length;
      if (done > 0) toast.success(`Uploaded ${done} item${done === 1 ? "" : "s"}.`);
      if (failed > 0) toast.error(`${failed} failed — check the list below.`);
      if (failed === 0 && done > 0) {
        for (const q of curr) URL.revokeObjectURL(q.previewUrl);
        setTimeout(() => {
          setIsUploadOpen(false);
          resetForm();
        }, 400);
        return [];
      }
      return curr;
    });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function onPageDrop(e: React.DragEvent) {
    if (!e.dataTransfer.files?.length) return;
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
    setIsUploadOpen(true);
  }

  async function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    try {
      const res = await fetch(`/api/admin/gallery/${editing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          artist: editing.artist,
          category: editing.category,
        }),
      });
      if (!res.ok) throw new Error("Update failed.");
      toast.success("Updated.");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed.");
      toast.success("Deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  const list: EditableItem[] =
    items?.map((i) => ({
      _id: i._id as unknown as string,
      title: i.title,
      artist: i.artist,
      category: i.category,
      url: i.url,
      mediaType: i.mediaType,
    })) ?? [];

  const [pageDragOver, setPageDragOver] = [dragOver, setDragOver];

  return (
    <div
      className="relative"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setPageDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setPageDragOver(false);
      }}
      onDrop={onPageDrop}
    >
      {pageDragOver && !isUploadOpen && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary bg-card px-12 py-10 shadow-xl">
            <UploadCloud className="h-10 w-10 text-primary" />
            <p className="font-serif text-xl text-foreground">
              Drop files to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Images &amp; videos accepted — multi-file OK
            </p>
          </div>
        </div>
      )}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary/80">
            Portfolio
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground">
            Our <span className="italic text-primary">Gallery</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This view mirrors the public gallery. Upload, edit, or remove items below.
            {items ? ` ${items.length} total.` : ""}
          </p>
        </div>

        <Dialog
          open={isUploadOpen}
          onOpenChange={(open) => {
            setIsUploadOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary">
                Upload Gallery Media
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUploadAll} className="flex flex-col gap-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <Film className="h-8 w-8 text-muted-foreground" />
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Drag &amp; drop images or videos here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse — you can select multiple files
                </p>
                <Input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                />
              </div>

              {queue.length > 0 && (
                <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-background/40 p-2">
                  {queue.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center gap-3 rounded-md bg-card p-2"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {q.file.type.startsWith("video/") ? (
                          <video
                            src={q.previewUrl}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={q.previewUrl}
                            alt={q.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Input
                          value={q.title}
                          onChange={(e) =>
                            updateQueue(q.id, { title: e.target.value })
                          }
                          disabled={uploading && q.status === "uploading"}
                          className="h-8 border-border bg-input text-sm text-foreground"
                        />
                        <p className="truncate text-xs text-muted-foreground">
                          {q.file.name} · {(q.file.size / 1024 / 1024).toFixed(2)} MB
                          {q.error ? ` · ${q.error}` : ""}
                        </p>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        {q.status === "uploading" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {q.status === "done" && (
                          <Check className="h-4 w-4 text-emerald-400" />
                        )}
                        {q.status === "error" && (
                          <CircleAlert className="h-4 w-4 text-destructive" />
                        )}
                        {q.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => removeFromQueue(q.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-foreground/80">Artist (all)</Label>
                  <Input
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                    className="mt-1 border-border bg-input text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground/80">Album (all)</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1 border-border bg-input text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card">
                      <SelectItem value="Color">Color</SelectItem>
                      <SelectItem value="Black & Grey">Black &amp; Grey</SelectItem>
                      <SelectItem value="Realism">Realism</SelectItem>
                      <SelectItem value="Traditional">Traditional</SelectItem>
                      <SelectItem value="Fine Line">Fine Line</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={clearQueue}
                  disabled={queue.length === 0 || uploading}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Clear list
                </button>
                <Button
                  type="submit"
                  disabled={uploading || queue.length === 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading {queue.filter((q) => q.status === "uploading").length}/
                      {queue.filter((q) => q.status !== "done").length}…
                    </>
                  ) : (
                    `Upload ${queue.length || ""} file${queue.length === 1 ? "" : "s"}`.trim()
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items === undefined ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 py-16 text-center text-muted-foreground">
          No gallery items yet. Upload your first image or video.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {list.map((item) => (
            <div
              key={item._id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-square">
                {item.url ? (
                  item.mediaType === "video" ? (
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
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-sm font-semibold text-primary">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-foreground/70">
                      By {item.artist}
                      {item.category ? ` — ${item.category}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-background/40 text-foreground backdrop-blur hover:bg-background/70"
                      onClick={() => setEditing(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit {item.title}</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-background/40 text-foreground backdrop-blur hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete {item.title}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-border bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">
                            Delete item
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Remove {'"'}
                            {item.title}
                            {'"'}? This cannot be undone.
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
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-primary">
              Edit Item
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleEditSave} className="flex flex-col gap-4">
              <div>
                <Label className="text-foreground/80">Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Artist</Label>
                <Input
                  value={editing.artist}
                  onChange={(e) =>
                    setEditing({ ...editing, artist: e.target.value })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Category</Label>
                <Select
                  value={editing.category ?? "Color"}
                  onValueChange={(v) => setEditing({ ...editing, category: v })}
                >
                  <SelectTrigger className="mt-1 border-border bg-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="Reels">Reels</SelectItem>
                    <SelectItem value="Cover Up">Cover Up</SelectItem>
                    <SelectItem value="Color">Color</SelectItem>
                    <SelectItem value="Black & Grey">Black &amp; Grey</SelectItem>
                    <SelectItem value="Realism">Realism</SelectItem>
                    <SelectItem value="Traditional">Traditional</SelectItem>
                    <SelectItem value="Fine Line">Fine Line</SelectItem>
                    <SelectItem value="Portrait">Portrait</SelectItem>
                    <SelectItem value="Flash">Flash</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
