import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByScan = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    const remediations = await ctx.db
      .query("remediations")
      .withIndex("by_scan", (q) => q.eq("scanId", args.scanId))
      .collect();

    const enriched = [];

    for (const item of remediations) {
      const finding = await ctx.db.get(item.findingId);
      enriched.push({
        ...item,
        finding: finding ?? null,
      });
    }

    return enriched;
  },
});

export const get = query({
  args: { id: v.id("remediations") },
  handler: async (ctx, args) => {
    const remediation = await ctx.db.get(args.id);
    if (!remediation) return null;

    const finding = await ctx.db.get(remediation.findingId);

    return {
      ...remediation,
      finding: finding ?? null,
    };
  },
});

export const create = mutation({
  args: {
    scanId: v.id("scans"),
    findingId: v.id("findings"),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    priority: v.string(),
    fixSuggestion: v.string(),
    saferCode: v.optional(v.string()),
    effort: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("remediations", args);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("remediations"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});