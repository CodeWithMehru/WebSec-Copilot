import type { Evidence } from "@/types/finding";

export function createHeaderEvidence(headerName: string, value: string | null, context?: string): Evidence {
  return {
    type: "header",
    raw: value ? `${headerName}: ${value}` : `${headerName}: (missing)`,
    location: "HTTP Response Headers",
    context: context || `The ${headerName} header ${value ? "has a potentially insecure value" : "is missing"}`,
  };
}

export function createCodeEvidence(code: string, filePath: string, line?: number): Evidence {
  return {
    type: "code",
    raw: code,
    location: filePath,
    lineNumber: line,
    context: `Potentially insecure code pattern detected`,
  };
}

export function createConfigEvidence(config: string, filePath: string): Evidence {
  return {
    type: "config",
    raw: config,
    location: filePath,
    context: `Configuration may expose security risks`,
  };
}

export function createDependencyEvidence(pkg: string, version: string): Evidence {
  return {
    type: "dependency",
    raw: `${pkg}@${version}`,
    location: "package.json",
    context: `Dependency may have known vulnerabilities`,
  };
}
