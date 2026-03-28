import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByScan = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("findings")
      .withIndex("by_scan", (q) => q.eq("scanId", args.scanId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("findings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    scanId: v.id("scans"),
    title: v.string(),
    description: v.string(),
    severity: v.string(),
    category: v.string(),
    source: v.string(),
    evidence: v.optional(
      v.object({
        type: v.string(),
        raw: v.string(),
        location: v.optional(v.string()),
        lineNumber: v.optional(v.number()),
        context: v.optional(v.string()),
      })
    ),
    aiExplanation: v.optional(
      v.object({
        whatHappened: v.string(),
        whyItHappened: v.string(),
        exploitability: v.string(),
        attackerPerspective: v.string(),
        impact: v.string(),
        fixRecommendation: v.string(),
        saferExample: v.optional(v.string()),
        stackGuidance: v.optional(v.string()),
        sources: v.optional(v.array(v.string())),
      })
    ),
    cveIds: v.optional(v.array(v.string())),
    affectedComponent: v.optional(v.string()),
    confidence: v.number(),
    remediation: v.optional(v.string()),
    references: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("findings", args);
  },
});

export const createBatch = mutation({
  args: {
    findings: v.array(
      v.object({
        scanId: v.id("scans"),
        title: v.string(),
        description: v.string(),
        severity: v.string(),
        category: v.string(),
        source: v.string(),
        evidence: v.optional(
          v.object({
            type: v.string(),
            raw: v.string(),
            location: v.optional(v.string()),
            lineNumber: v.optional(v.number()),
            context: v.optional(v.string()),
          })
        ),
        aiExplanation: v.optional(
          v.object({
            whatHappened: v.string(),
            whyItHappened: v.string(),
            exploitability: v.string(),
            attackerPerspective: v.string(),
            impact: v.string(),
            fixRecommendation: v.string(),
            saferExample: v.optional(v.string()),
            stackGuidance: v.optional(v.string()),
            sources: v.optional(v.array(v.string())),
          })
        ),
        cveIds: v.optional(v.array(v.string())),
        affectedComponent: v.optional(v.string()),
        confidence: v.number(),
        remediation: v.optional(v.string()),
        references: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const finding of args.findings) {
      const id = await ctx.db.insert("findings", finding);
      ids.push(id);
    }
    return ids;
  },
});

export const attachAiExplanation = mutation({
  args: {
    findingId: v.id("findings"),
    aiExplanation: v.object({
      whatHappened: v.string(),
      whyItHappened: v.string(),
      exploitability: v.string(),
      attackerPerspective: v.string(),
      impact: v.string(),
      fixRecommendation: v.string(),
      saferExample: v.optional(v.string()),
      stackGuidance: v.optional(v.string()),
      sources: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.findingId, {
      aiExplanation: args.aiExplanation,
    });
  },
});