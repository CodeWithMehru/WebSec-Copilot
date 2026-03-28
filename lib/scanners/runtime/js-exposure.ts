import type { ScannerFinding, RuntimeScanTarget } from "../types";

const SECRET_PATTERNS = [
  { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]([^'"]{8,})['"]/gi, name: "API Key" },
  { pattern: /(?:secret|token|password)\s*[:=]\s*['"]([^'"]{8,})['"]/gi, name: "Secret/Token" },
  { pattern: /(?:aws_access_key_id)\s*[:=]\s*['"]([A-Z0-9]{16,})['"]/gi, name: "AWS Access Key" },
  { pattern: /(?:firebase|supabase|convex).*?['"]([a-zA-Z0-9_-]{20,})['"]/gi, name: "Service Key" },
  { pattern: /(?:NEXT_PUBLIC_|REACT_APP_).*?[:=]\s*['"]([^'"]{8,})['"]/gi, name: "Env Variable Leak" },
  { pattern: /(?:sk_live_|pk_live_|sk_test_|pk_test_)[a-zA-Z0-9]{20,}/g, name: "Stripe Key" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: "GitHub PAT" },
];

export async function scanJsExposure(target: RuntimeScanTarget): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  try {
    const res = await fetch(target.url, { signal: AbortSignal.timeout(10000) });
    const html = await res.text();

    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    const inlineScripts = scriptMatches.join("\n");

    for (const { pattern, name } of SECRET_PATTERNS) {
      const matches = inlineScripts.matchAll(pattern);
      for (const match of matches) {
        findings.push({
          title: `Exposed ${name} in Client-Side JavaScript`,
          description: `A potential ${name} was found in inline JavaScript: ${match[0].substring(0, 60)}...`,
          severity: "high",
          category: "secrets",
          source: "runtime",
          confidence: 70,
          evidence: { type: "code", raw: match[0].substring(0, 100), location: "Inline <script>", context: `Potential ${name} exposed in client-side code` },
          remediation: `Move secrets to server-side environment variables. Never embed secrets in client-side code.`,
        });
      }
    }
  } catch {
    // skip
  }
  return findings;
}
