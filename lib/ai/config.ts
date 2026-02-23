/**
 * Configuration IA — serveur vLLM local (Mixtral 8x7B).
 * Variable AI_SERVER_URL dans .env. En dev, AI_MOCK=true pour réponses mockées.
 */

export const AI_CONFIG = {
  baseUrl: process.env.AI_SERVER_URL ?? "http://localhost:8000",
  mock: process.env.AI_MOCK === "true",
  timeout: parseInt(process.env.AI_TIMEOUT ?? "120", 10) * 1000,
  maxRetries: parseInt(process.env.AI_MAX_RETRIES ?? "2", 10),
  model: process.env.AI_MODEL ?? "mixtral-8x7b-instruct",
} as const;
