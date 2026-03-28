import type { ScannerFinding, RepoFile } from "../types";
import { createCodeEvidence } from "../evidence";

const INPUT_PATTERNS = [
  { pattern: /innerHTML\s*=/gi, name: "Direct innerHTML Assignment", severity: "high" as const, desc: "XSS risk from direct innerHTML assignment" },
  { pattern: /dangerouslySetInnerHTML/gi, name: "React dangerouslySetInnerHTML", severity: "high" as const, desc: "XSS risk from dangerouslySetInnerHTML" },
  { pattern: /\$\(.*\)\.html\(/gi, name: "jQuery .html() Injection", severity: "high" as const, desc: "Potential XSS via jQuery .html()" },
  { pattern: /document\.write\(/gi, name: "document.write", severity: "medium" as const, desc: "document.write can lead to DOM manipulation" },
  { pattern: /eval\(/gi, name: "eval() Usage", severity: "critical" as const, desc: "eval() executes arbitrary code" },
  { pattern: /new\s+Function\(/gi, name: "new Function() Constructor", severity: "high" as const, desc: "Dynamic code execution risk" },
  { pattern: /(?:req|request)\.(?:body|query|params)\.[a-zA-Z]+(?!\s*\))/gi, name: "Unsanitized User Input", severity: "medium" as const, desc: "User input used without apparent sanitization" },
];

export function scanInputValidation(files: RepoFile[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];
  for (const file of files) {
    if (!/\.(ts|js|tsx|jsx)$/i.test(file.path)) continue;
    for (const { pattern, name, severity, desc } of INPUT_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const lineNumber = file.content.substring(0, match.index).split("\n").length;
        findings.push({
          title: `Input Validation Risk: ${name}`,
          description: `${desc} in ${file.path}`,
          severity,
          category: "input-validation",
          source: "repo",
          confidence: 65,
          evidence: createCodeEvidence(match[0], file.path, lineNumber),
          affectedComponent: file.path,
          remediation: `Sanitize inputs and avoid ${name}.`,
        });
      }
    }
  }
  return findings;
}
