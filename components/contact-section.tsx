"use client";

import { useMemo, useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Calendar,
  Mail,
  User,
  CheckCircle2,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EditableText } from "@/components/editable";

interface SubmittedSummary {
  firstName: string;
  date: string;
  time?: string;
  email: string;
}

export function ContactSection() {
  const createAppointment = useMutation(api.appointments.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedSummary | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const today = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  function resetForm() {
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setDate("");
    setTime("");
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!firstName || !lastName || !email || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (date < today) {
      toast.error("Please choose a date in the future.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAppointment({
        firstName,
        lastName,
        phone,
        email,
        date,
        time: time || undefined,
        message: message || undefined,
      });
      setSubmitted({
        firstName,
        email,
        date,
        time: time || undefined,
      });
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to submit. Please try again or call us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="bg-background py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Contact Info */}
          <div className="lg:w-1/2">
            <EditableText
              section="contact"
              k="eyebrow"
              as="p"
              className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/80"
            />
            <h2 className="mb-6 font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              <EditableText section="contact" k="titleLine1" as="span" />
              <br />
              <EditableText
                section="contact"
                k="titleLine2"
                as="span"
                className="italic text-primary"
              />
            </h2>
            <EditableText
              section="contact"
              k="subtitle"
              as="p"
              multiline
              className="mb-10 block max-w-md text-sm leading-relaxed text-foreground/70"
            />

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <EditableText
                    section="contact"
                    k="address1"
                    as="p"
                    className="font-medium text-foreground"
                  />
                  <EditableText
                    section="contact"
                    k="address2"
                    as="p"
                    className="text-foreground/70"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <EditableText
                    section="contact"
                    k="phone"
                    as="p"
                    className="font-medium text-primary"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Hours</p>
                  <EditableText
                    section="contact"
                    k="hoursWeek"
                    as="p"
                    className="text-foreground/70"
                  />
                  <EditableText
                    section="contact"
                    k="hoursSun"
                    as="p"
                    className="text-foreground/70"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2496.7!2d-114.0747!3d51.1464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537165d47e2c9b95%3A0x9a4b1c1ca04f1e8a!2sNew%20Horizon%20Mall!5e0!3m2!1sen!2sca!4v1234567890"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Epic Ink Tattoo location at New Horizon Mall"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <div className="lg:w-1/2">
            <div className="sticky top-28 rounded-2xl border border-border bg-card p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
              {submitted ? (
                <SubmittedState
                  summary={submitted}
                  onReset={() => setSubmitted(null)}
                />
              ) : (
                <>
              <h3 className="mb-1 font-serif text-2xl font-semibold text-foreground">
                Share your idea
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                We&rsquo;ll reply within 48 hours to confirm your session.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-foreground/80">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        required
                        autoComplete="given-name"
                        className="border-border bg-input pl-9 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-foreground/80">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      autoComplete="family-name"
                      className="mt-1 border-border bg-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email" className="text-foreground/80">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="border-border bg-input pl-9 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground/80">
                      Phone
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(780) 000-0000"
                        autoComplete="tel"
                        className="border-border bg-input pl-9 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="date" className="text-foreground/80">
                      Preferred Date{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={today}
                        required
                        className="border-border bg-input pl-9 text-foreground"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Must be today or later.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-foreground/80">
                      Preferred Time
                    </Label>
                    <div className="relative mt-1">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        min="10:00"
                        max="20:00"
                        step={900}
                        className="border-border bg-input pl-9 text-foreground"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Studio hours: 10 AM – 8 PM.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-foreground/80">
                    Your tattoo idea
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about size, placement, style, and any references you have in mind…"
                    rows={5}
                    className="mt-1 border-border bg-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {isSubmitting ? "Submitting…" : "Request Appointment"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By submitting, you agree to be contacted about your booking.
                </p>
              </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubmittedState({
  summary,
  onReset,
}: {
  summary: SubmittedSummary;
  onReset: () => void;
}) {
  const prettyDate = (() => {
    const parts = summary.date.split("-").map(Number);
    if (parts.length !== 3) return summary.date;
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  })();

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center animate-fade-up">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
        <CheckCircle2 className="h-7 w-7 text-emerald-300" />
      </div>

      <div>
        <h3 className="mb-2 font-serif text-2xl font-semibold text-foreground">
          Thanks, {summary.firstName}.
        </h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your appointment request has been received. We&rsquo;ll review it and
          reply within <span className="text-foreground">48 hours</span> to
          confirm the details.
        </p>
      </div>

      <div className="w-full rounded-xl border border-border bg-background/50 p-4 text-left">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          Request summary
        </p>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Preferred date</dt>
            <dd className="text-right font-medium text-foreground">
              {prettyDate}
            </dd>
          </div>
          {summary.time && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Preferred time</dt>
              <dd className="text-right font-medium text-foreground">
                {summary.time}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Confirmation to</dt>
            <dd className="truncate text-right font-medium text-foreground">
              {summary.email}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-md border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Submit another request
        </button>
        <p className="text-xs text-muted-foreground">
          Need to reach us sooner? Call{" "}
          <a
            href="tel:7802867773"
            className="font-medium text-primary hover:underline"
          >
            (780) 286-7773
          </a>
          .
        </p>
      </div>
    </div>
  );
}
