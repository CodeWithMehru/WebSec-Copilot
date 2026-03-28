export type IntelligenceType = 'cve' | 'exploit' | 'advisory' | 'blog' | 'patch' | 'changelog' | 'research';

export interface IntelligenceItem {
  id: string;
  scanId: string;
  type: IntelligenceType;
  title: string;
  summary: string;
  url?: string;
  source: 'exa' | 'apify' | 'github' | 'manual';
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  publishedAt?: string;
  relatedCves?: string[];
  relatedFindings?: string[];
  packageName?: string;
  tags?: string[];
  raw?: string;
}
