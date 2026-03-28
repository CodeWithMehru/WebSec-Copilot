export type RemediationStatus = 'pending' | 'in-progress' | 'resolved' | 'deferred' | 'accepted';
export type FixPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RemediationItem {
  id: string;
  scanId: string;
  findingId: string;
  title: string;
  description: string;
  status: RemediationStatus;
  priority: FixPriority;
  fixSuggestion: string;
  saferCode?: string;
  effort: 'minimal' | 'moderate' | 'significant';
  category: string;
}
