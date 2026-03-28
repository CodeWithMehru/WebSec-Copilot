import type { ScannerFinding } from "./types";

export function scoreFinding(finding: ScannerFinding): number {
  const severityScores: Record<string, number> = {
    critical: 10, high: 7.5, medium: 5, low: 2.5, info: 0.5,
  };
  const base = severityScores[finding.severity] || 0;
  const confidenceMultiplier = finding.confidence / 100;
  return Math.round(base * confidenceMultiplier * 10) / 10;
}

export function aggregateScore(findings: ScannerFinding[]): number {
  if (findings.length === 0) return 100;
  const totalDeduction = findings.reduce((sum, f) => sum + scoreFinding(f), 0);
  return Math.max(0, Math.min(100, Math.round(100 - totalDeduction)));
}
