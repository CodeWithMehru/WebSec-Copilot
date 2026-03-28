import type { Severity, FindingCategory, FindingSource, Evidence } from "@/types/finding";

export interface ScannerFinding {
  title: string;
  description: string;
  severity: Severity;
  category: FindingCategory;
  source: FindingSource;
  evidence?: Evidence;
  confidence: number;
  affectedComponent?: string;
  remediation?: string;
  references?: string[];
  cveIds?: string[];
}

export interface ScannerResult {
  findings: ScannerFinding[];
  technologies?: string[];
  metadata?: Record<string, unknown>;
}

export interface RuntimeScanTarget {
  url: string;
  domain: string;
}

export interface RepoScanTarget {
  owner: string;
  repo: string;
  files: RepoFile[];
}

export interface RepoFile {
  path: string;
  content: string;
  language?: string;
}

export interface SnippetScanTarget {
  code: string;
  language?: string;
}
