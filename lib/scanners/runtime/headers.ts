import type { ScannerFinding, RuntimeScanTarget } from "../types";
import { createHeaderEvidence } from "../evidence";

const SECURITY_HEADERS = [
  { name: "Strict-Transport-Security", severity: "high" as const, description: "HSTS header missing — browser won't enforce HTTPS" },
  { name: "Content-Security-Policy", severity: "high" as const, description: "CSP header missing — no defense against XSS and injection attacks" },
  { name: "X-Content-Type-Options", severity: "medium" as const, description: "X-Content-Type-Options missing — MIME-type sniffing possible" },
  { name: "X-Frame-Options", severity: "medium" as const, description: "X-Frame-Options missing — clickjacking possible" },
  { name: "X-XSS-Protection", severity: "low" as const, description: "X-XSS-Protection header missing" },
  { name: "Referrer-Policy", severity: "low" as const, description: "Referrer-Policy missing — referrer data may leak" },
  { name: "Permissions-Policy", severity: "low" as const, description: "Permissions-Policy missing — browser features not restricted" },
  { name: "Cross-Origin-Opener-Policy", severity: "low" as const, description: "COOP header missing" },
  { name: "Cross-Origin-Resource-Policy", severity: "low" as const, description: "CORP header missing" },
];

export async function scanHeaders(target: RuntimeScanTarget): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  try {
    const res = await fetch(target.url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(10000) });
    const headers = res.headers;

    for (const check of SECURITY_HEADERS) {
      const value = headers.get(check.name);
      if (!value) {
        findings.push({
          title: `Missing ${check.name} Header`,
          description: check.description,
          severity: check.severity,
          category: "headers",
          source: "runtime",
          evidence: createHeaderEvidence(check.name, null),
          confidence: 95,
          remediation: `Add the ${check.name} header to your server responses.`,
          references: [`https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/${check.name}`],
        });
      }
    }

    const server = headers.get("Server");
    if (server) {
      findings.push({
        title: "Server Version Disclosed",
        description: `Server header exposes: ${server}`,
        severity: "low",
        category: "headers",
        source: "runtime",
        evidence: createHeaderEvidence("Server", server, "Server version information aids attacker reconnaissance"),
        confidence: 90,
        remediation: "Remove or obfuscate the Server header to prevent version disclosure.",
      });
    }

    const poweredBy = headers.get("X-Powered-By");
    if (poweredBy) {
      findings.push({
        title: "Technology Stack Disclosed via X-Powered-By",
        description: `X-Powered-By: ${poweredBy}`,
        severity: "low",
        category: "headers",
        source: "runtime",
        evidence: createHeaderEvidence("X-Powered-By", poweredBy),
        confidence: 90,
        remediation: "Remove the X-Powered-By header.",
      });
    }
  } catch {
    // Network error — skip
  }
  return findings;
}
