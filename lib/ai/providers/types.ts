export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIProvider {
  chat(messages: ChatMessage[], systemPrompt?: string): Promise<string>;
  chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    systemPrompt?: string
  ): Promise<void>;
  isAvailable(): Promise<boolean>;
  getModelName(): string;
  getProviderName(): string;
}

export type AIProviderType = "ollama" | "claude" | "openai" | "byok";

export interface AIProviderConfig {
  type: AIProviderType;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}
