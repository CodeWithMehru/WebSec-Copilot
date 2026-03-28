import { query } from "./_generated/server";
import { v } from "convex/values";

export const getScanDashboard = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    const scan = await ctx.db.get(args.scanId);
    if (!scan) return null;

    const project = await ctx.db.get(scan.projectId);
    const findings = await ctx.db.query("findings").withIndex("by_scan", (q) => q.eq("scanId", args.scanId)).collect();
    const intelligence = await ctx.db.query("intelligence").withIndex("by_scan", (q) => q.eq("scanId", args.scanId)).collect();
    const remediations = await ctx.db.query("remediations").withIndex("by_scan", (q) => q.eq("scanId", args.scanId)).collect();
    const report = await ctx.db.query("reports").withIndex("by_scan", (q) => q.eq("scanId", args.scanId)).first();

    const categoryScores: Record<string, { total: number; findings: number }> = {};
    for (const f of findings) {
      if (!categoryScores[f.category]) categoryScores[f.category] = { total: 0, findings: 0 };
      categoryScores[f.category].findings++;
      const sev: Record<string, number> = { critical: 25, high: 15, medium: 8, low: 3, info: 0 };
      categoryScores[f.category].total += sev[f.severity] || 0;
    }

    const categories = Object.entries(categoryScores).map(([cat, data]) => ({
      category: cat,
      score: Math.max(0, 100 - data.total),
      findingCount: data.findings,
    }));

    const technologies = findings
      .filter(f => f.category === "technologies")
      .flatMap(f => f.affectedComponent?.split(", ") || [])
      .filter((v, i, a) => a.indexOf(v) === i);

    return {
      scan,
      project,
      findings,
      intelligence,
      remediations,
      report,
      categories,
      technologies,
    };
  },
});
