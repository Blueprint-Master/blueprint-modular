import { AI_CONFIG } from "@/lib/ai/config";
import { vllmClient } from "@/lib/ai/vllm-client";
import type { AIProvider, ChatMessage } from "./types";

export class OllamaProvider implements AIProvider {
  private modelOverride?: string;

  constructor(model?: string) {
    this.modelOverride = model;
  }

  getProviderName() {
    return "ollama";
  }

  getModelName() {
    return this.modelOverride ?? AI_CONFIG.model;
  }

  async isAvailable() {
    const result = await vllmClient.healthCheck();
    return result.available;
  }

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    const msgs = systemPrompt
      ? ([{ role: "system" as const, content: systemPrompt }, ...messages] as ChatMessage[])
      : messages;
    const result = await vllmClient.chat(msgs, this.modelOverride ? { model: this.modelOverride } : {});
    return result.content;
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    systemPrompt?: string
  ): Promise<void> {
    const msgs = systemPrompt
      ? ([{ role: "system" as const, content: systemPrompt }, ...messages] as ChatMessage[])
      : messages;
    await vllmClient.chatStream(msgs, onChunk, this.modelOverride ? { model: this.modelOverride } : {});
  }
}
