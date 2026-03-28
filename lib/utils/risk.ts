export function getRiskLevel(score: number): { label: string; color: string; bg: string } {
  if (score <= 20) return { label: "Critical Risk", color: "#ef4444", bg: "bg-red-500/10" };
  if (score <= 40) return { label: "High Risk", color: "#f97316", bg: "bg-orange-500/10" };
  if (score <= 60) return { label: "Medium Risk", color: "#eab308", bg: "bg-yellow-500/10" };
  if (score <= 80) return { label: "Low Risk", color: "#3b82f6", bg: "bg-blue-500/10" };
  return { label: "Minimal Risk", color: "#22c55e", bg: "bg-green-500/10" };
}

export function calculateRiskFromCvss(cvss: number): string {
  if (cvss >= 9.0) return "critical";
  if (cvss >= 7.0) return "high";
  if (cvss >= 4.0) return "medium";
  if (cvss >= 0.1) return "low";
  return "info";
}
