export type ReportFormat = 'pdf' | 'markdown' | 'json';
export type ReportStatus = 'generating' | 'ready' | 'failed';

export interface Report {
  id: string;
  scanId: string;
  title: string;
  executiveSummary: string;
  generatedAt: string;
  status: ReportStatus;
  format: ReportFormat;
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'summary' | 'findings' | 'intelligence' | 'remediation' | 'references';
  order: number;
}
