"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";

interface EditModeValue {
  enabled: boolean;
  pending: number;
  saveText: (section: string, key: string, value: string) => Promise<void>;
  uploadMedia: (file: File) => Promise<{ storageId: string; mediaType: "image" | "video" }>;
}

const Ctx = createContext<EditModeValue | null>(null);

export function EditModeProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [pending, setPending] = useState(0);

  const saveText = useCallback(
    async (section: string, key: string, value: string) => {
      setPending((n) => n + 1);
      try {
        const res = await fetch("/api/admin/site-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, key, value }),
        });
        if (!res.ok) throw new Error("Save failed.");
        toast.success("Saved.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Save failed.");
        throw err;
      } finally {
        setPending((n) => n - 1);
      }
    },
    []
  );

  const uploadMedia = useCallback(async (file: File) => {
    const urlRes = await fetch("/api/admin/upload-url", { method: "POST" });
    if (!urlRes.ok) throw new Error("Could not get upload URL.");
    const { url } = await urlRes.json();

    const putRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) throw new Error("Upload failed.");
    const { storageId } = await putRes.json();
    const mediaType: "image" | "video" = file.type.startsWith("video/")
      ? "video"
      : "image";
    return { storageId, mediaType };
  }, []);

  return (
    <Ctx.Provider value={{ enabled, pending, saveText, uploadMedia }}>
      {children}
    </Ctx.Provider>
  );
}

export function useEditMode() {
  return useContext(Ctx);
}
