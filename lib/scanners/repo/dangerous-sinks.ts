import type { ScannerFinding, RepoFile } from "../types";
import { createCodeEvidence } from "../evidence";

const DANGEROUS_SINKS = [
  { pattern: /\.innerHTML\s*=\s*(?!['"])/gi, name: "innerHTML with dynamic value", severity: "high" as const },
  { pattern: /document\.write\(/gi, name: "document.write()", severity: "medium" as const },
  { pattern: /eval\(/gi, name: "eval()", severity: "critical" as const },
  { pattern: /setTimeout\(\s*['"`]/gi, name: "setTimeout with string", severity: "medium" as const },
  { pattern: /setInterval\(\s*['"`]/gi, name: "setInterval with string", severity: "medium" as const },
  { pattern: /window\.location\s*=\s*(?!['"]http)/gi, name: "Open Redirect", severity: "high" as const },
  { pattern: /\.insertAdjacentHTML\(/gi, name: "insertAdjacentHTML", severity: "medium" as const },
  { pattern: /\$\{.*\}\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP)/gi, name: "SQL Injection Risk", severity: "critical" as const },
];

export function scanDangerousSinks(files: RepoFile[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];
  for (const file of files) {
    if (!/\.(ts|js|tsx|jsx)$/i.test(file.path)) continue;
    for (const { pattern, name, severity } of DANGEROUS_SINKS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const lineNumber = file.content.substring(0, match.index).split("\n").length;
        findings.push({
          title: `Dangerous Sink: ${name}`,
          description: `${name} detected in ${file.path} — potential code injection vector`,
          severity,
          category: "code-pattern",
          source: "repo",
          confidence: 65,
          evidence: createCodeEvidence(match[0], file.path, lineNumber),
          affectedComponent: file.path,
          remediation: `Avoid ${name} or use safe alternatives.`,
        });
      }
    }
  }
  return findings;
}
