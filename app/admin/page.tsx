"use client";

import { ImageIcon, MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const stats = [
  {
    title: "Gallery Images",
    value: "6",
    description: "Total images in gallery",
    icon: ImageIcon,
    href: "/admin/gallery",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Reviews",
    value: "3",
    description: "Approved reviews displayed",
    icon: MessageSquare,
    href: "/admin/reviews",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  {
    title: "Appointments",
    value: "3",
    description: "Total bookings",
    icon: Calendar,
    href: "/admin/appointments",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    title: "Site Views",
    value: "--",
    description: "Connect analytics to track",
    icon: TrendingUp,
    href: "/admin",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to Epic Ink Tattoo admin panel. Manage your gallery, reviews,
          and appointments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="border-border bg-card transition-all hover:bg-muted hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-foreground">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link
              href="/admin/gallery"
              className="flex items-center gap-3 rounded-lg border border-border p-4 text-foreground transition-all hover:bg-muted hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Upload Gallery Images</p>
                <p className="text-sm text-muted-foreground">
                  Add new tattoo photos to your portfolio
                </p>
              </div>
            </Link>
            <Link
              href="/admin/reviews"
              className="flex items-center gap-3 rounded-lg border border-border p-4 text-foreground transition-all hover:bg-muted hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Manage Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Approve or reject customer feedback
                </p>
              </div>
            </Link>
            <Link
              href="/admin/appointments"
              className="flex items-center gap-3 rounded-lg border border-border p-4 text-foreground transition-all hover:bg-muted hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-400/10">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">View Appointments</p>
                <p className="text-sm text-muted-foreground">
                  Check and manage upcoming bookings
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-foreground">
              Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-foreground/80">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">Set up Convex</p>
                <p className="text-muted-foreground">
                  Run{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    npx convex dev
                  </code>{" "}
                  to initialize your Convex backend and get your deployment URL.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Configure Clerk Auth
                </p>
                <p className="text-muted-foreground">
                  Create a Clerk application, set up a JWT template for Convex,
                  and add your API keys.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Add Environment Variables
                </p>
                <p className="text-muted-foreground">
                  Set NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
                  CLERK_SECRET_KEY, and CLERK_JWT_ISSUER_DOMAIN in your project
                  settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
