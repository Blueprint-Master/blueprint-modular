import { ClaudeProvider } from "./claude";
import { OpenAIProvider } from "./openai";
import type { AIProvider, AIProviderConfig } from "./types";

export function createByokProvider(config: AIProviderConfig): AIProvider {
  if (config.type === "claude" || config.apiKey?.startsWith("sk-ant-")) {
    return new ClaudeProvider(config.apiKey, config.model);
  }
  return new OpenAIProvider(config.apiKey, config.model);
}
