import type { ScannerFinding, RepoFile } from "../types";
import { createCodeEvidence } from "../evidence";

const INSECURE_APIS = [
  { pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/gi, name: "Plaintext HTTP API Call", severity: "medium" as const },
  { pattern: /fetch\([^)]*\{[^}]*mode:\s*['"]no-cors['"]/gi, name: "no-cors Fetch Mode", severity: "low" as const },
  { pattern: /XMLHttpRequest/gi, name: "Legacy XMLHttpRequest", severity: "info" as const },
  { pattern: /child_process|exec\(|execSync\(/gi, name: "Shell Command Execution", severity: "critical" as const },
  { pattern: /fs\.(?:readFile|writeFile|unlink|rmdir).*(?:req|input|param)/gi, name: "File System with User Input", severity: "high" as const },
];

export function scanInsecureApis(files: RepoFile[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];
  for (const file of files) {
    if (!/\.(ts|js|tsx|jsx)$/i.test(file.path)) continue;
    for (const { pattern, name, severity } of INSECURE_APIS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const lineNumber = file.content.substring(0, match.index).split("\n").length;
        findings.push({
          title: `Insecure API Usage: ${name}`,
          description: `${name} found in ${file.path}`,
          severity,
          category: "api",
          source: "repo",
          confidence: 60,
          evidence: createCodeEvidence(match[0].substring(0, 100), file.path, lineNumber),
          affectedComponent: file.path,
          remediation: `Review the usage of ${name} in ${file.path}.`,
        });
      }
    }
  }
  return findings;
}
