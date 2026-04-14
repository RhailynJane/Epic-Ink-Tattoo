"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, Loader2, Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditableText } from "@/components/editable";
import { useEditMode } from "@/components/edit-mode";
import { useSiteContent } from "@/lib/use-site-content";
import { toast } from "sonner";

interface FaqItem {
  q: string;
  a: string;
}

function parseFaqs(raw: string): FaqItem[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is FaqItem =>
          x && typeof x.q === "string" && typeof x.a === "string"
      )
      .map((x) => ({ q: x.q, a: x.a }));
  } catch {
    return [];
  }
}

function FaqListEditor({ initial }: { initial: FaqItem[] }) {
  const edit = useEditMode();
  const [items, setItems] = useState<FaqItem[]>(initial);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setItems(initial);
    setDirty(false);
  }, [initial]);

  function update(i: number, patch: Partial<FaqItem>) {
    setItems((prev) => {
      const next = prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
      setDirty(true);
      return next;
    });
  }

  function add() {
    setItems((prev) => [...prev, { q: "New question", a: "Answer…" }]);
    setDirty(true);
  }

  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  }

  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      setDirty(true);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      await edit?.saveText("faq", "items", JSON.stringify(items));
      setDirty(false);
    } catch {
      /* toast handled upstream */
    } finally {
      setSaving(false);
    }
  }

  function revert() {
    setItems(initial);
    setDirty(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-background/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
          FAQ items ({items.length})
        </p>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={revert}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-60"
            >
              <X className="h-3 w-3" /> Revert
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {saving ? "Saving…" : "Save FAQ"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                aria-label="Move up"
              >
                ▲
              </button>
              <GripVertical className="h-3 w-3 text-muted-foreground/60" />
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                aria-label="Move down"
              >
                ▼
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <input
                value={it.q}
                onChange={(e) => update(i, { q: e.target.value })}
                placeholder="Question"
                className="w-full rounded-md border border-border bg-input px-2 py-1.5 text-sm font-medium text-foreground outline-none focus:border-primary"
              />
              <textarea
                value={it.a}
                onChange={(e) => update(i, { a: e.target.value })}
                placeholder="Answer"
                rows={3}
                className="w-full resize-y rounded-md border border-border bg-input px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  window.confirm("Delete this FAQ item?")
                ) {
                  remove(i);
                }
              }}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-dashed border-border py-2 text-sm text-muted-foreground hover:border-primary/60 hover:text-foreground"
        >
          <Plus className="h-4 w-4" /> Add FAQ item
        </button>
      </div>

      {dirty && !saving && (
        <p
          className="text-xs text-amber-400"
          onClick={() => toast.info("Click Save FAQ to persist changes.")}
        >
          You have unsaved changes.
        </p>
      )}
    </div>
  );
}

export function FaqSection() {
  const edit = useEditMode();
  const { get } = useSiteContent();
  const raw = get("faq", "items");
  const items = parseFaqs(raw);

  return (
    <section id="faq" className="theme-paper relative bg-background py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <EditableText
              section="faq"
              k="eyebrow"
              as="p"
              className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80"
            />
            <h2 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              <EditableText section="faq" k="titleLine1" as="span" />
              <br />
              <EditableText
                section="faq"
                k="titleLine2"
                as="span"
                className="italic text-primary"
              />
            </h2>
          </div>
          <EditableText
            section="faq"
            k="subtitle"
            as="p"
            multiline
            className="text-sm leading-relaxed text-foreground/70 md:text-right"
          />
        </div>

        {edit?.enabled ? (
          <FaqListEditor initial={items} />
        ) : (
          <Accordion
            type="single"
            collapsible
            className="grid gap-3 md:grid-cols-2 md:gap-x-6 md:gap-y-3"
          >
            {items.map((faq, i) => (
              <AccordionItem
                key={`${faq.q}-${i}`}
                value={`faq-${i}`}
                className="rounded-full border border-border bg-card px-6 transition-colors hover:border-primary/40"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-foreground/75">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="mx-auto mt-20 max-w-3xl text-center">
          <EditableText
            section="faq"
            k="quote"
            as="p"
            multiline
            className="font-serif text-xl italic leading-relaxed text-foreground/80 md:text-2xl"
          />
        </div>
      </div>
    </section>
  );
}
