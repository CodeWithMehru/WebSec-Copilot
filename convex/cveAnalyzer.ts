import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const analyzeCve = action({
  args: {
    scanId: v.id("scans"),
    cveId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const res = await fetch(`https://cveawg.mitre.org/api/cve/${args.cveId}`, {
        signal: AbortSignal.timeout(10000),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const cna = data?.containers?.cna;
        const title = cna?.title || `${args.cveId} Vulnerability`;
        const desc = cna?.descriptions?.[0]?.value || "No description provided by MITRE AWS.";
        const metrics = cna?.metrics?.[0]?.cvssV3_1;
        const baseScore = metrics?.baseScore || 5.0;
        const severity = baseScore >= 9.0 ? "critical" : baseScore >= 7.0 ? "high" : baseScore >= 4.0 ? "medium" : "low";

        await ctx.runMutation(api.findings.create, {
          scanId: args.scanId,
          title,
          description: desc,
          severity,
          category: "dependencies",
          source: "cve",
          confidence: 95,
          cveIds: [args.cveId],
          affectedComponent: cna?.affected?.[0]?.product || args.cveId,
          remediation: `Apply vendor patches for ${args.cveId}`,
          references: cna?.references?.map((r: { url: string }) => r.url)?.slice(0, 5) || [],
        });

        await ctx.runMutation(api.intelligence.create, {
          scanId: args.scanId,
          type: "cve",
          title: `${args.cveId}: ${title}`,
          summary: desc.substring(0, 500),
          url: `https://nvd.nist.gov/vuln/detail/${args.cveId}`,
          source: "mitre",
          severity,
          relatedCves: [args.cveId],
          tags: ["cve-lookup"],
        });
      } else {
        throw new Error(`MITRE API returned ${res.status}`);
      }
    } catch (e: any) {
      console.error("CVE Analyzer Error:", e);
      // Fallback finding so the user isn't stuck with 0 findings in CVE-only scans
      await ctx.runMutation(api.findings.create, {
        scanId: args.scanId,
        title: `Requested ${args.cveId}`,
        description: `CVE lookup failed: ${e.message}. Note: The CVE might be new, reserved, or invalid.`,
        severity: "info",
        category: "scanner-error",
        source: "cve",
        confidence: 100,
        cveIds: [args.cveId],
      });
    }
  },
});
