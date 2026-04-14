import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assertAdminKey } from "./adminAuth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db
      .query("gallery")
      .withIndex("by_order")
      .collect();
    return Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await ctx.storage.getUrl(image.storageId),
      }))
    );
  },
});

export const add = mutation({
  args: {
    adminKey: v.string(),
    title: v.string(),
    artist: v.string(),
    category: v.optional(v.string()),
    storageId: v.id("_storage"),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    const { adminKey: _adminKey, ...data } = args;

    const existing = await ctx.db.query("gallery").collect();
    const maxOrder = existing.length > 0
      ? Math.max(...existing.map((i) => i.order))
      : 0;

    return ctx.db.insert("gallery", {
      ...data,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("gallery"),
    title: v.optional(v.string()),
    artist: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);

    const updates: Record<string, string> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.artist !== undefined) updates.artist = args.artist;
    if (args.category !== undefined) updates.category = args.category;

    return ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("gallery") },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);

    const image = await ctx.db.get(args.id);
    if (image) {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(args.id);
    }
  },
});

export const generateUploadUrl = mutation({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    return await ctx.storage.generateUploadUrl();
  },
});
