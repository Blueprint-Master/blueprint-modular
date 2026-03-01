import { ClaudeProvider } from "./claude";
import { OllamaProvider } from "./ollama";
import { OpenAIProvider } from "./openai";
import { createByokProvider } from "./byok";
import type { AIProvider, AIProviderConfig } from "./types";

export function getProvider(config?: AIProviderConfig): AIProvider {
  // 1. BYOK — clé fournie explicitement
  if (config?.apiKey) {
    return createByokProvider({ ...config, type: config.type ?? "byok" });
  }

  // 2. Type demandé par la config (ex. body provider_name)
  if (config?.type === "claude") return new ClaudeProvider();
  if (config?.type === "openai") return new OpenAIProvider();
  if (config?.type === "ollama") return new OllamaProvider(config.model);

  // 3. Variable d'environnement AI_PROVIDER
  const envProvider = process.env.AI_PROVIDER;
  if (envProvider === "claude") return new ClaudeProvider();
  if (envProvider === "openai") return new OpenAIProvider();

  // 4. Fallback Ollama
  return new OllamaProvider();
}

export type { AIProvider, AIProviderConfig, ChatMessage, AIProviderType } from "./types";
