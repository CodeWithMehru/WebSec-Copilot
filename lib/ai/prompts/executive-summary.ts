export function executiveSummaryPrompt(scan: { score: number; total: number; critical: number; high: number; medium: number; low: number; technologies: string[] }): Array<{ role: string; content: string }> {
  return [
    { role: "system", content: "You are a cybersecurity consultant writing an executive summary for a security audit report. Be professional, clear, and concise." },
    { role: "user", content: `Write an executive summary for this audit:\n- Overall Score: ${scan.score}/100\n- Total Findings: ${scan.total}\n- Critical: ${scan.critical}, High: ${scan.high}, Medium: ${scan.medium}, Low: ${scan.low}\n- Technologies: ${scan.technologies.join(", ") || "No tech detected"}\n\nProvide a 2-3 paragraph executive summary covering risk posture, key concerns, and recommended priorities.` },
  ];
}
