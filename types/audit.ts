export type InputType = 'website' | 'github' | 'domain' | 'cve' | 'package' | 'snippet';

export interface AuditInput {
  websiteUrl?: string;
  githubUrl?: string;
  domain?: string;
  cveId?: string;
  packageName?: string;
  codeSnippet?: string;
  stack?: string;
}

export interface AuditConfig {
  inputs: AuditInput;
  enabledSources: InputType[];
  deepScan?: boolean;
  includeIntelligence?: boolean;
}
