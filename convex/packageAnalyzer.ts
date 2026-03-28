import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type VulnerabilityJson = {
  cve_id?: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "none";
  description: string;
  impact: string;
};

type AnalysisOutput = {
  package_name: string;
  version: string;
  is_corrected: boolean;
  vulnerable: boolean;
  severity: "critical" | "high" | "medium" | "low" | "none";
  summary: string;
  vulnerabilities: VulnerabilityJson[];
};

export const analyzePackage = action({
  args: {
    scanId: v.id("scans"),
    packageName: v.string(),
  },
  handler: async (ctx, args) => {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      console.error("Missing GROQ_API_KEY");
      return;
    }

    async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response | null> {
      for (let i = 0; i <= maxRetries; i++) {
        try {
          const res = await fetch(url, options);
          if (res.status === 429 || res.status === 413) {
            if (i === maxRetries) return res;
            const delay = Math.pow(2, i) * 1500 + Math.random() * 500;
            console.warn(`[Package Analyzer] Rate limited (${res.status}). Retrying in ${Math.round(delay)}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          return res;
        } catch (err) {
          if (i === maxRetries) throw err;
          const delay = Math.pow(2, i) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      return null;
    }

    function extractJsonObject(text: string): string | null {
      const trimmed = text.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
      const firstBrace = trimmed.indexOf("{");
      const lastBrace = trimmed.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1);
      }
      return null;
    }

    try {
      // --- REGISTRY LOOKUP & AUTO-CORRECTION PREPARATIONS ---
      // We don't fetch registry here anymore as we want universal ecosystem support via AI + Exa Research
      
      // --- STEP 1: AUTHORITATIVE RESEARCH (Exa) ---
      console.log(`[Package Analyzer] Researching authoritative advisories for ${args.packageName}...`);
      const researchQuery = `site:github.com/advisories OR site:nvd.nist.gov OR site:snyk.io "${args.packageName}" vulnerability advisory CVE`;
      
      const research = await ctx.runAction(api.exa.searchVulnerabilities, {
        scanId: args.scanId,
        query: researchQuery,
      });

      const researchSnippets = research
        ?.map((r: any) => `Source: ${r.url}\nTitle: ${r.title}\nContent: ${r.text?.substring(0, 800)}`)
        .join("\n\n---\n\n") || "No authoritative research found.";

      // --- STEP 2: RESEARCH-INFORMD AI EXTRACTION (Groq) ---
      const systemPrompt = `
You are a world-class cybersecurity vulnerability intelligence engine.

Your task is to analyze a given package name and provide real-world vulnerability intelligence based ONLY on the provided research snippets.

STRICT RULES:
1. Use the provided RESEARCH SNIPPETS as your source of truth.
2. If the snippets confirm a package is vulnerable at the specific version, map the exact CVE IDs and details.
3. Automatically correct the package name using the research evidence (e.g., "loadash" -> "lodash").
4. If the snippets don't show critical vulnerabilities for this exact version, report "vulnerable": false.
5. NEVER hallucinate fake CVEs.
6. Return valid JSON only.

OUTPUT FORMAT (STRICT JSON):
{
  "package_name": "corrected-package-name",
  "version": "detected version",
  "is_corrected": true/false,
  "vulnerable": true/false,
  "severity": "critical/high/medium/low/none",
  "summary": "short explanation",
  "vulnerabilities": [
    {
      "cve_id": "CVE-XXXX-XXXX",
      "title": "vulnerability name",
      "severity": "critical/high/medium/low",
      "description": "what is the issue",
      "impact": "real world impact"
    }
  ]
}

IMPORTANT:
- Example: "lodash@4.17.20" should return "CVE-2021-23337" and "Prototype Pollution".
- Do not add random AWS or GraphQL results if they aren't in the research.
`.trim();

      const userPrompt = `
INPUT PACKAGE: ${args.packageName}

RESEARCH SNIPPETS:
${researchSnippets}
`.trim();

      const res = await fetchWithRetry("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          max_tokens: 1500,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!res || !res.ok) {
        throw new Error(`Groq API failure: ${res?.status}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      
      const jsonText = content ? extractJsonObject(content) : null;
      if (!jsonText) throw new Error("Could not extract JSON from Groq response");

      const analysis: AnalysisOutput = JSON.parse(jsonText);

      // Create findings for vulnerabilities
      if (analysis.vulnerable && analysis.vulnerabilities?.length > 0) {
        for (const vuln of analysis.vulnerabilities) {
          await ctx.runMutation(api.findings.create, {
            scanId: args.scanId,
            title: vuln.title,
            description: vuln.description,
            severity: vuln.severity === "none" ? "info" : vuln.severity,
            category: "dependencies",
            source: "package",
            confidence: analysis.is_corrected ? 80 : 95,
            affectedComponent: `${analysis.package_name}@${analysis.version}`,
            remediation: `Review the vulnerability report and update the package to a secure version.`,
          });
        }
      } else if (analysis.vulnerable && (!analysis.vulnerabilities || analysis.vulnerabilities.length === 0)) {
         await ctx.runMutation(api.findings.create, {
            scanId: args.scanId,
            title: `Vulnerable Package: ${analysis.package_name}`,
            description: analysis.summary || "This package is known to be vulnerable in the identified version.",
            severity: analysis.severity === "none" ? "info" : analysis.severity,
            category: "dependencies",
            source: "package",
            confidence: 80,
            affectedComponent: `${analysis.package_name}@${analysis.version}`,
          });
      }

      const cves = analysis.vulnerabilities?.map((v) => v.cve_id).filter(Boolean) as string[];

      // Log intelligence
      await ctx.runMutation(api.intelligence.create, {
        scanId: args.scanId,
        type: "research",
        title: `Package Intelligence: ${analysis.package_name}@${analysis.version}`,
        summary: analysis.summary || "Analyzed package threat profile.",
        url: `https://www.npmjs.com/package/${analysis.package_name}`, 
        source: "groq-ai",
        packageName: analysis.package_name,
        severity: analysis.severity === "none" ? undefined : analysis.severity,
        relatedCves: cves.length > 0 ? cves : undefined,
        tags: [
          "ai-analysis", 
          analysis.is_corrected ? "auto-corrected" : "direct-match",
          ...cves
        ].filter(Boolean) as string[],
      });

    } catch (e: any) {
      console.error("Package Analyzer AI Error:", e);
      // Fallback
      await ctx.runMutation(api.findings.create, {
        scanId: args.scanId,
        title: `Package Analysis Failed: ${args.packageName}`,
        description: `AI analysis failed: ${e.message}`,
        severity: "info",
        category: "scanner-error",
        source: "package",
        confidence: 100,
      });
    }
  },
});

