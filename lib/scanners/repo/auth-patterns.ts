import type { ScannerFinding, RepoFile } from "../types";
import { createCodeEvidence } from "../evidence";

const AUTH_PATTERNS = [
  { pattern: /jwt\.sign\([^)]*expiresIn\s*:\s*['"](\d+d|never)['"]/gi, name: "Long-lived JWT", severity: "high" as const },
  { pattern: /(?:bcrypt|argon2|scrypt).*rounds?\s*[:=]\s*(\d+)/gi, name: "Weak Hashing Rounds", severity: "medium" as const, check: (m: string) => parseInt(m) < 10 },
  { pattern: /password.*(?:md5|sha1)\(/gi, name: "Weak Password Hashing (MD5/SHA1)", severity: "critical" as const },
  { pattern: /(?:verify|check).*password.*===.*password/gi, name: "Timing-Unsafe Password Comparison", severity: "high" as const },
  { pattern: /session.*(?:httpOnly|secure)\s*:\s*false/gi, name: "Insecure Session Config", severity: "high" as const },
  { pattern: /cors\(\s*\)/g, name: "CORS Open to All Origins", severity: "medium" as const },
  { pattern: /cors\([^)]*origin\s*:\s*(?:true|['"]?\*['"]?)/gi, name: "CORS Wildcard Origin", severity: "medium" as const },
];

export function scanAuthPatterns(files: RepoFile[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];
  for (const file of files) {
    if (!/\.(ts|js|tsx|jsx|py|rb|go|java)$/i.test(file.path)) continue;
    for (const { pattern, name, severity } of AUTH_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const lineNumber = file.content.substring(0, match.index).split("\n").length;
        findings.push({
          title: `Insecure Auth Pattern: ${name}`,
          description: `${name} detected in ${file.path}`,
          severity,
          category: "auth",
          source: "repo",
          confidence: 70,
          evidence: createCodeEvidence(match[0], file.path, lineNumber),
          affectedComponent: file.path,
          remediation: `Review and fix the authentication pattern in ${file.path}.`,
        });
      }
    }
  }
  return findings;
}
