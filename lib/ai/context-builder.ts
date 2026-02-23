/**
 * Transforme les données brutes des modules en texte exploitable par le LLM.
 * Limite automatique à ~4000 tokens (estimation).
 */

const MAX_TOKENS = 4000;

export function estimateTokens(text: string): number {
  return Math.ceil((text.split(/\s+/).length || 1) * 1.3);
}

export function dataframeToText(
  data: Record<string, unknown>[],
  options: { maxRows?: number; label?: string } = {}
): string {
  const { maxRows = 50, label = "" } = options;
  const rows = data.slice(0, maxRows);
  if (rows.length === 0) return label ? `${label} : (aucune donnée)\n` : "";
  const keys = Object.keys(rows[0]!);
  const header = keys.join(" | ");
  const lines = rows.map((r) => keys.map((k) => String(r[k] ?? "")).join(" | "));
  const block = [header, ...lines].join("\n");
  return label ? `${label} :\n${block}\n\n` : `${block}\n\n`;
}

export function metricsToText(metrics: Record<string, string | number>, options: { label?: string } = {}): string {
  const { label = "" } = options;
  const lines = Object.entries(metrics).map(([k, v]) => `- ${k}: ${v}`);
  const block = lines.join("\n");
  return label ? `${label} :\n${block}\n\n` : `${block}\n\n`;
}

export function chartToText(
  chartData: unknown,
  options: { type?: string; label?: string } = {}
): string {
  const { type = "chart", label = "" } = options;
  const summary = typeof chartData === "object" && chartData !== null
    ? JSON.stringify(chartData).slice(0, 500)
    : String(chartData);
  return label ? `${label} (${type}) : ${summary}\n\n` : `[${type}] ${summary}\n\n`;
}

export interface ModuleContextInput {
  id: string;
  label: string;
  description: string;
  dataframes?: Array<{ label?: string; rows: Record<string, unknown>[] }>;
  metrics?: Record<string, string | number>;
  charts?: Array<{ type?: string; label?: string; data: unknown }>;
  raw?: string;
}

/**
 * Assemble le contexte complet depuis plusieurs modules.
 * Tronque intelligemment si dépassement ~4000 tokens.
 */
export function buildFullContext(modules: ModuleContextInput[]): { text: string; estimatedTokens: number } {
  const parts: string[] = [];
  let totalTokens = 0;

  for (const mod of modules) {
    const section: string[] = [`## ${mod.label}\n${mod.description}\n`];
    if (mod.raw) section.push(mod.raw);
    if (mod.dataframes) {
      for (const df of mod.dataframes) {
        section.push(dataframeToText(df.rows, { maxRows: 30, label: df.label }));
      }
    }
    if (mod.metrics) section.push(metricsToText(mod.metrics, { label: "Métriques" }));
    if (mod.charts) {
      for (const ch of mod.charts) {
        section.push(chartToText(ch.data, { type: ch.type, label: ch.label }));
      }
    }
    const block = section.join("\n");
    const tokens = estimateTokens(block);
    if (totalTokens + tokens > MAX_TOKENS) {
      const remaining = MAX_TOKENS - totalTokens - 100;
      if (remaining > 50) {
        const words = block.split(/\s+/);
        const truncated = words.slice(0, Math.floor(remaining / 1.3)).join(" ");
        parts.push(`[${mod.label}]\n${truncated}\n… (tronqué)\n\n`);
        totalTokens += estimateTokens(truncated);
      }
      break;
    }
    parts.push(`[${mod.label}]\n${block}\n\n`);
    totalTokens += tokens;
  }

  const text = parts.join("\n");
  return { text, estimatedTokens: estimateTokens(text) };
}
