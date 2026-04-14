import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assertAdminKey } from "./adminAuth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("instagramEmbeds").withIndex("by_order").collect();
  },
});

export const add = mutation({
  args: { adminKey: v.string(), url: v.string() },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    const existing = await ctx.db.query("instagramEmbeds").collect();
    const maxOrder =
      existing.length > 0 ? Math.max(...existing.map((i) => i.order)) : 0;
    return ctx.db.insert("instagramEmbeds", {
      url: args.url,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("instagramEmbeds") },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("instagramEmbeds"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    await ctx.db.patch(args.id, { order: args.order });
  },
});
