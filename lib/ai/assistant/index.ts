import { getProvider } from "@/lib/ai/providers";
import { buildAssistantSystemPrompt, type UserContext } from "./prompts";
import type { BPMPageContext } from "@/lib/ai/context/types";
import type { AIProviderConfig } from "@/lib/ai/providers/types";

export class AssistantAI {
  private providerConfig?: AIProviderConfig;

  constructor(providerConfig?: AIProviderConfig) {
    this.providerConfig = providerConfig;
  }

  async chat(
    userMessage: string,
    userContext?: UserContext,
    pageContext?: BPMPageContext
  ): Promise<string> {
    const provider = getProvider(this.providerConfig);
    const systemPrompt = buildAssistantSystemPrompt(userContext, pageContext);
    return provider.chat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );
  }

  async stream(
    userMessage: string,
    onChunk: (chunk: string) => void,
    userContext?: UserContext,
    pageContext?: BPMPageContext
  ): Promise<void> {
    const provider = getProvider(this.providerConfig);
    const systemPrompt = buildAssistantSystemPrompt(userContext, pageContext);
    return provider.chatStream(
      [{ role: "user", content: userMessage }],
      onChunk,
      systemPrompt
    );
  }
}

export const assistantAI = new AssistantAI();
