"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\/+$/, "");
  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
  };
}

function getSafeHostname(input: string): string | null {
  try {
    return new URL(input).hostname;
  } catch {
    return null;
  }
}

function isValidWebsiteUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only HTTP/HTTPS protocols are allowed." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and internal IPs
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.")) {
      return { valid: false, error: "Internal or local addresses are not allowed." };
    }

    // TLD check: hostname must have at least one dot and a TLD (simple check)
    if (!hostname.includes(".") || hostname.split(".").pop()?.length! < 2) {
      return { valid: false, error: "Domain must have a valid TLD." };
    }

    // Path depth check: /user/repo is length 2, but we only want / or /path
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 1) {
      return { valid: false, error: "Please enter a valid website URL (not repository or code link)." };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: "Invalid target: Please enter a valid website URL (not repository or code link)." };
  }
}

function inferTargetType(args: {
  websiteUrl?: string;
  domain?: string;
  githubUrl?: string;
  codeSnippet?: string;
  cveId?: string;
  packageName?: string;
}): string {
  if (args.githubUrl?.trim()) return "repo";
  if (args.websiteUrl?.trim() || args.domain?.trim()) return "website";
  if (args.codeSnippet?.trim()) return "snippet";
  if (args.cveId?.trim()) return "cve";
  if (args.packageName?.trim()) return "package";
  return "unknown";
}

function buildStackHint(args: {
  sources: string[];
  githubUrl?: string;
  websiteUrl?: string;
  domain?: string;
  codeSnippet?: string;
  packageName?: string;
}): string {
  const hints: string[] = [];

  if (args.sources.includes("website")) hints.push("website/runtime target");
  if (args.sources.includes("github")) hints.push("github repository target");
  if (args.sources.includes("snippet")) hints.push("source code snippet target");
  if (args.sources.includes("package")) hints.push("package intelligence target");

  if (args.githubUrl?.toLowerCase().includes("next") || args.packageName?.toLowerCase().includes("next")) {
    hints.push("possible Next.js / React stack");
  }

  if (args.codeSnippet?.includes("express") || args.codeSnippet?.includes("app.use(")) {
    hints.push("possible Express / Node.js stack");
  }

  if (args.websiteUrl || args.domain) {
    hints.push("Web deployment (requires server config or framework-level middleware changes)");
  }

  return hints.join("; ");
}

export const runFullAudit = action({
  args: {
    projectId: v.id("projects"),
    sources: v.array(v.string()),
    inputs: v.object({
      websiteUrl: v.optional(v.string()),
      githubUrl: v.optional(v.string()),
      domain: v.optional(v.string()),
      cveId: v.optional(v.string()),
      packageName: v.optional(v.string()),
      codeSnippet: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args): Promise<Id<"scans">> => {
    const scanId: Id<"scans"> = await ctx.runMutation(
      internal.auditHelpers.createScan,
      {
        projectId: args.projectId,
        sources: args.sources,
      }
    );

    try {
      // --- STRICT WEBSITE URL VALIDATION ---
      if (args.sources.includes("website") && args.inputs.websiteUrl) {
        const validation = isValidWebsiteUrl(args.inputs.websiteUrl);
        if (!validation.valid) {
          const errorMessage = validation.error || "Invalid target: Please enter a valid website URL (not repository or code link).";
          await ctx.runMutation(api.scans.updateProgress, {
            id: scanId,
            status: "failed",
            phase: "error",
            progress: 100,
            message: errorMessage,
          });
          throw new Error(errorMessage);
        }
      }

      await ctx.runMutation(api.scans.updateProgress, {
        id: scanId,
        status: "running",
        phase: "validating",
        progress: 20,
        message: "Validating inputs...",
      });

      const runtimeUrl =
        args.inputs.websiteUrl?.trim() ||
        (args.inputs.domain?.trim()
          ? `https://${args.inputs.domain.trim()}`
          : undefined);

      const githubUrl = args.inputs.githubUrl?.trim();
      const codeSnippet = args.inputs.codeSnippet?.trim();
      const cveId = args.inputs.cveId?.trim();
      const packageName = args.inputs.packageName?.trim();

      const targetType = inferTargetType({
        websiteUrl: args.inputs.websiteUrl,
        domain: args.inputs.domain,
        githubUrl,
        codeSnippet,
        cveId,
        packageName,
      });

      const stackHint = buildStackHint({
        sources: args.sources,
        githubUrl,
        websiteUrl: args.inputs.websiteUrl,
        domain: args.inputs.domain,
        codeSnippet,
        packageName,
      });

      if (runtimeUrl) {
        await ctx.runMutation(api.scans.updateProgress, {
          id: scanId,
          status: "running",
          phase: "scanning",
          progress: 35,
          message: "Running runtime security scan...",
        });

        try {
          await ctx.runAction(api.runtimeScanner.scanRuntime, {
            scanId,
            url: runtimeUrl,
          });
        } catch (error) {
          console.error("Runtime scanner error:", error);
          await ctx.runMutation(api.findings.create, {
            scanId,
            title: "Runtime Scanner Error",
            description: `Runtime scan failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }. The target may be unreachable or blocking requests.`,
            severity: "info",
            category: "scanner-error",
            source: "runtime",
            confidence: 100,
          });
        }
      }

      if (githubUrl) {
        await ctx.runMutation(api.scans.updateProgress, {
          id: scanId,
          status: "running",
          phase: "scanning",
          progress: 50,
          message: "Running repository analysis...",
        });

        const parsed = parseGithubUrl(githubUrl);

        if (parsed) {
          try {
            await ctx.runAction(api.repoScanner.scanRepo, {
              scanId,
              owner: parsed.owner,
              repo: parsed.repo,
            });
          } catch (error) {
            console.error("Repo scanner error:", error);
            await ctx.runMutation(api.findings.create, {
              scanId,
              title: "Repository Scanner Error",
              description: `Repo scan failed: ${
                error instanceof Error ? error.message : "Unknown error"
              }. Check GitHub token and repository visibility.`,
              severity: "info",
              category: "scanner-error",
              source: "repo",
              confidence: 100,
            });
          }
        } else {
          await ctx.runMutation(api.findings.create, {
            scanId,
            title: "Invalid GitHub Repository URL",
            description:
              "The provided GitHub URL could not be parsed into owner/repository format.",
            severity: "info",
            category: "scanner-error",
            source: "repo",
            confidence: 100,
          });
        }
      }

      if (codeSnippet) {
        await ctx.runMutation(api.scans.updateProgress, {
          id: scanId,
          status: "running",
          phase: "scanning",
          progress: 60,
          message: "Analyzing code snippet...",
        });

        try {
          await ctx.runMutation(api.snippetScanner.scanSnippet, {
            scanId,
            code: codeSnippet,
          });
        } catch (error) {
          console.error("Snippet scanner error:", error);
          await ctx.runMutation(api.findings.create, {
            scanId,
            title: "Snippet Scanner Error",
            description: `Snippet analysis failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            severity: "info",
            category: "scanner-error",
            source: "snippet",
            confidence: 100,
          });
        }
      }

      if (cveId) {
        await ctx.runMutation(api.scans.updateProgress, {
          id: scanId,
          status: "running",
          phase: "enriching",
          progress: 70,
          message: "Analyzing CVE intelligence...",
        });

        try {
          await ctx.runAction(api.cveAnalyzer.analyzeCve, {
            scanId,
            cveId,
          });
        } catch (error) {
          console.error("CVE analyzer error:", error);
          await ctx.runMutation(api.findings.create, {
            scanId,
            title: "CVE Lookup Error",
            description: `CVE lookup failed for ${cveId}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            severity: "info",
            category: "scanner-error",
            source: "cve",
            confidence: 100,
          });
        }
      }

      if (packageName) {
        await ctx.runMutation(api.scans.updateProgress, {
          id: scanId,
          status: "running",
          phase: "enriching",
          progress: 78,
          message: "Analyzing package intelligence...",
        });

        try {
          await ctx.runAction(api.packageAnalyzer.analyzePackage, {
            scanId,
            packageName,
          });
        } catch (error) {
          console.error("Package analyzer error:", error);
          await ctx.runMutation(api.findings.create, {
            scanId,
            title: "Package Analysis Error",
            description: `Package analysis failed for ${packageName}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            severity: "info",
            category: "scanner-error",
            source: "package",
            confidence: 100,
          });
        }
      }

      await ctx.runMutation(api.scans.updateProgress, {
        id: scanId,
        status: "running",
        phase: "enriching",
        progress: 85,
        message: "Gathering threat intelligence...",
      });

      // Legacy global search removed (moved to per-finding research after scoring)

      await ctx.runMutation(api.scans.updateProgress, {
        id: scanId,
        status: "running",
        phase: "enriching",
        progress: 90,
        message: "Generating AI explanations...",
      });

      const findings = await ctx.runQuery(api.findings.getByScan, { scanId });

      for (const finding of findings) {
        try {
          const evidenceText =
            finding.evidence
              ? [
                  `type=${finding.evidence.type}`,
                  finding.evidence.location
                    ? `location=${finding.evidence.location}`
                    : "",
                  typeof finding.evidence.lineNumber === "number"
                    ? `line=${finding.evidence.lineNumber}`
                    : "",
                  finding.evidence.context
                    ? `context=${finding.evidence.context}`
                    : "",
                  finding.evidence.raw ? `raw=${finding.evidence.raw}` : "",
                ]
                  .filter(Boolean)
                  .join(" | ")
              : "";

          const aiExplanation = await ctx.runAction(api.aiAnalysis.explainFinding, {
            title: finding.title,
            description: finding.description,
            severity: finding.severity,
            category: finding.category,
            remediation: finding.remediation,
            affectedComponent: finding.affectedComponent,
            targetType,
            targetUrl: runtimeUrl || githubUrl || "",
            stackHint,
            evidence: evidenceText,
            findingSource: finding.source,
          });

          await ctx.runMutation(api.findings.attachAiExplanation, {
            findingId: finding._id,
            aiExplanation,
          });
        } catch (error) {
          console.error("AI explanation error for finding:", finding._id, error);
        }
      }

      await ctx.runMutation(api.scans.updateProgress, {
        id: scanId,
        status: "running",
        phase: "finalizing",
        progress: 92,
        message: "Generating remediations...",
      });

      await ctx.runMutation(internal.auditHelpers.generateRemediations, {
        scanId,
      });

      const summary = await ctx.runMutation(api.scoring.calculateScore, {
        scanId,
      });

      // --- PER-FINDING CONTEXT-AWARE INTELLIGENCE ---
      await ctx.runMutation(api.scans.updateProgress, {
        id: scanId,
        status: "running",
        phase: "enriching",
        progress: 95,
        message: "Performing targeted threat research...",
      });

      // Filter to unique finding titles to avoid redundant searches
      const uniqueFindings = findings.filter(
        (f, i, self) => self.findIndex((t) => t.title === f.title) === i
      );

      for (const finding of uniqueFindings) {
        try {
          // Construct targeted query: exploits, incidents, advisories for this exact finding
          const searchQuery = `real-world exploitation active incidents public writeups and advisories for vulnerability: ${finding.title}`;
          
          await ctx.runAction(api.exa.searchVulnerabilities, {
            scanId,
            findingId: finding._id,
            query: searchQuery,
          });
        } catch (error) {
          console.error("Research failed for finding:", finding.title, error);
        }
      }

      await ctx.runMutation(api.reports.create, {
        scanId,
        title: `Security Report`,
        executiveSummary: `Scan completed with ${summary.totalFindings} findings. Risk level: ${summary.threatLevel}. Overall score: ${summary.overallScore}/100.`,
        status: "generated",
        format: "json",
        sections: [
          {
            id: "overview",
            title: "Executive Overview",
            content: `This scan produced ${summary.totalFindings} findings. Critical: ${summary.critical}, High: ${summary.high}, Medium: ${summary.medium}, Low: ${summary.low}, Info: ${summary.info}. Overall score: ${summary.overallScore}/100. Threat level: ${summary.threatLevel}.`,
            type: "summary",
            order: 1,
          },
          {
            id: "remediation",
            title: "Remediation Focus",
            content:
              "Prioritize critical and high severity findings first, then address medium and low severity hardening gaps.",
            type: "recommendation",
            order: 2,
          },
        ],
      });

      await ctx.runMutation(api.scans.updateProgress, {
        id: scanId,
        status: "completed",
        phase: "done",
        progress: 100,
        message: "Audit completed successfully.",
      });

      return scanId;
    } catch (error) {
      console.error("Audit pipeline error:", error);

      await ctx.runMutation(api.scans.updateProgress, {
        id: scanId,
        status: "failed",
        phase: "error",
        progress: 100,
        message: `Audit failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });

      return scanId;
    }
  },
});