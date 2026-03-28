import type { ScannerFinding, RepoFile } from "../types";
import { createCodeEvidence } from "../evidence";

const SECRET_PATTERNS = [
  { pattern: /(?:api[_-]?key|apikey|api_secret)\s*[:=]\s*['"]([^'"]{8,})['"]/gi, name: "API Key", severity: "critical" as const },
  { pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]{6,})['"]/gi, name: "Hardcoded Password", severity: "critical" as const },
  { pattern: /(?:secret|token|auth)\s*[:=]\s*['"]([^'"]{8,})['"]/gi, name: "Secret/Token", severity: "high" as const },
  { pattern: /(?:aws_access_key_id|aws_secret_access_key)\s*[:=]\s*['"]([A-Za-z0-9/+=]{16,})['"]/gi, name: "AWS Credential", severity: "critical" as const },
  { pattern: /(?:sk_live_|pk_live_|sk_test_)[a-zA-Z0-9]{20,}/g, name: "Stripe Key", severity: "critical" as const },
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: "GitHub PAT", severity: "critical" as const },
  { pattern: /-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----/g, name: "Private Key", severity: "critical" as const },
  { pattern: /(?:PRIVATE_KEY|DB_PASSWORD|DATABASE_URL)\s*[:=]\s*['"]([^'"]{8,})['"]/gi, name: "Environment Secret", severity: "high" as const },
];

export function scanSecrets(files: RepoFile[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];
  for (const file of files) {
    if (/\.(lock|min\.|bundle\.|map)/.test(file.path)) continue;
    for (const { pattern, name, severity } of SECRET_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const lineNumber = file.content.substring(0, match.index).split("\n").length;
        findings.push({
          title: `Exposed ${name} in ${file.path}`,
          description: `A potential ${name} was found in source code.`,
          severity,
          category: "secrets",
          source: "repo",
          confidence: 75,
          evidence: createCodeEvidence(match[0].substring(0, 80) + "...", file.path, lineNumber),
          affectedComponent: file.path,
          remediation: "Move secrets to environment variables and add the file to .gitignore.",
        });
      }
    }
  }
  return findings;
}
