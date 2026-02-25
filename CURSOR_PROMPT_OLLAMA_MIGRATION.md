# 🔧 CURSOR PROMPT — Migration vLLM → Ollama (Qwen3:8b)
# Objectif : brancher Blueprint Modular sur Ollama local (VPS)
# Durée estimée : 30 minutes

---

## CONTEXTE

Blueprint Modular est un framework Next.js 14 + TypeScript + Prisma.
Le code IA existant est bien structuré mais pointe vers vLLM/Anthropic.
On migre vers **Ollama** qui tourne sur le VPS à `http://145.239.199.236:11434`.
Modèle actif : **qwen3:8b**

L'API Ollama est différente de vLLM sur 3 points :
- URL : `/api/chat` au lieu de `/v1/chat/completions`
- Format réponse non-stream : `data.message.content` au lieu de `data.choices[0].message.content`
- Format stream : JSON pur ligne par ligne, pas du SSE préfixé `data: `
- Health check : `/api/tags` au lieu de `/health`

---

## FICHIERS À MODIFIER — 3 FICHIERS SEULEMENT

### 1. `lib/ai/config.ts`

Remplace le contenu ENTIER par :

```typescript
/**
 * Configuration IA — Ollama local (Qwen3:8b).
 * AI_SERVER_URL dans .env pointe vers le VPS Ollama.
 * AI_MOCK=true pour développement sans serveur.
 */

export const AI_CONFIG = {
  baseUrl: process.env.AI_SERVER_URL ?? "http://localhost:11434",
  mock: process.env.AI_MOCK === "true",
  timeout: parseInt(process.env.AI_TIMEOUT ?? "120", 10) * 1000,
  maxRetries: parseInt(process.env.AI_MAX_RETRIES ?? "2", 10),
  model: process.env.AI_MODEL ?? "qwen3:8b",
} as const;
```

---

### 2. `lib/ai/vllm-client.ts`

Remplace le contenu ENTIER par la version ci-dessous.
⚠️ Ne pas renommer le fichier ni la classe — ils sont importés partout.
⚠️ Conserver les mocks existants tels quels.
⚠️ Corriger aussi l'encodage UTF-8 cassé (les Ã©, â€™, etc.) dans les strings mockées.

```typescript
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
      model: AI_CONFIG.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
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
          throw new Error(`Ollama ${res.status}: ${text.slice(0, 200)}`);
        }

        // Format réponse Ollama : { message: { role, content }, done: true }
        const data = (await res.json()) as {
          message?: { content?: string };
          done?: boolean;
        };
        const content = data.message?.content ?? "";
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
      model: AI_CONFIG.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
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

    if (!res.ok) throw new Error(`Ollama ${res.status}`);

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Garder la dernière ligne incomplète dans le buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            // Ollama stream : JSON pur, pas de préfixe "data: "
            const json = JSON.parse(line) as {
              message?: { content?: string };
              done?: boolean;
            };
            const text = json.message?.content ?? "";
            if (text) {
              full += text;
              onChunk(text);
            }
            if (json.done) break;
          } catch {
            // ignore les lignes non-JSON
          }
        }
      }
    }
    return full;
  }

  /**
   * GET /api/tags — vérifie qu'Ollama est disponible et liste les modèles.
   */
  async healthCheck(): Promise<VLLMHealthResult> {
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

      if (!res.ok) {
        return { available: false, latencyMs, error: `HTTP ${res.status}` };
      }

      // Ollama retourne { models: [{ name, model, ... }] }
      const data = (await res.json()) as {
        models?: Array<{ name: string; model: string }>;
      };

      // Trouver le modèle configuré dans la liste
      const configuredModel = AI_CONFIG.model;
      const found = data.models?.find(
        (m) => m.name === configuredModel || m.model === configuredModel
      );
      const model = found?.name ?? configuredModel;

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
```

---

### 3. `.env.local` (créer à la racine si inexistant)

Ajoute ou remplace ces variables :

```bash
# Ollama — VPS OVH
AI_SERVER_URL=http://145.239.199.236:11434
AI_MODEL=qwen3:8b
AI_MOCK=false
AI_TIMEOUT=120
AI_MAX_RETRIES=2
```

⚠️ Ne pas toucher aux autres variables existantes (ANTHROPIC_API_KEY, DATABASE_URL, NEXTAUTH_SECRET, etc.)

---

## CE QU'IL NE FAUT PAS MODIFIER

- `app/api/ai/chat/route.ts` — le routing provider_name="vllm" fonctionne déjà, ne pas toucher
- `app/api/ai/health/route.ts` — appelle déjà vllmClient.healthCheck(), ne pas toucher
- `components/ai/AIAssistant.tsx` — fonctionne déjà avec provider_name="vllm", ne pas toucher
- `lib/ai/prompt-templates.ts` — ne pas toucher
- `lib/ai/context-builder.ts` — ne pas toucher
- `lib/ai/module-registry.ts` — ne pas toucher
- Tout le reste du projet — ne pas toucher

---

## VÉRIFICATION APRÈS MODIFICATION

Lance le serveur de dev et vérifie ces 3 points dans l'ordre :

**1. Health check**
```
GET http://localhost:3000/api/ai/health
```
Doit retourner :
```json
{ "available": true, "model": "qwen3:8b", "latencyMs": <nombre> }
```

**2. Chat simple**
```
POST http://localhost:3000/api/ai/chat
Content-Type: application/json

{
  "message": "Bonjour, réponds en une phrase.",
  "provider_name": "vllm"
}
```
Doit retourner un stream SSE avec des chunks en français.

**3. Interface**
Ouvrir le dashboard → cliquer sur le bouton IA (✦) → vérifier :
- Le point de statut est vert
- Le modèle affiché est "qwen3:8b"
- Une question reçoit une réponse en français

---

## SI LE HEALTH CHECK ÉCHOUE

Vérifier dans l'ordre :
1. `AI_SERVER_URL` dans `.env.local` — doit être `http://145.239.199.236:11434`
2. Ollama tourne sur le VPS : `systemctl status ollama`
3. Le port n'est pas bloqué côté Next.js (appel serveur → serveur, pas besoin d'ouvrir le firewall)
4. Le modèle est bien téléchargé : `ollama list` sur le VPS

---

## RÉSULTAT ATTENDU

Après ces 3 modifications, Blueprint Modular sera entièrement connecté à Qwen3:8b via Ollama.
Zéro dépendance Anthropic pour l'assistant IA.
L'API Anthropic reste disponible en fallback via provider_name="claude" si besoin.
