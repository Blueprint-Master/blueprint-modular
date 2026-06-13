import { getProvider } from "@/lib/ai/providers";
import {
  BUILDER_SYSTEM_PROMPT,
  extractBuilderOutput,
  type BuilderOutput,
} from "./prompts";
import type { AIProviderConfig } from "@/lib/ai/providers/types";
import { PRODUCTION_DASHBOARD_TEMPLATE } from "./templates/production-dashboard";
import type { BuilderSpec } from "./spec";
import { validateSpec } from "./spec";
import { SPEC_SYSTEM_PROMPT } from "./spec-prompt";

function parseSpecJson(raw: string): unknown {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  return JSON.parse(text) as unknown;
}

export class BuilderAI {
  private providerConfig?: AIProviderConfig;

  constructor(providerConfig?: AIProviderConfig) {
    this.providerConfig = providerConfig;
  }

  /**
   * Génère une Spec JSON à partir d'une description en langage naturel.
   * Retry une fois si le JSON est invalide.
   */
  async expandToSpec(prompt: string): Promise<BuilderSpec> {
    const provider = getProvider(this.providerConfig);
    let raw = await provider.chat(
      [{ role: "user", content: prompt }],
      SPEC_SYSTEM_PROMPT
    );
    let spec: unknown;
    try {
      spec = parseSpecJson(raw);
    } catch {
      spec = null;
    }
    if (!validateSpec(spec)) {
      raw = await provider.chat(
        [
          {
            role: "user",
            content: `Corrige ce JSON invalide et renvoie uniquement le JSON valide :\n${raw}`,
          },
        ],
        SPEC_SYSTEM_PROMPT
      );
      try {
        spec = parseSpecJson(raw);
      } catch {
        throw new Error("Spec generation failed");
      }
      if (!validateSpec(spec)) throw new Error("Spec generation failed");
    }
    const result = spec as BuilderSpec;
    if (!result.generated_at) {
      result.generated_at = new Date().toISOString();
    }
    return result;
  }

  async generate(userPrompt: string): Promise<BuilderOutput> {
    const provider = getProvider(this.providerConfig);
    const raw = await provider.chat(
      [{ role: "user", content: `Génère le code BPM pour : ${userPrompt}` }],
      BUILDER_SYSTEM_PROMPT
    );
    return extractBuilderOutput(raw);
  }

  /** Construit le prompt de génération de code à partir d'une Spec (plan). */
  private codePromptFromSpec(spec: BuilderSpec): string {
    return `Génère le code BPM pour cette application :
${JSON.stringify(spec, null, 2)}
Utilise uniquement les composants bpm.* listés dans la spec.`;
  }

  /**
   * Flux plan-first EN MÉMOIRE : génère d'abord la Spec (le plan) puis le code
   * bpm.*, et RETOURNE les deux sans aucune persistance ni déploiement.
   *
   * C'est le point de coupure « no-persist » du flux de génération (équivalent
   * d'un buildApp qui renvoie code+plan avant toute écriture DB / deploy) :
   * aucune écriture Prisma, aucun GeneratedApp.create/update, aucun export.
   * Le plan (spec) est renvoyé à l'appelant qui décide de l'exposer ou non.
   */
  async buildFromPrompt(
    userPrompt: string
  ): Promise<{ output: BuilderOutput; spec: BuilderSpec }> {
    const spec = await this.expandToSpec(userPrompt);
    const provider = getProvider(this.providerConfig);
    const raw = await provider.chat(
      [{ role: "user", content: this.codePromptFromSpec(spec) }],
      BUILDER_SYSTEM_PROMPT
    );
    return { output: extractBuilderOutput(raw), spec };
  }

  async stream(
    userPrompt: string,
    onChunk: (chunk: string) => void,
    options?: { onSpec?: (spec: BuilderSpec) => void }
  ): Promise<void> {
    const spec = await this.expandToSpec(userPrompt);
    options?.onSpec?.(spec);
    const provider = getProvider(this.providerConfig);
    return provider.chatStream(
      [{ role: "user", content: this.codePromptFromSpec(spec) }],
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
export type { BuilderOutput } from "./prompts";
export type { BuilderSpec } from "./spec";
