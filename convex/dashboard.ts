import { v } from "convex/values";
import { query } from "./_generated/server";
import { assertAdminKey } from "./adminAuth";

export const stats = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);

    const [gallery, reviews, appointments] = await Promise.all([
      ctx.db.query("gallery").collect(),
      ctx.db.query("reviews").collect(),
      ctx.db.query("appointments").collect(),
    ]);

    const todayISO = new Date().toISOString().slice(0, 10);

    const recent = [...appointments]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((a) => ({
        id: a._id as unknown as string,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        date: a.date,
        time: a.time ?? null,
        status: a.status,
        createdAt: a.createdAt,
      }));

    return {
      gallery: {
        total: gallery.length,
        images: gallery.filter((g) => g.mediaType !== "video").length,
        videos: gallery.filter((g) => g.mediaType === "video").length,
      },
      reviews: {
        total: reviews.length,
        pending: reviews.filter((r) => r.status === "pending").length,
        approved: reviews.filter((r) => r.status === "approved").length,
      },
      appointments: {
        total: appointments.length,
        pending: appointments.filter((a) => a.status === "pending").length,
        upcoming: appointments.filter(
          (a) =>
            a.status !== "cancelled" &&
            a.status !== "completed" &&
            a.date >= todayISO
        ).length,
        recent,
      },
    };
  },
});
