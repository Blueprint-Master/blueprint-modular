import { SYSTEM_PROMPT_BASE } from "@/lib/ai/prompt-templates";
import type { BPMPageContext } from "@/lib/ai/context/types";
import { getComputeTools } from "@/lib/compute";

export interface UserContext {
  name?: string;
  organization?: string;
  module?: string;
}

export function buildAssistantSystemPrompt(
  userContext?: UserContext,
  pageContext?: BPMPageContext
): string {
  const parts: string[] = [SYSTEM_PROMPT_BASE];

  if (userContext?.organization) {
    parts.push(`\nTu travailles pour ${userContext.organization}.`);
  }

  if (pageContext?.components?.length) {
    const componentSummary = pageContext.components
      .map((c) => {
        if (c.type === "metric") return `Métrique "${c.label}" : ${c.value}`;
        if (c.type === "table")
          return `Tableau "${c.label}" : ${(c.data as unknown[])?.length ?? 0} ligne(s)`;
        return `Composant ${c.type}${c.label ? ` "${c.label}"` : ""}`;
      })
      .join("\n");

    parts.push(
      `\nContexte de la page (${pageContext.module}) :\n---\n${componentSummary}\n---`
    );
  }

  parts.push(`\nTu analyses et conseilles — tu ne génères pas de code BPM.`);
  parts.push(`Tu réponds en Markdown structuré.`);

  const tools = getComputeTools();
  if (tools) {
    parts.push(`\nFonctions de calcul disponibles :\n${tools}`);
  }

  return parts.join("\n");
}
