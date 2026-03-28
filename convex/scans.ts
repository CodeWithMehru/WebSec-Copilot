import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("scans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.query("scans").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).order("desc").take(20);
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("scans").order("desc").take(20);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    sources: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scans", {
      projectId: args.projectId,
      status: "pending",
      phase: "init",
      progress: 0,
      message: "Initializing scan...",
      sources: args.sources,
      startedAt: Date.now(),
    });
  },
});

export const updateProgress = mutation({
  args: {
    id: v.id("scans"),
    status: v.string(),
    phase: v.string(),
    progress: v.number(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      phase: args.phase,
      progress: args.progress,
      message: args.message,
    });
  },
});

export const complete = mutation({
  args: {
    id: v.id("scans"),
    summary: v.object({
      totalFindings: v.number(),
      critical: v.number(),
      high: v.number(),
      medium: v.number(),
      low: v.number(),
      info: v.number(),
      overallScore: v.number(),
      threatLevel: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      phase: "done",
      progress: 100,
      message: "Scan completed",
      summary: args.summary,
      completedAt: Date.now(),
    });
  },
});
