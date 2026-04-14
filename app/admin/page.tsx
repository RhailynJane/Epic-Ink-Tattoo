"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ImageIcon,
  MessageSquare,
  Calendar,
  Wand2,
  ArrowUpRight,
  CircleAlert,
  Clock,
  Film,
  Sparkles,
  Loader2,
} from "lucide-react";

interface RecentAppointment {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  date: string;
  time: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: number;
}

interface Stats {
  gallery: { total: number; images: number; videos: number };
  reviews: { total: number; pending: number; approved: number };
  appointments: {
    total: number;
    pending: number;
    upcoming: number;
    recent: RecentAppointment[];
  };
}

const statusClasses: Record<RecentAppointment["status"], string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  confirmed: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-300",
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return d;
  const date = new Date(Date.UTC(y, m - 1, day));
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/dashboard")
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load dashboard (${r.status}).`);
        return r.json();
      })
      .then((data) => alive && setStats(data))
      .catch((e: unknown) =>
        alive && setError(e instanceof Error ? e.message : "Failed to load.")
      );
    return () => {
      alive = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, oklch(0.75 0.12 85) 0%, transparent 45%), radial-gradient(circle at 15% 80%, oklch(0.75 0.12 85) 0%, transparent 45%)",
          }}
        />
        <div className="relative flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary/80">
            {today}
          </p>
          <h1 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
            {greeting}, <span className="italic text-primary">Eman.</span>
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Here&rsquo;s what&rsquo;s happening at Epic Ink Tattoo today.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/site-editor"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Open Site Editor
            </Link>
            <Link
              href="/admin/gallery"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Manage Gallery
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              View live site
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats && (stats.appointments.pending > 0 || stats.reviews.pending > 0) && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-medium text-amber-100">
                Needs your attention
              </p>
              <p className="text-xs text-amber-200/70">
                {stats.appointments.pending > 0 && (
                  <>
                    {stats.appointments.pending} appointment
                    {stats.appointments.pending === 1 ? "" : "s"} awaiting
                    confirmation
                  </>
                )}
                {stats.appointments.pending > 0 && stats.reviews.pending > 0 && (
                  <> · </>
                )}
                {stats.reviews.pending > 0 && (
                  <>
                    {stats.reviews.pending} review
                    {stats.reviews.pending === 1 ? "" : "s"} pending approval
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {stats.appointments.pending > 0 && (
              <Link
                href="/admin/appointments"
                className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/20"
              >
                Review appointments
              </Link>
            )}
            {stats.reviews.pending > 0 && (
              <Link
                href="/admin/reviews"
                className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/20"
              >
                Review reviews
              </Link>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stat grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Gallery"
          value={stats?.gallery.total}
          hint={
            stats
              ? `${stats.gallery.images} image${stats.gallery.images === 1 ? "" : "s"} · ${stats.gallery.videos} video${stats.gallery.videos === 1 ? "" : "s"}`
              : ""
          }
          icon={ImageIcon}
          accent="text-primary"
          accentBg="bg-primary/10"
          href="/admin/gallery"
        />
        <StatCard
          title="Upcoming appointments"
          value={stats?.appointments.upcoming}
          hint={
            stats
              ? `${stats.appointments.total} total · ${stats.appointments.pending} pending`
              : ""
          }
          icon={Calendar}
          accent="text-blue-300"
          accentBg="bg-blue-400/10"
          href="/admin/appointments"
        />
        <StatCard
          title="Reviews"
          value={stats?.reviews.approved}
          hint={
            stats
              ? `${stats.reviews.total} total · ${stats.reviews.pending} pending`
              : ""
          }
          icon={MessageSquare}
          accent="text-emerald-300"
          accentBg="bg-emerald-400/10"
          href="/admin/reviews"
        />
        <StatCard
          title="Video posts"
          value={stats?.gallery.videos}
          hint={stats ? "In your portfolio" : ""}
          icon={Film}
          accent="text-amber-300"
          accentBg="bg-amber-400/10"
          href="/admin/gallery"
        />
      </div>

      {/* Two-column content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent appointments */}
        <section className="rounded-2xl border border-border bg-card lg:col-span-3">
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Recent appointment requests
              </h2>
              <p className="text-xs text-muted-foreground">
                Newest five submissions
              </p>
            </div>
            <Link
              href="/admin/appointments"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </header>

          <div className="flex flex-col divide-y divide-border">
            {!stats && !error && (
              <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            {stats?.appointments.recent.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No appointment requests yet.
              </div>
            )}
            {stats?.appointments.recent.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.email}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/80">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(a.date)}
                    {a.time ? ` · ${a.time}` : ""}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${statusClasses[a.status]}`}
                  >
                    {a.status}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {timeAgo(a.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-border bg-card lg:col-span-2">
          <header className="border-b border-border px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Quick actions
            </h2>
            <p className="text-xs text-muted-foreground">
              Common tasks at a glance
            </p>
          </header>
          <div className="flex flex-col gap-2 p-3">
            <ActionRow
              href="/site-editor"
              title="Edit site content"
              description="Text, artist image, FAQ"
              icon={Wand2}
              accentBg="bg-primary/10"
              accent="text-primary"
            />
            <ActionRow
              href="/admin/gallery"
              title="Upload media"
              description="Drag & drop images or videos"
              icon={ImageIcon}
              accentBg="bg-primary/10"
              accent="text-primary"
            />
            <ActionRow
              href="/admin/appointments"
              title="Review appointments"
              description="Confirm, complete, or cancel"
              icon={Calendar}
              accentBg="bg-blue-400/10"
              accent="text-blue-300"
            />
            <ActionRow
              href="/admin/reviews"
              title="Moderate reviews"
              description="Approve or reject feedback"
              icon={MessageSquare}
              accentBg="bg-emerald-400/10"
              accent="text-emerald-300"
            />
            <div className="mt-2 rounded-xl bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-foreground">Tip</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                The Site Editor lets you edit text and the artist photo directly
                on the live layout — no forms.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  accent,
  accentBg,
  href,
}: {
  title: string;
  value: number | undefined;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  accentBg: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {title}
          </p>
          <div className="mt-3 font-serif text-4xl font-semibold text-foreground">
            {value === undefined ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" />
            ) : (
              value
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{hint || "—"}</p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentBg}`}
        >
          <Icon className={`h-4 w-4 ${accent}`} />
        </div>
      </div>
      <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function ActionRow({
  href,
  title,
  description,
  icon: Icon,
  accent,
  accentBg,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  accentBg: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentBg}`}
      >
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
