import type { AIProvider, ChatMessage } from "./types";

export class OpenAIProvider implements AIProvider {
  private model: string;
  private apiKey: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.model = model ?? "gpt-4o";
  }

  getProviderName() {
    return "openai";
  }

  getModelName() {
    return this.model;
  }

  async isAvailable() {
    return !!this.apiKey;
  }

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    const msgs = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }, ...messages]
      : messages;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: this.model, messages: msgs }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenAI ${res.status}`);
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? "";
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    systemPrompt?: string
  ): Promise<void> {
    const msgs = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }, ...messages]
      : messages;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: this.model, messages: msgs, stream: true }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6);
        if (json === "[DONE]") return;
        try {
          const data = JSON.parse(json) as { choices?: Array<{ delta?: { content?: string } }> };
          const delta = data.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch {
          // ignore invalid JSON
        }
      }
    }
  }
}
