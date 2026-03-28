export type ScanStatus = 'pending' | 'running' | 'analyzing' | 'enriching' | 'completed' | 'failed';
export type ScanPhase = 'init' | 'scanning' | 'analysis' | 'intelligence' | 'scoring' | 'report' | 'done';

export interface ScanProgress {
  phase: ScanPhase;
  percent: number;
  message: string;
  startedAt: number;
  updatedAt: number;
}

export interface ScanSummary {
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  overallScore: number;
  threatLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
}
