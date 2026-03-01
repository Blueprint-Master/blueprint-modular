export interface OfflineEntry {
  id: string;
  type: string;
  data: unknown;
  timestamp: string;
  synced: boolean;
  retries: number;
  organizationId: string;
  endpoint: string;
}

export interface SyncResult {
  synced: number;
  failed: number;
  pending: number;
}
