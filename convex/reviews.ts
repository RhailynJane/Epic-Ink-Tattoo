import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assertAdminKey } from "./adminAuth";

export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .collect();
  },
});

export const listAll = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    return ctx.db.query("reviews").order("desc").collect();
  },
});

export const submit = mutation({
  args: {
    customerName: v.string(),
    text: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("reviews", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("reviews"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    return ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("reviews") },
  handler: async (ctx, args) => {
    assertAdminKey(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
