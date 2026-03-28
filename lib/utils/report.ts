export function generateReportTitle(projectName: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `Security Audit Report - ${projectName} - ${date}`;
}

export function generateExecutiveSummary(
  score: number,
  totalFindings: number,
  critical: number,
  high: number,
): string {
  const riskWord = score <= 40 ? "significant" : score <= 70 ? "moderate" : "minimal";
  return `This security audit identified ${totalFindings} findings across the analyzed targets. The overall security score is ${score}/100, indicating ${riskWord} risk. ${critical > 0 ? `${critical} critical findings require immediate attention. ` : ""}${high > 0 ? `${high} high-severity findings should be addressed promptly.` : "No high-severity issues were detected."}`;
}
