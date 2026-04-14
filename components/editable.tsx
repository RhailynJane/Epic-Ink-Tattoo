"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { Check, X, Pencil, Upload, Loader2 } from "lucide-react";
import { useEditMode } from "@/components/edit-mode";
import { useSiteContent } from "@/lib/use-site-content";
import { toast } from "sonner";

interface EditableTextProps {
  section: string;
  k: string;
  as?: ElementType;
  multiline?: boolean;
  className?: string;
  children?: ReactNode;
}

export function EditableText({
  section,
  k,
  as,
  multiline = false,
  className,
  children,
}: EditableTextProps) {
  const Tag = (as ?? (multiline ? "p" : "span")) as ElementType;
  const edit = useEditMode();
  const { get } = useSiteContent();

  const value = get(section, k);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  async function save() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await edit?.saveText(section, k, draft);
      setEditing(false);
    } catch {
      /* toast handled in provider */
    } finally {
      setSaving(false);
    }
  }

  if (!edit?.enabled) {
    return children !== undefined ? (
      <Tag className={className}>{children}</Tag>
    ) : (
      <Tag className={className}>{value}</Tag>
    );
  }

  if (editing) {
    return (
      <span className="relative inline-flex w-full flex-col gap-2 rounded-md border border-primary/60 bg-background/70 p-2">
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.min(10, Math.max(3, draft.split("\n").length + 1))}
            className="w-full resize-y rounded-sm bg-input p-2 text-foreground outline-none"
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-sm bg-input p-2 text-foreground outline-none"
          />
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-transparent px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Save
          </button>
        </div>
      </span>
    );
  }

  return (
    <Tag
      className={`group relative cursor-pointer rounded-sm outline-2 outline-dashed outline-transparent transition-all hover:bg-primary/10 hover:outline-primary/60 ${className ?? ""}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value}
      <span className="pointer-events-none absolute -top-3 -right-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground opacity-0 shadow transition-opacity group-hover:opacity-100">
        <Pencil className="h-2.5 w-2.5" /> edit
      </span>
    </Tag>
  );
}

export function EditableImage({
  currentUrl,
  onUploaded,
  className,
  alt,
  aspect = "aspect-square",
}: {
  currentUrl: string;
  onUploaded: (storageId: string, mediaType: "image" | "video") => Promise<void>;
  className?: string;
  alt: string;
  aspect?: string;
}) {
  const edit = useEditMode();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !edit) return;
    setBusy(true);
    try {
      const { storageId, mediaType } = await edit.uploadMedia(file);
      await onUploaded(storageId, mediaType);
      toast.success("Image updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (!edit?.enabled) {
    // Render children/decoration via parent; here we just show nothing — parent renders actual image.
    return null;
  }

  return (
    <div
      className={`pointer-events-auto absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/40 opacity-0 transition-opacity hover:opacity-100 ${className ?? ""} ${aspect}`}
    >
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {busy ? "Uploading…" : "Change image"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
          disabled={busy}
        />
      </label>
      <span className="sr-only">{alt}</span>
    </div>
  );
}
