// convex/auditHelpers.ts
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

function cleanText(value: string | undefined, fallback: string) {
  if (!value || !value.trim()) return fallback;
  return value.trim();
}

export const createScan = internalMutation({
  args: {
    projectId: v.id("projects"),
    sources: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scans", {
      projectId: args.projectId,
      status: "running",
      phase: "init",
      progress: 10,
      message: "Starting security scan...",
      sources: args.sources,
      startedAt: Date.now(),
      completedAt: undefined,
      summary: undefined,
    });
  },
});

export const attachAiExplanations = internalMutation({
  args: {
    explanations: v.array(
      v.object({
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
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.explanations) {
      await ctx.db.patch(item.findingId, {
        aiExplanation: item.aiExplanation,
      });
    }
  },
});

export const generateRemediations = internalMutation({
  args: {
    scanId: v.id("scans"),
  },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("findings")
      .withIndex("by_scan", (q) => q.eq("scanId", args.scanId))
      .collect();

    const effortMap: Record<string, "minimal" | "moderate" | "significant"> = {
      headers: "minimal",
      cookies: "minimal",
      secrets: "minimal",
      dependencies: "minimal",
      "code-pattern": "moderate",
      "input-validation": "moderate",
      auth: "moderate",
      config: "minimal",
      tls: "minimal",
      "scanner-error": "minimal",
      cve: "moderate",
      repo: "moderate",
      runtime: "minimal",
      package: "moderate",
      snippet: "minimal",
      misconfig: "minimal",
    };

    for (const f of findings) {
      const existing = await ctx.db
        .query("remediations")
        .withIndex("by_finding", (q) => q.eq("findingId", f._id))
        .first();

      const ai = f.aiExplanation;

      const priority =
        f.severity === "critical"
          ? "critical"
          : f.severity === "high"
          ? "high"
          : f.severity === "medium"
          ? "medium"
          : f.severity === "low"
          ? "low"
          : "info";

      const description = cleanText(ai?.whatHappened, f.description || `Security issue detected: ${f.title}`);
      const fixSuggestion = cleanText(ai?.fixRecommendation, f.remediation || `Review and fix: ${f.title}`);
      const saferCode = cleanText(ai?.saferExample, "");

      const effort = effortMap[f.category] ?? "moderate";

      const remediationPayload = {
        scanId: args.scanId,
        findingId: f._id,
        title: `Fix: ${f.title}`,
        description,
        priority,
        fixSuggestion,
        saferCode: saferCode || undefined,
        effort,
        category: f.category,
      };

      if (existing) {
        await ctx.db.patch(existing._id, remediationPayload);
      } else {
        await ctx.db.insert("remediations", {
          ...remediationPayload,
          status: "pending",
        });
      }
    }
  },
});
