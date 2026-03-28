export function buildCveQuery(cveId: string): string {
  return `${cveId} vulnerability exploit writeup remediation patch`;
}

export function buildPackageQuery(packageName: string): string {
  return `${packageName} npm security vulnerability advisory CVE`;
}

export function buildExploitQuery(title: string): string {
  return `"${title}" exploit proof of concept security research`;
}

export function buildRemediationQuery(finding: string, stack?: string): string {
  const stackPart = stack ? ` ${stack}` : "";
  return `${finding}${stackPart} fix remediation best practices security`;
}
