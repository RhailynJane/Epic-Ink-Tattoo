"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I book an appointment?",
    a: "Use the contact form below with your idea, placement, and preferred date. Eman reviews every request personally and replies within 48 hours.",
  },
  {
    q: "Do you require a deposit?",
    a: "Yes — a non-refundable deposit secures your date and is applied to the final cost. You'll receive deposit details after we confirm your consult.",
  },
  {
    q: "Can I see your designs before booking?",
    a: "Absolutely. Once we align on concept, placement, and size, we share a custom draft for sign-off before your session.",
  },
  {
    q: "Can I bring a friend to my session?",
    a: "One guest is welcome, space permitting. Please let us know ahead of time so we can keep the studio comfortable.",
  },
  {
    q: "Do you take walk-ins?",
    a: "Epic Ink is appointment-first. Walk-ins are only accepted when the schedule genuinely allows it — message us to check availability.",
  },
  {
    q: "How should I prepare for my appointment?",
    a: "Sleep well, eat beforehand, hydrate, and wear something that makes the placement easy to access. Skip alcohol for 24 hours prior.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="relative bg-secondary py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80">
              FAQ
            </p>
            <h2 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Frequently
              <br />
              <span className="italic text-primary">Asked Questions</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-foreground/70 md:text-right">
            A few things you might want to know before booking. Still curious?
            Reach out — we&rsquo;re happy to talk it through.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="grid gap-3 md:grid-cols-2 md:gap-x-6 md:gap-y-3"
        >
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.q}
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

        <div className="mx-auto mt-20 max-w-3xl text-center">
          <p className="font-serif text-xl italic leading-relaxed text-foreground/80 md:text-2xl">
            &ldquo;Black ink is timeless — it doesn&rsquo;t follow trends or fade
            with fashion. It&rsquo;s about boldness, permanence, and creating art
            that stands the test of time.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
