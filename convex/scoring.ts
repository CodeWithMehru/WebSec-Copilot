import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const calculateScore = mutation({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("findings")
      .withIndex("by_scan", (q) => q.eq("scanId", args.scanId))
      .collect();

    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let info = 0;

    for (const f of findings) {
      switch (f.severity) {
        case "critical":
          critical++;
          break;
        case "high":
          high++;
          break;
        case "medium":
          medium++;
          break;
        case "low":
          low++;
          break;
        default:
          info++;
          break;
      }
    }

    const deductions =
      critical * 30 +
      high * 18 +
      medium * 10 +
      low * 4;

    const overallScore = Math.max(0, 100 - deductions);

    const threatLevel =
      critical > 0 ? "critical" :
      high > 0 ? "high" :
      medium > 0 ? "medium" :
      low > 0 ? "low" :
      "safe";

    const summary = {
      totalFindings: findings.length,
      critical,
      high,
      medium,
      low,
      info,
      overallScore,
      threatLevel,
    };

    await ctx.db.patch(args.scanId, {
      status: "completed",
      phase: "done",
      progress: 100,
      message: "Scan completed",
      summary,
      completedAt: Date.now(),
    });

    return summary;
  },
});