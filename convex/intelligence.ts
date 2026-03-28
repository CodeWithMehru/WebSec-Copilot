import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByScan = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    return await ctx.db.query("intelligence").withIndex("by_scan", (q) => q.eq("scanId", args.scanId)).collect();
  },
});

export const get = query({
  args: { id: v.id("intelligence") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    scanId: v.id("scans"),
    type: v.string(),
    title: v.string(),
    summary: v.string(),
    url: v.optional(v.string()),
    source: v.string(),
    severity: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    relatedCves: v.optional(v.array(v.string())),
    relatedFindings: v.optional(v.array(v.string())),
    packageName: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    raw: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("intelligence", args);
  },
});

export const createBatch = mutation({
  args: {
    items: v.array(v.object({
      scanId: v.id("scans"),
      type: v.string(),
      title: v.string(),
      summary: v.string(),
      url: v.optional(v.string()),
      source: v.string(),
      severity: v.optional(v.string()),
      publishedAt: v.optional(v.string()),
      relatedCves: v.optional(v.array(v.string())),
      packageName: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const item of args.items) {
      const id = await ctx.db.insert("intelligence", item);
      ids.push(id);
    }
    return ids;
  },
});
