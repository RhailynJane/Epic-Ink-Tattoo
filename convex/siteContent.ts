import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
  args: { section: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("siteContent")
      .withIndex("by_section", (q) => q.eq("section", args.section))
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("siteContent").collect();
  },
});

export const upsert = mutation({
  args: {
    section: v.string(),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_section", (q) => q.eq("section", args.section))
      .collect();

    const match = existing.find((item) => item.key === args.key);

    if (match) {
      return ctx.db.patch(match._id, { value: args.value });
    } else {
      return ctx.db.insert("siteContent", args);
    }
  },
});
