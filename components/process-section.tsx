"use client";

import { EditableText } from "@/components/editable";

const steps = [
  { n: 1, titleKey: "step1Title", bodyKey: "step1Body" },
  { n: 2, titleKey: "step2Title", bodyKey: "step2Body" },
  { n: 3, titleKey: "step3Title", bodyKey: "step3Body" },
  { n: 4, titleKey: "step4Title", bodyKey: "step4Body" },
];

export function ProcessSection() {
  return (
    <section id="process" className="theme-paper relative overflow-hidden bg-background py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, oklch(0.75 0.12 85) 0%, transparent 45%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-20 grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <EditableText
              section="process"
              k="eyebrow"
              as="p"
              className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80"
            />
            <h2 className="font-serif text-5xl font-semibold leading-[1.05] text-foreground md:text-6xl">
              <EditableText section="process" k="titleLine1" as="span" />
              <br />
              <EditableText
                section="process"
                k="titleLine2"
                as="span"
                className="italic text-primary"
              />
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-4">
            <EditableText
              section="process"
              k="subtitle"
              as="p"
              multiline
              className="text-base leading-relaxed text-foreground/70 md:text-lg"
            />
          </div>
        </div>

        <div className="relative">
          {/* vertical guide line on desktop */}
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 border-l border-dashed border-primary/20 lg:block" />

          <ol className="flex flex-col gap-10 lg:gap-16">
            {steps.map((s, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <li
                  key={s.n}
                  className={`relative lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 ${
                    isLeft ? "" : "lg:[&>article]:col-start-7"
                  }`}
                >
                  {/* Step number badge on center line (desktop) */}
                  <span className="pointer-events-none absolute left-1/2 top-1 hidden h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-primary/50 bg-background text-xs font-semibold tracking-wider text-primary lg:flex">
                    0{s.n}
                  </span>

                  <article
                    className={`group rounded-2xl border border-border bg-card p-6 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.7)] transition-colors hover:border-primary/40 md:p-8 lg:col-span-6 ${
                      isLeft ? "lg:mr-8" : "lg:ml-8"
                    }`}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="font-serif text-3xl font-semibold text-primary">
                        0{s.n}
                      </span>
                      <EditableText
                        section="process"
                        k={s.titleKey}
                        as="h3"
                        className="font-serif text-xl font-semibold text-foreground md:text-2xl"
                      />
                    </div>
                    <EditableText
                      section="process"
                      k={s.bodyKey}
                      as="p"
                      multiline
                      className="text-sm leading-relaxed text-foreground/70 md:text-base"
                    />
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
