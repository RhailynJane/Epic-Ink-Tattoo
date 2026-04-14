import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assertAdminKey } from "./adminAuth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const record = await ctx.db.query("artistImage").order("desc").first();
    if (!record) return null;
    return {
      ...record,
      url: await ctx.storage.getUrl(record.storageId),
    };
  },
});

export const set = mutation({
  args: { adminKey: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);

    const existing = await ctx.db.query("artistImage").collect();
    for (const row of existing) {
      await ctx.storage.delete(row.storageId);
      await ctx.db.delete(row._id);
    }

    return ctx.db.insert("artistImage", {
      storageId: args.storageId,
      updatedAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    return await ctx.storage.generateUploadUrl();
  },
});
