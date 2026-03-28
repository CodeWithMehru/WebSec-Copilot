import type { ScannerFinding, RepoFile } from "../types";
import { createConfigEvidence } from "../evidence";

const CONFIG_RISKS = [
  { pattern: /debug\s*[:=]\s*true/gi, name: "Debug Mode Enabled", severity: "high" as const },
  { pattern: /NODE_ENV\s*[:=]\s*['"]development['"]/gi, name: "Development Mode in Config", severity: "medium" as const },
  { pattern: /allowAll|permit_all|disable.*auth/gi, name: "Auth Disabled in Config", severity: "critical" as const },
  { pattern: /ssl\s*[:=]\s*false|rejectUnauthorized\s*[:=]\s*false/gi, name: "SSL Verification Disabled", severity: "critical" as const },
  { pattern: /trust\s*proxy|x-forwarded/gi, name: "Proxy Trust Configuration", severity: "low" as const },
];

export function scanConfigRisks(files: RepoFile[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];
  const configFiles = files.filter(f =>
    /\.(json|ya?ml|toml|env|cfg|conf|ini|ts|js)$/i.test(f.path) &&
    /config|settings|env|\.rc/i.test(f.path)
  );
  for (const file of configFiles) {
    for (const { pattern, name, severity } of CONFIG_RISKS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      if (regex.test(file.content)) {
        findings.push({
          title: `Config Risk: ${name}`,
          description: `${name} detected in ${file.path}`,
          severity,
          category: "config",
          source: "repo",
          confidence: 70,
          evidence: createConfigEvidence(name, file.path),
          affectedComponent: file.path,
          remediation: `Review and fix the configuration in ${file.path}.`,
        });
      }
    }
  }
  return findings;
}
