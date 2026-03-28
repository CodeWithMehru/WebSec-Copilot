import type { ScannerFinding, RepoFile } from "../types";
import { createDependencyEvidence } from "../evidence";

const KNOWN_VULNERABLE: Record<string, { minSafe: string; cve?: string; severity: "critical" | "high" | "medium" }> = {
  lodash: { minSafe: "4.17.21", cve: "CVE-2021-23337", severity: "high" },
  axios: { minSafe: "1.6.0", cve: "CVE-2023-45857", severity: "medium" },
  "express": { minSafe: "4.19.0", severity: "medium" },
  "jsonwebtoken": { minSafe: "9.0.0", cve: "CVE-2022-23529", severity: "high" },
  "node-fetch": { minSafe: "3.3.0", severity: "medium" },
  "minimatch": { minSafe: "3.1.2", cve: "CVE-2022-3517", severity: "high" },
  "qs": { minSafe: "6.11.0", cve: "CVE-2022-24999", severity: "high" },
};

export function scanDependencies(files: RepoFile[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];
  const pkgFile = files.find(f => f.path.endsWith("package.json"));
  if (!pkgFile) return findings;

  try {
    const pkg = JSON.parse(pkgFile.content);
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [name, versionStr] of Object.entries(allDeps)) {
      const version = String(versionStr).replace(/^[\^~>=<]/, "");
      const vuln = KNOWN_VULNERABLE[name];
      if (vuln && version < vuln.minSafe) {
        findings.push({
          title: `Vulnerable Dependency: ${name}@${version}`,
          description: `${name}@${version} has known vulnerabilities. Minimum safe version: ${vuln.minSafe}.`,
          severity: vuln.severity,
          category: "dependencies",
          source: "repo",
          confidence: 85,
          evidence: createDependencyEvidence(name, version),
          cveIds: vuln.cve ? [vuln.cve] : undefined,
          affectedComponent: name,
          remediation: `Update ${name} to version ${vuln.minSafe} or later.`,
        });
      }
    }
  } catch {
    // Invalid package.json
  }
  return findings;
}
