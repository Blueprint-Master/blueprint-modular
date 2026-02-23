/**
 * Client HTTP vers vLLM (zéro dépendance OpenAI).
 * Utilisé côté serveur (API routes). En dev avec AI_MOCK=true, retourne des réponses mockées.
 */

import { AI_CONFIG } from "./config";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export interface VLLMChatOptions {
  timeout?: number;
  max_tokens?: number;
}

export interface VLLMHealthResult {
  available: boolean;
  model?: string;
  latencyMs?: number;
  error?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Réponse mockée pour le développement sans serveur vLLM */
function mockChatResponse(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content ?? "";
  if (question.includes("module") || question.includes("disponible")) {
    return `Voici les modules actuellement disponibles dans l'application : **Wiki** (documentation interne), **Documents** (contrats et analyses), **IA** (assistant conversationnel). Vous pouvez poser des questions sur les données de ces modules en les sélectionnant dans le panneau de contexte.`;
  }
  if (question.includes("contrat") || question.includes("contract")) {
    return `En mode mock, les données de contrats ne sont pas chargées. En production, l'assistant aurait accès aux métadonnées des contrats (fournisseur, dates, engagements, niveau de risque) pour répondre à vos questions.`;
  }
  return `Réponse mockée (AI_MOCK=true). Vous avez demandé : « ${question.slice(0, 80)}${question.length > 80 ? "…" : ""} ». Configurez un serveur vLLM avec Mixtral pour des réponses réelles.`;
}

export class VLLMClient {
  private baseUrl: string;
  private mock: boolean;
  private timeout: number;
  private maxRetries: number;

  constructor(options?: { baseUrl?: string; mock?: boolean; timeout?: number; maxRetries?: number }) {
    this.baseUrl = options?.baseUrl ?? AI_CONFIG.baseUrl.replace(/\/$/, "");
    this.mock = options?.mock ?? AI_CONFIG.mock;
    this.timeout = options?.timeout ?? AI_CONFIG.timeout;
    this.maxRetries = options?.maxRetries ?? AI_CONFIG.maxRetries;
  }

  /**
   * POST /v1/chat/completions — chat avec streaming optionnel.
   * Retry x2 en cas d'erreur réseau.
   */
  async chat(
    messages: ChatMessage[],
    opts: VLLMChatOptions = {}
  ): Promise<{ content: string; stream?: ReadableStream<Uint8Array> }> {
    const timeout = opts.timeout ?? this.timeout;
    const max_tokens = opts.max_tokens ?? 4096;

    if (this.mock) {
      await sleep(1200);
      const content = mockChatResponse(messages);
      return { content };
    }

    const url = `${this.baseUrl}/v1/chat/completions`;
    const body = {
      model: AI_CONFIG.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens,
      stream: false,
    };

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(id);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`vLLM ${res.status}: ${text.slice(0, 200)}`);
        }
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content ?? "";
        return { content };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) await sleep(1000 * (attempt + 1));
      }
    }
    throw lastError ?? new Error("vLLM chat failed");
  }

  /**
   * Chat en streaming — retourne un ReadableStream pour SSE.
   */
  async chatStream(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    opts: VLLMChatOptions = {}
  ): Promise<string> {
    const timeout = opts.timeout ?? this.timeout;
    const max_tokens = opts.max_tokens ?? 4096;

    if (this.mock) {
      await sleep(800);
      const content = mockChatResponse(messages);
      for (const word of content.split(/(\s+)/)) {
        onChunk(word);
        await sleep(20);
      }
      return content;
    }

    const url = `${this.baseUrl}/v1/chat/completions`;
    const body = {
      model: AI_CONFIG.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens,
      stream: true,
    };

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`vLLM ${res.status}`);
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let full = "";
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6)) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const text = json.choices?.[0]?.delta?.content ?? "";
              if (text) {
                full += text;
                onChunk(text);
              }
            } catch {
              // ignore
            }
          }
        }
      }
    }
    return full;
  }

  /**
   * GET /health — vérifie que le serveur vLLM est disponible.
   */
  async healthCheck(): Promise<VLLMHealthResult> {
    if (this.mock) {
      return { available: true, model: "mock", latencyMs: 0 };
    }
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        return { available: false, latencyMs, error: `HTTP ${res.status}` };
      }
      let model = AI_CONFIG.model;
      try {
        const data = (await res.json()) as { model?: string };
        if (data.model) model = data.model;
      } catch {
        // ignore
      }
      return { available: true, model, latencyMs };
    } catch (err) {
      return {
        available: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

export const vllmClient = new VLLMClient();
