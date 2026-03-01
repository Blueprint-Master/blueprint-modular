import { getProvider } from "@/lib/ai/providers";
import {
  BUILDER_SYSTEM_PROMPT,
  extractBuilderOutput,
  type BuilderOutput,
} from "./prompts";
import type { AIProviderConfig } from "@/lib/ai/providers/types";

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
}

export const builderAI = new BuilderAI();
export type { BuilderOutput };
