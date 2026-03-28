export function exportToMarkdown(data: {
  title: string;
  executiveSummary: string;
  findings: Array<{ title: string; severity: string; description: string; remediation?: string }>;
  score: number;
}): string {
  let md = `# ${data.title}\n\n`;
  md += `## Executive Summary\n\n${data.executiveSummary}\n\n`;
  md += `**Overall Security Score: ${data.score}/100**\n\n`;
  md += `## Findings (${data.findings.length})\n\n`;
  for (const f of data.findings) {
    md += `### [${f.severity.toUpperCase()}] ${f.title}\n\n`;
    md += `${f.description}\n\n`;
    if (f.remediation) md += `**Remediation:** ${f.remediation}\n\n`;
    md += `---\n\n`;
  }
  return md;
}
