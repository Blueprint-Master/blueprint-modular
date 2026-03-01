export interface BPMComponentContext {
  id: string;
  type: "metric" | "table" | "chart" | "panel" | "text" | string;
  label?: string;
  value?: unknown;
  data?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface BPMPageContext {
  module: string;
  pageTitle?: string;
  components: BPMComponentContext[];
  timestamp: string;
}
