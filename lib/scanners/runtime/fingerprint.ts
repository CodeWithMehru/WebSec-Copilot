import type { ScannerFinding, RuntimeScanTarget } from "../types";

export async function scanFingerprint(target: RuntimeScanTarget): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  try {
    const res = await fetch(target.url, { signal: AbortSignal.timeout(10000) });
    const html = await res.text();

    const metaGenerator = html.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
    if (metaGenerator) {
      findings.push({
        title: "Framework Version Disclosed via Meta Generator",
        description: `Generator meta tag reveals: ${metaGenerator[1]}`,
        severity: "low",
        category: "technologies",
        source: "runtime",
        confidence: 90,
        evidence: { type: "code", raw: metaGenerator[0], location: "<meta> tag" },
        remediation: "Remove the generator meta tag from production HTML.",
      });
    }

    const htmlComments = html.match(/<!--[\s\S]*?-->/g) || [];
    const sensitiveComments = htmlComments.filter(c =>
      /password|secret|todo|fixme|hack|bug|credential/i.test(c)
    );
    if (sensitiveComments.length > 0) {
      findings.push({
        title: "Sensitive Information in HTML Comments",
        description: `${sensitiveComments.length} HTML comment(s) contain potentially sensitive information.`,
        severity: "low",
        category: "exposure",
        source: "runtime",
        confidence: 60,
        evidence: { type: "code", raw: sensitiveComments[0].substring(0, 200), location: "HTML comments" },
        remediation: "Remove sensitive HTML comments from production code.",
      });
    }
  } catch {
    // skip
  }
  return findings;
}
