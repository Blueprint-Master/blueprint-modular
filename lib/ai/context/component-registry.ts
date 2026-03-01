import type { BPMComponentContext, BPMPageContext } from "./types";

class BPMComponentRegistry {
  private components = new Map<string, BPMComponentContext>();
  private currentModule = "app";
  private currentPageTitle = "";

  register(ctx: BPMComponentContext): void {
    this.components.set(ctx.id, ctx);
  }

  unregister(id: string): void {
    this.components.delete(id);
  }

  update(id: string, partial: Partial<BPMComponentContext>): void {
    const existing = this.components.get(id);
    if (existing) this.components.set(id, { ...existing, ...partial });
  }

  setModule(module: string, pageTitle?: string): void {
    this.currentModule = module;
    this.currentPageTitle = pageTitle ?? "";
  }

  getPageContext(): BPMPageContext {
    return {
      module: this.currentModule,
      pageTitle: this.currentPageTitle,
      components: Array.from(this.components.values()),
      timestamp: new Date().toISOString(),
    };
  }

  buildSystemPromptContext(): string {
    const ctx = this.getPageContext();
    if (!ctx.components.length) return "";

    const lines: string[] = [
      `--- Contexte de la page (${ctx.module}${ctx.pageTitle ? ` — ${ctx.pageTitle}` : ""}) ---`,
    ];

    for (const c of ctx.components) {
      if (c.type === "metric") {
        lines.push(`Métrique "${c.label}" : ${c.value}`);
      } else if (c.type === "table") {
        const rows = (c.data as unknown[])?.length ?? 0;
        const cols = c.metadata?.columns as string[] | undefined;
        lines.push(
          `Tableau "${c.label}" : ${rows} ligne(s)${cols ? `, colonnes: ${cols.join(", ")}` : ""}`
        );
      } else if (c.type === "chart") {
        lines.push(`Graphique "${c.label}" (${c.metadata?.chartType ?? "type inconnu"})`);
      } else if (c.type === "panel") {
        lines.push(`Panneau "${c.label}"`);
      } else if (c.label) {
        lines.push(`Composant ${c.type} "${c.label}"`);
      }
    }

    lines.push("---");
    return lines.join("\n");
  }
}

export const bpmComponentRegistry = new BPMComponentRegistry();
