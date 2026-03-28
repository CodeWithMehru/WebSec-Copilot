import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").order("desc").take(50);
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    inputs: v.object({
      websiteUrl: v.optional(v.string()),
      githubUrl: v.optional(v.string()),
      domain: v.optional(v.string()),
      cveId: v.optional(v.string()),
      packageName: v.optional(v.string()),
      codeSnippet: v.optional(v.string()),
    }),
    stack: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      name: args.name,
      inputs: args.inputs,
      stack: args.stack,
      createdAt: Date.now(),
    });
  },
});
