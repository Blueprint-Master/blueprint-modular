import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ChatMessage } from "./types";

export class ClaudeProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.client = new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY });
    this.model = model ?? "claude-sonnet-4-20250514";
  }

  getProviderName() {
    return "claude";
  }

  getModelName() {
    return this.model;
  }

  async isAvailable() {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    const filtered = messages.filter((m) => m.role !== "system");
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt ?? undefined,
      messages: filtered.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    });
    const block = response.content[0];
    return block?.type === "text" ? block.text : "";
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    systemPrompt?: string
  ): Promise<void> {
    const filtered = messages.filter((m) => m.role !== "system");
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt ?? undefined,
      messages: filtered.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      stream: true,
    });

    for await (const event of response) {
      if (
        event.type === "content_block_delta" &&
        "delta" in event &&
        typeof (event as { delta?: { text?: string } }).delta?.text === "string"
      ) {
        const chunk = (event as { delta: { text: string } }).delta.text;
        onChunk(chunk);
      }
    }
  }
}
