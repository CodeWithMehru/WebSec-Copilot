import type { ScannerFinding } from "./types";
import type { Severity } from "@/types/finding";

export function normalizeFinding(finding: ScannerFinding): ScannerFinding {
  return {
    ...finding,
    title: finding.title.trim(),
    description: finding.description.trim(),
    confidence: Math.max(0, Math.min(100, finding.confidence)),
    severity: finding.severity || "info",
  };
}

export function deduplicateFindings(findings: ScannerFinding[]): ScannerFinding[] {
  const seen = new Map<string, ScannerFinding>();
  for (const f of findings) {
    const key = `${f.category}:${f.title}:${f.affectedComponent || ""}`;
    const existing = seen.get(key);
    if (!existing || severityRank(f.severity) < severityRank(existing.severity)) {
      seen.set(key, f);
    }
  }
  return Array.from(seen.values());
}

function severityRank(s: Severity): number {
  const ranks: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return ranks[s] ?? 4;
}
