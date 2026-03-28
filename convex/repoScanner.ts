import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const scanRepo = action({
  args: {
    scanId: v.id("scans"),
    owner: v.string(),
    repo: v.string(),
  },
  handler: async (ctx, args) => {
    const findings: Array<{
      scanId: typeof args.scanId;
      title: string;
      description: string;
      severity: string;
      category: string;
      source: string;
      confidence: number;
      remediation?: string;
      affectedComponent?: string;
      evidence?: {
        type: string;
        raw: string;
        location?: string;
        lineNumber?: number;
        context?: string;
      };
    }> = [];

    try {
      const token = process.env.GITHUB_TOKEN || "";
      const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "WebSec-Scanner",
      };

      if (token) headers.Authorization = `Bearer ${token}`;

      const metaRes = await fetch(
        `https://api.github.com/repos/${args.owner}/${args.repo}`,
        { headers, signal: AbortSignal.timeout(10000) }
      );

      let branch = "main";
      if (metaRes.ok) {
        const meta = await metaRes.json();
        branch = meta.default_branch || "main";
      } else {
        throw new Error(`Repository metadata fetch failed: ${metaRes.status}`);
      }

      const treeRes = await fetch(
        `https://api.github.com/repos/${args.owner}/${args.repo}/git/trees/${branch}?recursive=1`,
        { headers, signal: AbortSignal.timeout(15000) }
      );

      if (!treeRes.ok) {
        throw new Error(`Repository tree fetch failed: ${treeRes.status}`);
      }

      const treeData = await treeRes.json();
      const tree = Array.isArray(treeData.tree) ? treeData.tree : [];

      const scannableRegex = /\.(ts|js|jsx|tsx|json|env|php|py|rb|html|yml|yaml|xml|cfg|ini|conf)$/i;
      const ignoreRegex = /(node_modules|dist|\.next|build|vendor|coverage|public\/assets)/i;

      const scannable = tree
        .filter(
          (item: { type: string; path: string; size?: number }) =>
            item.type === "blob" &&
            (item.size || 0) < 100000 &&
            scannableRegex.test(item.path) &&
            !ignoreRegex.test(item.path)
        )
        .slice(0, 30);

      for (const file of scannable) {
        try {
          const contentRes = await fetch(
            `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${file.path}`,
            {
              headers: {
                ...headers,
                Accept: "application/vnd.github.v3.raw",
              },
              signal: AbortSignal.timeout(10000),
            }
          );

          if (!contentRes.ok) continue;
          const content = await contentRes.text();

          const secretPatterns = [
            { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{8,})['"]/gi, name: "API Key" },
            { pattern: /(?:password|passwd)\s*[:=]\s*['"]([^'"]{6,})['"]/gi, name: "Password" },
            { pattern: /(?:secret|token)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{8,})['"]/gi, name: "Secret/Token" },
            { pattern: /AKIA[0-9A-Z]{16}/g, name: "AWS Access Key" },
            { pattern: /-----BEGIN PRIVATE KEY-----/g, name: "Private Key" },
            { pattern: /"client_secret":\s*"[^"]+"/g, name: "OAuth Client Secret" },
          ];

          for (const { pattern, name } of secretPatterns) {
            pattern.lastIndex = 0;
            const match = pattern.exec(content);
            if (match) {
              findings.push({
                scanId: args.scanId,
                title: `Exposed ${name} in ${file.path}`,
                description: `Potential hardcoded ${name} found in repository source code.`,
                severity: "critical",
                category: "secrets",
                source: "repo",
                confidence: 85,
                affectedComponent: file.path,
                remediation: "Move secrets to environment variables or a secret manager and rotate exposed credentials immediately.",
                evidence: {
                  type: "code",
                  raw: match[0].slice(0, 80),
                },
              });
            }
          }

          const dangerousPatterns = [
            { pattern: /eval\s*\(/g, name: "eval() Usage", sev: "critical", cat: "code-pattern" },
            { pattern: /exec\s*\(/g, name: "exec() Usage", sev: "critical", cat: "code-pattern" },
            { pattern: /shell_exec\s*\(/g, name: "shell_exec() Usage", sev: "critical", cat: "code-pattern" },
            { pattern: /system\s*\(/g, name: "system() Usage", sev: "critical", cat: "code-pattern" },
            { pattern: /(?:dangerouslySetInnerHTML|innerHTML\s*=)/g, name: "Unsafe DOM Insertion (XSS Risk)", sev: "high", cat: "input-validation" },
            { pattern: /(?:SELECT.*FROM.*WHERE.*=.*'.*\$|SELECT.*FROM.*WHERE.*=.*'.*\+)/ig, name: "Dynamic SQL (SQLi Risk)", sev: "critical", cat: "input-validation" },
            { pattern: /md5\s*\(/ig, name: "Weak Hash (MD5)", sev: "medium", cat: "auth" },
            { pattern: /sha1\s*\(/ig, name: "Weak Hash (SHA1)", sev: "medium", cat: "auth" },
            { pattern: /mysql_query\s*\(/ig, name: "Deprecated mysql_query (SQLi Risk)", sev: "high", cat: "input-validation" },
          ];

          for (const p of dangerousPatterns) {
            p.pattern.lastIndex = 0;
            const match = p.pattern.exec(content);
            if (match) {
              findings.push({
                scanId: args.scanId,
                title: `${p.name} in ${file.path}`,
                description: `Found dangerous invocation pattern: ${p.name}`,
                severity: p.sev,
                category: p.cat,
                source: "repo",
                confidence: 80,
                affectedComponent: file.path,
                remediation: `Review and replace unsafe usage of ${p.name} with safer alternatives.`,
                evidence: {
                  type: "code",
                  raw: match[0],
                },
              });
            }
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown repository scan error";
      console.error("GitHub API error:", error);

      findings.push({
        scanId: args.scanId,
        title: "Repository Access Error",
        description: `Failed to scan repository: ${message}`,
        severity: "info",
        category: "scanner-error",
        source: "repo",
        confidence: 100,
        remediation: "Ensure the repository is public or the GitHub token has permission to read it.",
      });
    }

    if (findings.length > 0) {
      for (let i = 0; i < findings.length; i += 20) {
        await ctx.runMutation(api.findings.createBatch, {
          findings: findings.slice(i, i + 20),
        });
      }
    }

    return findings.length;
  },
});