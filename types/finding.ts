export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingCategory =
  | 'headers'
  | 'tls'
  | 'cookies'
  | 'csp'
  | 'secrets'
  | 'dependencies'
  | 'auth'
  | 'input-validation'
  | 'config'
  | 'api'
  | 'exposure'
  | 'code-pattern'
  | 'technologies'
  | 'endpoints'
  | 'public-files';

export type FindingSource = 'runtime' | 'repo' | 'snippet' | 'cve' | 'package' | 'intelligence';

export interface Finding {
  id: string;
  scanId: string;
  title: string;
  description: string;
  severity: Severity;
  category: FindingCategory;
  source: FindingSource;
  evidence?: Evidence;
  aiExplanation?: AIExplanation;
  cveIds?: string[];
  affectedComponent?: string;
  confidence: number;
  remediation?: string;
  references?: string[];
}

export interface Evidence {
  type: 'header' | 'code' | 'config' | 'network' | 'file' | 'dependency';
  raw: string;
  location?: string;
  lineNumber?: number;
  context?: string;
}

export interface AIExplanation {
  whatHappened: string;
  whyItHappened: string;
  exploitability: string;
  attackerPerspective: string;
  impact: string;
  fixRecommendation: string;
  saferExample?: string;
  stackGuidance?: string;
}
