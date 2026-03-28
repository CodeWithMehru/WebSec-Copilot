import type { ScannerFinding, SnippetScanTarget, RepoFile } from "../types";
import { detectLanguage } from "./language-detect";
import { scanSecrets } from "../repo/secrets";
import { scanInputValidation } from "../repo/input-validation";
import { scanDangerousSinks } from "../repo/dangerous-sinks";
import { scanInsecureApis } from "../repo/insecure-apis";

export function analyzeSnippet(target: SnippetScanTarget): ScannerFinding[] {
  const language = target.language || detectLanguage(target.code);
  const pseudoFile: RepoFile = {
    path: `snippet.${getExtension(language)}`,
    content: target.code,
    language,
  };

  const findings: ScannerFinding[] = [
    ...scanSecrets([pseudoFile]),
    ...scanInputValidation([pseudoFile]),
    ...scanDangerousSinks([pseudoFile]),
    ...scanInsecureApis([pseudoFile]),
  ];

  return findings.map(f => ({ ...f, source: "snippet" as const }));
}

function getExtension(language: string): string {
  const map: Record<string, string> = {
    typescript: "ts", javascript: "js", python: "py", go: "go",
    rust: "rs", java: "java", php: "php", ruby: "rb",
    csharp: "cs", cpp: "cpp", c: "c", html: "html",
  };
  return map[language] || "txt";
}
