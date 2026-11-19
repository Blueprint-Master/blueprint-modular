/**
 * Client HTTP vers Ollama (zéro dépendance OpenAI).
 * Utilisé côté serveur (API routes Next.js uniquement).
 * En dev avec AI_MOCK=true, retourne des réponses mockées réalistes.
 */

import { AI_CONFIG } from "./config";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export interface VLLMChatOptions {
  timeout?: number;
  max_tokens?: number;
  /** Override du modèle Ollama (ex. qwen3:8b, mistral:7b). */
  model?: string;
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

/** Réponse mockée pour le développement sans serveur Ollama */
function mockChatResponse(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content ?? "";
  // Extraction de documents (Analyse de documents) : retourner un JSON valide pour que l'UI affiche des données en mode démo
  if (
    question.includes('"supplier"') &&
    question.includes('"client"') &&
    (question.includes("Document") || question.includes("extrait texte"))
  ) {
    return JSON.stringify({
      supplier: "Fournisseur exemple (mode démo)",
      client: "Client exemple (mode démo)",
      contract_date: "2025-01-15",
      signature_date: "2025-01-20",
      termination_date: "2026-01-19",
      summary: "Contrat type en mode démo. Configurez Ollama ou ANTHROPIC_API_KEY pour une analyse réelle.",
      key_points: ["Point clé 1 (démo)", "Point clé 2 (démo)"],
      commitments: ["Engagement exemple (démo)"],
    });
  }
  // Base contractuelle (analyse de contrat) : retourner un JSON valide pour éviter l'erreur 500 en mode démo
  if (
    question.includes("supplier_name") &&
    question.includes("executive_summary") &&
    (question.includes("Contrat à analyser") || question.includes("overall_risk_level"))
  ) {
    return JSON.stringify({
      supplier_name: "Fournisseur exemple (mode démo)",
      buyer_name: "Client exemple (mode démo)",
      contract_date: "2025-01-15",
      end_date: "2026-01-14",
      executive_summary: "Contrat type en mode démo. Configurez Ollama pour une analyse réelle.",
      key_risks: ["Risque exemple (démo)"],
      key_opportunities: ["Opportunité exemple (démo)"],
      overall_risk_level: "medium",
      commitments: [],
      signatories: [],
    });
  }
  if (question.includes("module") || question.includes("disponible")) {
    return `Voici les modules actuellement disponibles dans l'application : **Wiki** (documentation interne), **Documents** (contrats et analyses), **IA** (assistant conversationnel). Vous pouvez poser des questions sur les données de ces modules en les sélectionnant dans le panneau de contexte.`;
  }
  if (question.includes("contrat") || question.includes("contract")) {
    return `En mode mock, les données de contrats ne sont pas chargées. En production, l'assistant a accès aux métadonnées des contrats (fournisseur, dates, engagements, niveau de risque) pour répondre à vos questions.`;
  }
  return `Réponse mockée (AI_MOCK=true). Vous avez demandé : « ${question.slice(0, 80)}${question.length > 80 ? "…" : ""} ». Configurez AI_MOCK=false et pointez AI_SERVER_URL vers Ollama pour des réponses réelles.`;
}

export class VLLMClient {
  private baseUrl: string;
  private mock: boolean;
  private timeout: number;
  private maxRetries: number;

  constructor(options?: {
    baseUrl?: string;
    mock?: boolean;
    timeout?: number;
    maxRetries?: number;
  }) {
    this.baseUrl = options?.baseUrl ?? AI_CONFIG.baseUrl.replace(/\/$/, "");
    this.mock = options?.mock ?? AI_CONFIG.mock;
    this.timeout = options?.timeout ?? AI_CONFIG.timeout;
    this.maxRetries = options?.maxRetries ?? AI_CONFIG.maxRetries;
  }

  /**
   * POST /api/chat — chat Ollama sans streaming.
   * Retry x2 en cas d'erreur réseau.
   */
  async chat(
    messages: ChatMessage[],
    opts: VLLMChatOptions = {}
  ): Promise<{ content: string }> {
    const timeout = opts.timeout ?? this.timeout;

    if (this.mock) {
      await sleep(1200);
      return { content: mockChatResponse(messages) };
    }

    // Format Ollama : /api/chat
    const url = `${this.baseUrl}/api/chat`;
    const body = {
      model: opts.model ?? AI_CONFIG.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: { num_predict: opts.max_tokens },
    };

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeout),
        });

        if (!res.ok) {
          const text = await res.text();
          if (res.status === 404) {
            console.warn(`[vllm-client] Modèle introuvable dans Ollama (404): ${text.slice(0, 200)}`);
          }
          throw new Error(`Ollama ${res.status}: ${text.slice(0, 200)}`);
        }

        // Format réponse Ollama : { message: { role, content }, done: true }
        const data = (await res.json()) as {
          message?: { content?: string };
          done?: boolean;
        };
        const content = data.message?.content ?? "";
        if (!content.trim()) throw new Error("Ollama returned an empty response");
        return { content };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) await sleep(1000 * (attempt + 1));
      }
    }
    throw lastError ?? new Error("Ollama chat failed");
  }

  /**
   * Chat en streaming — Ollama envoie du JSON pur ligne par ligne.
   * Chaque ligne : { message: { content: "..." }, done: false }
   * Dernière ligne : { done: true }
   */
  async chatStream(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    opts: VLLMChatOptions = {}
  ): Promise<string> {
    const timeout = opts.timeout ?? this.timeout;

    if (this.mock) {
      await sleep(800);
      const content = mockChatResponse(messages);
      for (const word of content.split(/(\s+)/)) {
        onChunk(word);
        await sleep(20);
      }
      return content;
    }

    // Format Ollama streaming : /api/chat avec stream: true
    const url = `${this.baseUrl}/api/chat`;
    const body = {
      model: opts.model ?? AI_CONFIG.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      options: { num_predict: opts.max_tokens },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok || !res.body) throw new Error(`Ollama stream unavailable (HTTP ${res.status})`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = done ? "" : lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const chunk = JSON.parse(line);
          if (chunk.error) throw new Error("Ollama reported a stream error");
          const text = chunk.message?.content;
          if (typeof text === "string" && text.length) {
            full += text;
            onChunk(text);
          }
          if (chunk.done === true) return full;
        }
        if (done) throw new Error("Ollama stream ended before completion");
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }

  /**
   * GET /api/tags — vérifie qu'Ollama est disponible et liste les modèles.
   */
  async healthCheck(configuredModel: string = AI_CONFIG.model): Promise<VLLMHealthResult> {
    if (this.mock) {
      return { available: true, model: "mock (AI_MOCK=true)", latencyMs: 0 };
    }

    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Date.now() - start;

      if (!res.ok) return { available: false, error: `Ollama HTTP ${res.status}`, latencyMs };

      const data = (await res.json()) as { models?: Array<{ name?: string; model?: string }> };
      const normalize = (name: string) => name.includes(":") ? name : `${name}:latest`;
      const found = data.models?.some(entry =>
        [entry.name, entry.model].some(name => name && normalize(name) === normalize(configuredModel))
      );
      return { available: Boolean(found), model: configuredModel, latencyMs };
    } catch {
      return { available: false, model: configuredModel, latencyMs: Date.now() - start };
    }
  }
}

export const vllmClient = new VLLMClient();
