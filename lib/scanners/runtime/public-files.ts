import type { ScannerFinding, RuntimeScanTarget } from "../types";

const PUBLIC_FILES = [
  { path: "/robots.txt", name: "robots.txt" },
  { path: "/sitemap.xml", name: "sitemap.xml" },
  { path: "/.htaccess", name: ".htaccess" },
  { path: "/crossdomain.xml", name: "crossdomain.xml" },
  { path: "/security.txt", name: "security.txt" },
  { path: "/.well-known/security.txt", name: "security.txt (well-known)" },
  { path: "/humans.txt", name: "humans.txt" },
];

export async function scanPublicFiles(target: RuntimeScanTarget): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  for (const file of PUBLIC_FILES) {
    try {
      const url = new URL(file.path, target.url).toString();
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      if (res.status === 200) {
        const severity = file.path === "/.htaccess" || file.path === "/crossdomain.xml" ? "medium" : "info";
        findings.push({
          title: `Public File Exposed: ${file.name}`,
          description: `${file.name} is publicly accessible at ${file.path}.`,
          severity,
          category: "public-files",
          source: "runtime",
          confidence: 90,
          affectedComponent: file.path,
          remediation: severity !== "info" ? `Review ${file.name} for sensitive information and restrict if necessary.` : undefined,
        });
      }
    } catch {
      // skip
    }
  }
  return findings;
}
