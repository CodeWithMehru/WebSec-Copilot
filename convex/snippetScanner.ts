import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const scanSnippet = mutation({
  args: {
    scanId: v.id("scans"),
    code: v.string(),
    language: v.optional(v.string()),
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
    }> = [];

    try {
      if (!args.code || args.code.trim().length === 0) return 0;

      const checks = [
        { pattern: /eval\s*\(/g, title: "eval() Usage", desc: "eval() executes arbitrary code and is a code injection risk", severity: "critical", category: "code-pattern" },
        { pattern: /innerHTML\s*=/g, title: "innerHTML Assignment", desc: "Direct innerHTML assignment can lead to XSS", severity: "high", category: "input-validation" },
        { pattern: /dangerouslySetInnerHTML/g, title: "dangerouslySetInnerHTML", desc: "React XSS risk when unsanitized data is used", severity: "high", category: "input-validation" },
        { pattern: /document\.write\s*\(/g, title: "document.write()", desc: "DOM manipulation risk and possible XSS", severity: "medium", category: "code-pattern" },
        { pattern: /(?:password|secret|api.?key)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{8,})['"]/gi, title: "Hardcoded Secret", desc: "Secret embedded directly in code", severity: "critical", category: "secrets" },
        { pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/g, title: "Plaintext HTTP", desc: "Insecure HTTP connection found", severity: "medium", category: "tls" },
        { pattern: /(?:child_process|exec\s*\(|execSync\s*\(|system\s*\(|shell_exec\s*\()/g, title: "Shell Execution", desc: "Command execution pattern can lead to command injection", severity: "critical", category: "code-pattern" },
        { pattern: /(?:SELECT.*FROM.*WHERE.*=.*'.*\$|SELECT.*FROM.*WHERE.*=.*'.*\+)/ig, title: "Dynamic SQL (SQLi Risk)", desc: "String-built SQL query may allow SQL injection", severity: "critical", category: "input-validation" },
        { pattern: /pickle\.loads\s*\(/g, title: "Insecure Deserialization", desc: "Python pickle deserialization is unsafe", severity: "critical", category: "code-pattern" },
      ];

      for (const check of checks) {
        check.pattern.lastIndex = 0;
        if (check.pattern.test(args.code)) {
          findings.push({
            scanId: args.scanId,
            title: check.title,
            description: check.desc,
            severity: check.severity,
            category: check.category,
            source: "snippet",
            confidence: 85,
            remediation: `Review and fix: ${check.title}`,
          });
        }
      }

      for (const finding of findings) {
        await ctx.db.insert("findings", finding);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown snippet scan error";
      console.error("Snippet scanner error:", error);

      await ctx.db.insert("findings", {
        scanId: args.scanId,
        title: "Snippet Scanner Error",
        description: `Failed to scan code snippet: ${message}`,
        severity: "info",
        category: "scanner-error",
        source: "snippet",
        confidence: 100,
      });

      return 1;
    }

    return findings.length;
  },
});