export async function exportToPdf(data: {
  title: string;
  executiveSummary: string;
  findings: Array<{ title: string; severity: string; description: string }>;
  score: number;
}): Promise<Blob> {
  // Dynamic import for client-side only
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(20);
  doc.text(data.title, 20, y);
  y += 15;

  doc.setFontSize(12);
  doc.text(`Security Score: ${data.score}/100`, 20, y);
  y += 15;

  doc.setFontSize(14);
  doc.text("Executive Summary", 20, y);
  y += 10;
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(data.executiveSummary, 170);
  doc.text(summaryLines, 20, y);
  y += summaryLines.length * 5 + 10;

  doc.setFontSize(14);
  doc.text(`Findings (${data.findings.length})`, 20, y);
  y += 10;

  for (const f of data.findings) {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.text(`[${f.severity.toUpperCase()}] ${f.title}`, 20, y);
    y += 6;
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(f.description, 170);
    doc.text(descLines, 20, y);
    y += descLines.length * 4 + 8;
  }

  return doc.output("blob");
}
