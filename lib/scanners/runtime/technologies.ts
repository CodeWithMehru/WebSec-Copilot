import type { ScannerFinding, RuntimeScanTarget } from "../types";

const TECH_SIGNATURES: Record<string, RegExp[]> = {
  React: [/react/i, /_next/i, /__NEXT_DATA__/],
  "Next.js": [/__NEXT_DATA__/, /_next\/static/],
  Vue: [/vue\.js/i, /__vue__/],
  Angular: [/ng-version/i, /angular/i],
  jQuery: [/jquery/i],
  WordPress: [/wp-content/i, /wp-includes/],
  Express: [/X-Powered-By:\s*Express/i],
  Laravel: [/laravel/i],
  Rails: [/X-Powered-By:\s*Phusion/i],
  Django: [/csrfmiddlewaretoken/i],
  Bootstrap: [/bootstrap/i],
  Tailwind: [/tailwindcss/i],
};

export async function scanTechnologies(target: RuntimeScanTarget): Promise<{ findings: ScannerFinding[]; detected: string[] }> {
  const findings: ScannerFinding[] = [];
  const detected: string[] = [];
  try {
    const res = await fetch(target.url, { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    const headers = Object.fromEntries(res.headers.entries());
    const combined = html + JSON.stringify(headers);

    for (const [tech, patterns] of Object.entries(TECH_SIGNATURES)) {
      if (patterns.some((p) => p.test(combined))) {
        detected.push(tech);
      }
    }

    if (detected.length > 0) {
      findings.push({
        title: "Technology Stack Fingerprinted",
        description: `Detected technologies: ${detected.join(", ")}. Technology fingerprinting helps attackers identify specific vulnerabilities.`,
        severity: "info",
        category: "technologies",
        source: "runtime",
        confidence: 75,
        affectedComponent: detected.join(", "),
        remediation: "Minimize technology footprint in production. Remove version-specific identifiers.",
      });
    }
  } catch {
    // skip
  }
  return { findings, detected };
}
