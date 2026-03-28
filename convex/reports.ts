import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    scanId: v.id("scans"),
    title: v.string(),
    executiveSummary: v.string(),
    status: v.string(),
    format: v.string(),
    sections: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
        type: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      scanId: args.scanId,
      title: args.title,
      executiveSummary: args.executiveSummary,
      generatedAt: Date.now(),
      status: args.status,
      format: args.format,
      sections: args.sections,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const get = query({
  args: {
    id: v.id("reports"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const removeAll = mutation({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").collect();
    for (const r of reports) {
      await ctx.db.delete(r._id);
    }
  },
});