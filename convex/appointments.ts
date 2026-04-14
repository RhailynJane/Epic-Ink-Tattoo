import { v } from "convex/values";
import { query, mutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { assertAdminKey } from "./adminAuth";

export const list = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    return ctx.db.query("appointments").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    email: v.string(),
    date: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("appointments", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.appointments.sendNotificationEmail, args);

    return id;
  },
});

export const sendNotificationEmail = internalAction({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    email: v.string(),
    date: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const to = process.env.BOOKING_NOTIFICATION_EMAIL ?? "epicinktattoo.ca@gmail.com";
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.warn(
        "BREVO_API_KEY not set — skipping email notification. " +
          "Set it via `npx convex env set BREVO_API_KEY <key>` to enable."
      );
      return { sent: false, reason: "missing_api_key" };
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL ?? to;
    const senderName = process.env.BREVO_SENDER_NAME ?? "Epic Ink Tattoo Bookings";

    const escape = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const subject = `New Appointment Request — ${args.firstName} ${args.lastName}`;
    const htmlContent = `
      <h2 style="font-family:Georgia,serif;">New Appointment Request</h2>
      <p><strong>Name:</strong> ${escape(args.firstName)} ${escape(args.lastName)}</p>
      <p><strong>Email:</strong> ${escape(args.email)}</p>
      <p><strong>Phone:</strong> ${escape(args.phone || "(not provided)")}</p>
      <p><strong>Requested date:</strong> ${escape(args.date)}</p>
      <p><strong>Message:</strong><br/>${escape(args.message ?? "(none)").replace(/\n/g, "<br/>")}</p>
    `;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        replyTo: { email: args.email, name: `${args.firstName} ${args.lastName}` },
        subject,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Brevo send error:", res.status, text);
      return { sent: false, reason: "send_failed", status: res.status };
    }

    return { sent: true };
  },
});

export const updateStatus = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("appointments"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    return ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("appointments") },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
