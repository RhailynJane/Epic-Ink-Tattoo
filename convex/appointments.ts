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
    time: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
      throw new Error("Invalid date format.");
    }
    const todayISO = new Date().toISOString().slice(0, 10);
    if (args.date < todayISO) {
      throw new Error("Appointment date cannot be in the past.");
    }
    if (args.time && !/^\d{2}:\d{2}$/.test(args.time)) {
      throw new Error("Invalid time format.");
    }

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
    time: v.optional(v.string()),
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

    const subject = `New Appointment Request — ${args.firstName} ${args.lastName}`;

    const brevoEndpoint = "https://api.brevo.com/v3/smtp/email";
    const brevoHeaders = {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    };

    const adminPrettyDate = (() => {
      const parts = args.date.split("-").map(Number);
      if (parts.length !== 3) return args.date;
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      return d.toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    })();

    // 1) Admin notification — branded HTML
    const adminRes = await fetch(brevoEndpoint, {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        replyTo: {
          email: args.email,
          name: `${args.firstName} ${args.lastName}`,
        },
        subject,
        htmlContent: buildAdminNotificationHtml({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone,
          prettyDate: adminPrettyDate,
          time: args.time,
          message: args.message,
          siteUrl: process.env.PUBLIC_SITE_URL ?? "https://epicinktattoo.ca",
        }),
      }),
    });

    if (!adminRes.ok) {
      const text = await adminRes.text();
      console.error("Brevo admin send error:", adminRes.status, text);
    }

    // 2) Customer confirmation — Brevo template if configured, otherwise fallback HTML
    const customerTemplateId = process.env.BREVO_CUSTOMER_TEMPLATE_ID;
    const studioLocation =
      process.env.STUDIO_LOCATION ??
      "Unit A23, New Horizon Mall, 260300 Writing Creek Cres, Balzac, AB T4A 0X8";
    const studioPhone = process.env.STUDIO_PHONE ?? "(780) 286-7773";
    const siteUrl = process.env.PUBLIC_SITE_URL ?? "https://epicinktattoo.ca";

    const prettyDate = (() => {
      const parts = args.date.split("-").map(Number);
      if (parts.length !== 3) return args.date;
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      return d.toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    })();

    const customerBody = customerTemplateId
      ? {
          sender: { name: senderName, email: senderEmail },
          to: [
            {
              email: args.email,
              name: `${args.firstName} ${args.lastName}`,
            },
          ],
          templateId: Number(customerTemplateId),
          params: {
            first_name: args.firstName,
            last_name: args.lastName,
            appointment_date: prettyDate,
            appointment_time: args.time ?? "To be confirmed",
            location: studioLocation,
            service_type: "Custom Tattoo Consultation",
            provider_name: "Eman",
            confirmation_link: siteUrl,
            reschedule_link: `${siteUrl}/#contact`,
            support_email: to,
            support_phone: studioPhone,
          },
        }
      : {
          sender: { name: senderName, email: senderEmail },
          to: [
            {
              email: args.email,
              name: `${args.firstName} ${args.lastName}`,
            },
          ],
          replyTo: { name: senderName, email: to },
          subject: "We received your appointment request — Epic Ink Tattoo",
          htmlContent: buildCustomerFallbackHtml({
            firstName: args.firstName,
            prettyDate,
            time: args.time,
            message: args.message,
            studioLocation,
            studioPhone,
            supportEmail: to,
            siteUrl,
          }),
        };

    const customerRes = await fetch(brevoEndpoint, {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify(customerBody),
    });

    if (!customerRes.ok) {
      const text = await customerRes.text();
      console.error(
        "Brevo customer send error:",
        customerRes.status,
        text
      );
    }

    return { adminSent: adminRes.ok, customerSent: customerRes.ok };
  },
});

function buildAdminNotificationHtml(p: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  prettyDate: string;
  time?: string;
  message?: string;
  siteUrl: string;
}): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const phoneDigits = p.phone.replace(/[^0-9+]/g, "");
  const row = (label: string, value: string, link?: string) => `
    <tr>
      <td style="padding:14px 28px 4px;vertical-align:top;">
        <p style="margin:0;font-family:Georgia,serif;font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:#8b8b8b;">${esc(label)}</p>
        <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:15px;color:#1d1d1d;line-height:1.5;font-weight:600;">
          ${link ? `<a href="${esc(link)}" style="color:#8b6f2f;text-decoration:none;">${esc(value)}</a>` : esc(value)}
        </p>
      </td>
    </tr>`;

  const messageBlock = p.message
    ? `
    <tr>
      <td style="padding:14px 28px 4px;">
        <p style="margin:0;font-family:Georgia,serif;font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:#8b8b8b;">Client message</p>
        <p style="margin:6px 0 0;padding:12px 14px;background:#fafaf6;border-left:3px solid #d8b56b;font-family:Georgia,serif;font-size:14px;color:#1d1d1d;line-height:1.7;">
          ${esc(p.message!).replace(/\n/g, "<br/>")}
        </p>
      </td>
    </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>New appointment request</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f0e8;font-family:Georgia,'Times New Roman',serif;color:#1d1d1d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f0e8;">New request from ${esc(p.firstName)} ${esc(p.lastName)} for ${esc(p.prettyDate)}${p.time ? " at " + esc(p.time) : ""}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f0e8;padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1d1d1d;padding:36px 44px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#d8b56b;">Epic Ink Tattoo — Admin</p>
                  <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:normal;color:#ffffff;letter-spacing:-0.2px;">New appointment request</h1>
                  <p style="margin:10px 0 0;font-family:Georgia,serif;font-size:13px;color:#c9c9c9;font-style:italic;">Review and confirm within 48 hours.</p>
                </td>
                <td align="right" style="vertical-align:top;">
                  <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#3a2a14;color:#d8b56b;font-family:Georgia,serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Pending</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 44px 8px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:#8b6f2f;">Client</p>
            <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:24px;color:#1d1d1d;font-weight:normal;">${esc(p.firstName)} ${esc(p.lastName)}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:12px 44px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ec;border:1px solid #e6decb;border-radius:10px;">
              ${row("Preferred date", p.prettyDate)}
              ${row("Preferred time", p.time ?? "Not specified")}
              ${row("Email", p.email, `mailto:${p.email}`)}
              ${row("Phone", p.phone || "Not provided", p.phone ? `tel:${phoneDigits}` : undefined)}
              ${messageBlock}
              <tr><td style="padding:16px 28px;"></td></tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:22px 44px 8px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:8px;background:#1d1d1d;">
                  <a href="${esc(p.siteUrl)}/admin/appointments" style="display:inline-block;padding:12px 28px;font-family:Georgia,serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.05em;">Open in Admin</a>
                </td>
                <td style="width:10px;"></td>
                <td style="border-radius:8px;border:1.5px solid #d8b56b;">
                  <a href="mailto:${esc(p.email)}" style="display:inline-block;padding:10.5px 28px;font-family:Georgia,serif;font-size:14px;font-weight:600;color:#8b6f2f;text-decoration:none;letter-spacing:0.05em;">Reply to client</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:22px 44px 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6efd8;border-left:4px solid #d8b56b;border-radius:6px;">
              <tr>
                <td style="padding:14px 20px;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:13px;color:#5c4a1c;line-height:1.6;"><strong>Reminder:</strong> Reply-to on this email is the client's address — you can reply directly to confirm.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 44px 28px;text-align:center;">
            <a href="${esc(p.siteUrl)}" style="display:inline-block;font-family:Georgia,serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8b6f2f;text-decoration:none;">Epic Ink Tattoo — Balzac, AB</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildCustomerFallbackHtml(p: {
  firstName: string;
  prettyDate: string;
  time?: string;
  message?: string;
  studioLocation: string;
  studioPhone: string;
  supportEmail: string;
  siteUrl: string;
}): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const messageRow = p.message
    ? `<tr><td style="padding: 8px 28px; vertical-align: top;"><p style="margin: 0; font-family: Georgia, serif; font-size: 13px; font-weight: 600; color: #8b8b8b; text-transform: uppercase; letter-spacing: 0.5px;">Your message</p><p style="margin: 6px 0 0; font-family: Georgia, serif; font-size: 14px; color: #1d1d1d; line-height: 1.6;">${esc(p.message).replace(/\n/g, "<br/>")}</p></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Appointment request received</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f0e8;font-family:Georgia, 'Times New Roman', serif;color:#1d1d1d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f0e8;">Your appointment request for ${esc(p.prettyDate)} was received. We'll reply within 48 hours.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f0e8;padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1d1d1d;padding:40px 44px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:#d8b56b;">Epic Ink Tattoo</p>
            <h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:normal;color:#ffffff;letter-spacing:-0.2px;">We received your request</h1>
            <p style="margin:12px 0 0;font-family:Georgia,serif;font-size:14px;color:#c9c9c9;font-style:italic;">You'll hear back within 48 hours.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:34px 44px 6px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:16px;color:#1d1d1d;">Hi <strong>${esc(p.firstName)}</strong>,</p>
            <p style="margin:12px 0 0;font-family:Georgia,serif;font-size:15px;color:#444;line-height:1.7;">Thanks for reaching out. Your appointment request has been received and is now being reviewed. We'll reply to confirm your session and share deposit details shortly.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 44px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ec;border:1px solid #e6decb;border-radius:10px;">
              <tr>
                <td style="padding:22px 28px 10px;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#8b6f2f;">Request summary</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px;"><div style="border-top:1px solid #eadfc4;"></div></td>
              </tr>
              <tr>
                <td style="padding:16px 28px 4px;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#8b8b8b;font-weight:600;">Preferred date</p>
                  <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:15px;color:#1d1d1d;font-weight:600;">${esc(p.prettyDate)}</p>
                </td>
              </tr>
              ${p.time ? `<tr><td style="padding:12px 28px 4px;"><p style="margin:0;font-family:Georgia,serif;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#8b8b8b;font-weight:600;">Preferred time</p><p style="margin:4px 0 0;font-family:Georgia,serif;font-size:15px;color:#1d1d1d;font-weight:600;">${esc(p.time)}</p></td></tr>` : ""}
              <tr>
                <td style="padding:12px 28px 4px;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#8b8b8b;font-weight:600;">Location</p>
                  <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:14px;color:#444;line-height:1.6;">${esc(p.studioLocation)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 28px 4px;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#8b8b8b;font-weight:600;">Artist</p>
                  <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:14px;color:#444;">Eman</p>
                </td>
              </tr>
              ${messageRow}
              <tr>
                <td style="padding:20px 28px;"></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 44px 4px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6efd8;border-left:4px solid #d8b56b;border-radius:6px;">
              <tr>
                <td style="padding:14px 20px;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:13px;color:#5c4a1c;line-height:1.6;"><strong>What's next:</strong> We'll review your request and email back to confirm the date, time, and any deposit details. Please arrive 10 minutes early on session day.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 44px 10px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#555;line-height:1.7;">Questions? Reply to this email or reach us at <a href="mailto:${esc(p.supportEmail)}" style="color:#8b6f2f;text-decoration:underline;">${esc(p.supportEmail)}</a> · <a href="tel:${esc(p.studioPhone.replace(/[^0-9+]/g, ""))}" style="color:#8b6f2f;text-decoration:underline;">${esc(p.studioPhone)}</a>.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 44px 28px;text-align:center;">
            <a href="${esc(p.siteUrl)}" style="display:inline-block;font-family:Georgia,serif;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#8b6f2f;text-decoration:none;">Epic Ink Tattoo — Balzac, AB</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

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
