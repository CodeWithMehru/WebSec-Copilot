export function calculateOverallScore(findings: Array<{ severity: string }>): number {
  if (findings.length === 0) return 100;
  let deductions = 0;
  for (const f of findings) {
    switch (f.severity) {
      case "critical": deductions += 25; break;
      case "high": deductions += 15; break;
      case "medium": deductions += 8; break;
      case "low": deductions += 3; break;
      case "info": deductions += 0; break;
    }
  }
  return Math.max(0, Math.min(100, 100 - deductions));
}

export function getThreatLevel(score: number): "critical" | "high" | "medium" | "low" | "safe" {
  if (score <= 20) return "critical";
  if (score <= 40) return "high";
  if (score <= 60) return "medium";
  if (score <= 80) return "low";
  return "safe";
}

export function getScoreColor(score: number): string {
  if (score <= 20) return "#ef4444";
  if (score <= 40) return "#f97316";
  if (score <= 60) return "#eab308";
  if (score <= 80) return "#3b82f6";
  return "#22c55e";
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function getCategoryScore(findings: Array<{ severity: string; category: string }>, category: string): number {
  const catFindings = findings.filter(f => f.category === category);
  return calculateOverallScore(catFindings);
}
