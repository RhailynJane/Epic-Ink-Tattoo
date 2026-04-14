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
        timeZone: "UTC",
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
          siteUrl: process.env.PUBLIC_SITE_URL ?? "https://epic-ink-tattoo.vercel.app",
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
    const siteUrl = process.env.PUBLIC_SITE_URL ?? "https://epic-ink-tattoo.vercel.app";

    const prettyDate = (() => {
      const parts = args.date.split("-").map(Number);
      if (parts.length !== 3) return args.date;
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      return d.toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    })();

    const fallbackBody = {
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

    let customerSent = false;

    if (customerTemplateId) {
      const templateBody = {
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
      };

      const templateRes = await fetch(brevoEndpoint, {
        method: "POST",
        headers: brevoHeaders,
        body: JSON.stringify(templateBody),
      });

      if (templateRes.ok) {
        customerSent = true;
      } else {
        const errText = await templateRes.text();
        console.error(
          `Brevo template send failed (status ${templateRes.status}, templateId=${customerTemplateId}). Falling back to branded HTML.`,
          errText
        );
      }
    }

    if (!customerSent) {
      const fallbackRes = await fetch(brevoEndpoint, {
        method: "POST",
        headers: brevoHeaders,
        body: JSON.stringify(fallbackBody),
      });
      if (fallbackRes.ok) {
        customerSent = true;
      } else {
        const errText = await fallbackRes.text();
        console.error(
          `Brevo fallback send failed (status ${fallbackRes.status}) to ${args.email}.`,
          errText
        );
      }
    }

    return { adminSent: adminRes.ok, customerSent };
  },
});

function buildStatusUpdateHtml(p: {
  firstName: string;
  prettyDate: string;
  time?: string;
  status: "confirmed" | "completed" | "cancelled";
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

  const palette = {
    confirmed: {
      accent: "#1a6b4a",
      soft: "#e7f4ed",
      softBorder: "#c4e3d2",
      badge: "Confirmed",
    },
    completed: {
      accent: "#5c4a1c",
      soft: "#f6efd8",
      softBorder: "#e6decb",
      badge: "Completed",
    },
    cancelled: {
      accent: "#8a2e2e",
      soft: "#f9e7e7",
      softBorder: "#e9c7c7",
      badge: "Cancelled",
    },
  }[p.status];

  const headline = {
    confirmed: "Your appointment is confirmed",
    completed: "Thanks for your visit",
    cancelled: "Your appointment was cancelled",
  }[p.status];

  const body = {
    confirmed: `Hi <strong>${esc(p.firstName)}</strong>, we've locked in your session. Please arrive 10 minutes early, eat beforehand, and stay hydrated. If anything changes, reach out at least 24 hours in advance.`,
    completed: `Hi <strong>${esc(p.firstName)}</strong>, thanks for trusting us with your piece. Follow the aftercare instructions we shared in-studio closely — clean, moisturized, and out of direct sun is the rule of thumb for the next two weeks. We'd love to see it heal.`,
    cancelled: `Hi <strong>${esc(p.firstName)}</strong>, this is a confirmation that your appointment has been cancelled. Any deposit questions can be addressed by replying to this email. We'd love to rebook whenever you're ready.`,
  }[p.status];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${esc(headline)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f0e8;font-family:Georgia,'Times New Roman',serif;color:#1d1d1d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f0e8;">${esc(headline)} — ${esc(p.prettyDate)}${p.time ? " at " + esc(p.time) : ""}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f0e8;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:#1d1d1d;padding:36px 44px 28px;">
          <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#d8b56b;">Epic Ink Tattoo</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:normal;color:#ffffff;letter-spacing:-0.2px;">${esc(headline)}</h1>
          <p style="margin:14px 0 0;"><span style="display:inline-block;padding:5px 12px;border-radius:999px;background:${palette.accent};color:#ffffff;font-family:Georgia,serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${esc(palette.badge)}</span></p>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 44px 8px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:15px;color:#444;line-height:1.7;">${body}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 44px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${palette.soft};border:1px solid ${palette.softBorder};border-radius:10px;">
            <tr>
              <td style="padding:18px 28px 4px;">
                <p style="margin:0;font-family:Georgia,serif;font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:${palette.accent};">Session date</p>
                <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:15px;color:#1d1d1d;font-weight:600;">${esc(p.prettyDate)}${p.time ? ` · ${esc(p.time)}` : ""}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 18px;">
                <p style="margin:0;font-family:Georgia,serif;font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:${palette.accent};">Studio</p>
                <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:14px;color:#444;line-height:1.6;">${esc(p.studioLocation)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:22px 44px 10px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#555;line-height:1.7;">Questions? Reply to this email or reach us at <a href="mailto:${esc(p.supportEmail)}" style="color:${palette.accent};text-decoration:underline;">${esc(p.supportEmail)}</a> · <a href="tel:${esc(p.studioPhone.replace(/[^0-9+]/g, ""))}" style="color:${palette.accent};text-decoration:underline;">${esc(p.studioPhone)}</a>.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 44px 28px;text-align:center;">
          <a href="${esc(p.siteUrl)}" style="display:inline-block;font-family:Georgia,serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${palette.accent};text-decoration:none;">Epic Ink Tattoo — Balzac, AB</a>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

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

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Appointment not found.");

    await ctx.db.patch(args.id, { status: args.status });

    if (args.status !== "pending" && existing.status !== args.status) {
      await ctx.scheduler.runAfter(
        0,
        internal.appointments.sendStatusUpdateEmail,
        {
          firstName: existing.firstName,
          lastName: existing.lastName,
          email: existing.email,
          date: existing.date,
          time: existing.time,
          status: args.status,
        }
      );
    }

    return { ok: true };
  },
});

export const sendStatusUpdateEmail = internalAction({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    status: v.union(
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("pending")
    ),
  },
  handler: async (_ctx, args) => {
    if (args.status === "pending") return { sent: false, reason: "pending_status_no_email" };

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("BREVO_API_KEY not set — skipping status update email.");
      return { sent: false, reason: "missing_api_key" };
    }

    const to = process.env.BOOKING_NOTIFICATION_EMAIL ?? "epicinktattoo.ca@gmail.com";
    const senderEmail = process.env.BREVO_SENDER_EMAIL ?? to;
    const senderName = process.env.BREVO_SENDER_NAME ?? "Epic Ink Tattoo Bookings";
    const studioLocation =
      process.env.STUDIO_LOCATION ??
      "Unit A23, New Horizon Mall, 260300 Writing Creek Cres, Balzac, AB T4A 0X8";
    const studioPhone = process.env.STUDIO_PHONE ?? "(780) 286-7773";
    const siteUrl = process.env.PUBLIC_SITE_URL ?? "https://epic-ink-tattoo.vercel.app";

    const prettyDate = (() => {
      const parts = args.date.split("-").map(Number);
      if (parts.length !== 3) return args.date;
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      return d.toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    })();

    const subjectByStatus: Record<
      "confirmed" | "completed" | "cancelled",
      string
    > = {
      confirmed: "Your Epic Ink Tattoo appointment is confirmed",
      completed: "Thanks for visiting Epic Ink Tattoo",
      cancelled: "Your Epic Ink Tattoo appointment has been cancelled",
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [
          {
            email: args.email,
            name: `${args.firstName} ${args.lastName}`,
          },
        ],
        replyTo: { name: senderName, email: to },
        subject: subjectByStatus[args.status as "confirmed" | "completed" | "cancelled"],
        htmlContent: buildStatusUpdateHtml({
          firstName: args.firstName,
          prettyDate,
          time: args.time,
          status: args.status as "confirmed" | "completed" | "cancelled",
          studioLocation,
          studioPhone,
          supportEmail: to,
          siteUrl,
        }),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `Brevo status-update send failed (status ${res.status}) to ${args.email}:`,
        text
      );
      return { sent: false, reason: "send_failed", status: res.status };
    }

    return { sent: true };
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("appointments") },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
