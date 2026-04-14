import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assertAdminKey } from "./adminAuth";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("siteContent").collect();
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[`${r.section}.${r.key}`] = r.value;
    }
    return map;
  },
});

export const set = mutation({
  args: {
    adminKey: v.string(),
    section: v.string(),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);

    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_section", (q) => q.eq("section", args.section))
      .collect();
    const match = existing.find((r) => r.key === args.key);

    if (match) {
      return ctx.db.patch(match._id, { value: args.value });
    }
    return ctx.db.insert("siteContent", {
      section: args.section,
      key: args.key,
      value: args.value,
    });
  },
});
