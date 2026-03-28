import type { ScannerFinding, RuntimeScanTarget } from "../types";

const SENSITIVE_ENDPOINTS = [
  { path: "/.env", name: ".env file" },
  { path: "/wp-admin", name: "WordPress Admin" },
  { path: "/admin", name: "Admin panel" },
  { path: "/api/debug", name: "Debug API" },
  { path: "/graphql", name: "GraphQL endpoint" },
  { path: "/swagger", name: "Swagger UI" },
  { path: "/api-docs", name: "API documentation" },
  { path: "/.git/config", name: "Git config" },
  { path: "/server-status", name: "Server status" },
  { path: "/phpinfo.php", name: "PHP info" },
];

export async function scanEndpoints(target: RuntimeScanTarget): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  for (const ep of SENSITIVE_ENDPOINTS) {
    try {
      const url = new URL(ep.path, target.url).toString();
      const res = await fetch(url, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(5000) });
      if (res.status === 200 || res.status === 301 || res.status === 302) {
        findings.push({
          title: `Exposed Endpoint: ${ep.name}`,
          description: `${ep.name} (${ep.path}) is publicly accessible (HTTP ${res.status}).`,
          severity: ep.path.includes(".env") || ep.path.includes(".git") ? "critical" : "medium",
          category: "endpoints",
          source: "runtime",
          confidence: 85,
          affectedComponent: ep.path,
          remediation: `Restrict access to ${ep.path} or remove it from production.`,
        });
      }
    } catch {
      // skip
    }
  }
  return findings;
}
