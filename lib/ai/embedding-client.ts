/**
 * Client pour les embeddings Qwen3-embedding:4b
 * Utilisé pour la recherche sémantique sur contrats et wiki
 */

const OLLAMA_URL = process.env.AI_SERVER_URL ?? "http://localhost:11434";
const EMBEDDING_MODEL = process.env.AI_EMBEDDING_MODEL ?? "qwen3-embedding:4b";

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

/**
 * Génère un vecteur d'embedding pour un texte donné.
 * Utilisé pour indexer et rechercher dans le corpus contractuel.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: text.slice(0, 8000), // Limite de contexte
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new Error(`Embedding error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as { embedding: number[] };
  return data.embedding;
}

/**
 * Génère des embeddings pour plusieurs textes (batch).
 * Délai de 100ms entre chaque appel pour ne pas saturer le VPS.
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  onProgress?: (current: number, total: number) => void
): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    embeddings.push(await generateEmbedding(texts[i]));
    onProgress?.(i + 1, texts.length);
    if (i < texts.length - 1) await new Promise((r) => setTimeout(r, 100));
  }
  return embeddings;
}

/**
 * Calcule la similarité cosinus entre deux vecteurs.
 * Retourne un score entre 0 (aucune similarité) et 1 (identiques).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}
