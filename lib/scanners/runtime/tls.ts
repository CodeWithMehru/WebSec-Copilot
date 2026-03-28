import type { ScannerFinding, RuntimeScanTarget } from "../types";

export async function scanTls(target: RuntimeScanTarget): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  try {
    if (target.url.startsWith("http://")) {
      findings.push({
        title: "Site Not Served Over HTTPS",
        description: "The target URL uses HTTP instead of HTTPS, meaning all traffic is unencrypted.",
        severity: "critical",
        category: "tls",
        source: "runtime",
        confidence: 100,
        remediation: "Configure TLS/SSL on the server and redirect all HTTP traffic to HTTPS.",
        references: ["https://letsencrypt.org/getting-started/"],
      });
    }
    const httpsUrl = target.url.replace("http://", "https://");
    try {
      const res = await fetch(httpsUrl, { method: "HEAD", signal: AbortSignal.timeout(10000) });
      if (!res.ok && target.url.startsWith("http://")) {
        findings.push({
          title: "HTTPS Endpoint Returns Error",
          description: "HTTPS version of the site returned a non-OK status.",
          severity: "high",
          category: "tls",
          source: "runtime",
          confidence: 85,
          remediation: "Ensure TLS is properly configured and certificates are valid.",
        });
      }
    } catch {
      if (target.url.startsWith("http://")) {
        findings.push({
          title: "HTTPS Not Available",
          description: "HTTPS endpoint is unreachable — no TLS support detected.",
          severity: "high",
          category: "tls",
          source: "runtime",
          confidence: 80,
          remediation: "Set up TLS on the server with a valid certificate.",
        });
      }
    }
  } catch {
    // skip
  }
  return findings;
}
