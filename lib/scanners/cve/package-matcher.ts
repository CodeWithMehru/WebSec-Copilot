export function matchPackageToCves(packageName: string, version: string): string[] {
  // Known mappings for demo purposes
  const knownCves: Record<string, Array<{ maxVersion: string; cve: string }>> = {
    lodash: [{ maxVersion: "4.17.20", cve: "CVE-2021-23337" }],
    axios: [{ maxVersion: "1.5.9", cve: "CVE-2023-45857" }],
    jsonwebtoken: [{ maxVersion: "8.5.1", cve: "CVE-2022-23529" }],
    minimatch: [{ maxVersion: "3.1.1", cve: "CVE-2022-3517" }],
    qs: [{ maxVersion: "6.10.9", cve: "CVE-2022-24999" }],
    express: [{ maxVersion: "4.18.9", cve: "CVE-2024-29041" }],
  };

  const entries = knownCves[packageName.toLowerCase()];
  if (!entries) return [];
  return entries
    .filter(e => version <= e.maxVersion)
    .map(e => e.cve);
}
