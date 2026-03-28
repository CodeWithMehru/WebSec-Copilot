import type { ScannerFinding, RuntimeScanTarget } from "../types";

export async function scanCookies(target: RuntimeScanTarget): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  try {
    const res = await fetch(target.url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(10000) });
    const setCookies = res.headers.getSetCookie?.() || [];
    for (const cookie of setCookies) {
      const name = cookie.split("=")[0]?.trim() || "unknown";
      if (!cookie.toLowerCase().includes("secure")) {
        findings.push({
          title: `Cookie "${name}" Missing Secure Flag`,
          description: `The cookie "${name}" does not have the Secure flag, allowing transmission over HTTP.`,
          severity: "medium",
          category: "cookies",
          source: "runtime",
          confidence: 90,
          remediation: "Add the Secure flag to all cookies.",
        });
      }
      if (!cookie.toLowerCase().includes("httponly")) {
        findings.push({
          title: `Cookie "${name}" Missing HttpOnly Flag`,
          description: `The cookie "${name}" is accessible via JavaScript, increasing XSS risk.`,
          severity: "medium",
          category: "cookies",
          source: "runtime",
          confidence: 90,
          remediation: "Add the HttpOnly flag to prevent JavaScript access.",
        });
      }
      if (!cookie.toLowerCase().includes("samesite")) {
        findings.push({
          title: `Cookie "${name}" Missing SameSite Attribute`,
          description: `The cookie "${name}" lacks SameSite attribute, risking CSRF attacks.`,
          severity: "low",
          category: "cookies",
          source: "runtime",
          confidence: 85,
          remediation: "Set SameSite=Strict or SameSite=Lax.",
        });
      }
    }
  } catch {
    // skip
  }
  return findings;
}
