import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  gallery: defineTable({
    title: v.string(),
    artist: v.string(),
    category: v.optional(v.string()),
    storageId: v.id("_storage"),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),

  reviews: defineTable({
    customerName: v.string(),
    text: v.string(),
    rating: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  appointments: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    email: v.string(),
    date: v.string(),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  }).index("by_status", ["status"]).index("by_date", ["date"]),

  siteContent: defineTable({
    section: v.string(),
    key: v.string(),
    value: v.string(),
  }).index("by_section", ["section"]),
});
