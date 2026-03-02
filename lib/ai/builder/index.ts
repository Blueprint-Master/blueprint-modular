import { getProvider } from "@/lib/ai/providers";
import {
  BUILDER_SYSTEM_PROMPT,
  extractBuilderOutput,
  type BuilderOutput,
} from "./prompts";
import type { AIProviderConfig } from "@/lib/ai/providers/types";
import { PRODUCTION_DASHBOARD_TEMPLATE } from "./templates/production-dashboard";

export class BuilderAI {
  private providerConfig?: AIProviderConfig;

  constructor(providerConfig?: AIProviderConfig) {
    this.providerConfig = providerConfig;
  }

  async generate(userPrompt: string): Promise<BuilderOutput> {
    const provider = getProvider(this.providerConfig);
    const raw = await provider.chat(
      [{ role: "user", content: `Génère le code BPM pour : ${userPrompt}` }],
      BUILDER_SYSTEM_PROMPT
    );
    return extractBuilderOutput(raw);
  }

  async stream(
    userPrompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const provider = getProvider(this.providerConfig);
    return provider.chatStream(
      [{ role: "user", content: `Génère le code BPM pour : ${userPrompt}` }],
      onChunk,
      BUILDER_SYSTEM_PROMPT
    );
  }

  /**
   * Génère du code BPM à partir d'un template de domaine (ex. production).
   * Si domain === 'production', utilise le template dashboard production comme base
   * et adapte selon le prompt utilisateur plutôt que de générer from scratch.
   */
  async generateFromTemplate(
    domain: string,
    userPrompt: string
  ): Promise<BuilderOutput> {
    if (domain === "production") {
      const provider = getProvider(this.providerConfig);
      const systemPrompt = `${BUILDER_SYSTEM_PROMPT}

Template de base production (adapter selon le prompt utilisateur, ne pas recopier tel quel) :
${PRODUCTION_DASHBOARD_TEMPLATE}`;
      const raw = await provider.chat(
        [{ role: "user", content: `Adapte le dashboard production pour : ${userPrompt}` }],
        systemPrompt
      );
      return extractBuilderOutput(raw);
    }
    return this.generate(userPrompt);
  }
}

export const builderAI = new BuilderAI();
export type { BuilderOutput };
