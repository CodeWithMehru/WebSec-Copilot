export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
  services: {
    convex: boolean;
    exa: boolean;
    apify: boolean;
    github: boolean;
    ai: boolean;
  };
}

export interface ExportRequest {
  scanId: string;
  format: 'pdf' | 'markdown' | 'json';
  includeEvidence?: boolean;
  includeRemediation?: boolean;
}
