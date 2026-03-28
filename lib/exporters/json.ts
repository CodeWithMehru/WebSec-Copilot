export function exportToJson(data: {
  title: string;
  executiveSummary: string;
  findings: Array<Record<string, unknown>>;
  intelligence: Array<Record<string, unknown>>;
  score: number;
  generatedAt: string;
}): string {
  return JSON.stringify({
    report: {
      title: data.title,
      generatedAt: data.generatedAt,
      score: data.score,
      executiveSummary: data.executiveSummary,
      findings: data.findings,
      intelligence: data.intelligence,
    },
  }, null, 2);
}
