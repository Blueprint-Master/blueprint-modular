/**
 * Pipeline d'analyse IA d'un contrat — appelle Ollama (VLLMClient).
 * Extraction de métadonnées structurées (JSON) depuis le texte du contrat.
 * Règle : analyse à l'upload uniquement ; résultat stocké en base (extracted_data).
 */

import { vllmClient } from "./vllm-client";
import { TEMPLATE_ANALYSE_CONTRAT } from "./prompt-templates";

import { z } from "zod";

export type ContractType = "supplier" | "cgv" | "other";

const optionalText = z.string().nullish();
const extractedSchema = z.object({
  executive_summary: z.string().trim().min(1),
  overall_risk_level: z.enum(["low", "medium", "high"]).nullish(),
  supplier_name: optionalText, buyer_name: optionalText,
  contract_date: optionalText, start_date: optionalText, end_date: optionalText,
  renewal_date: optionalText, termination_date: optionalText, waiver_deadline: optionalText,
  termination_notice_days: z.number().int().nonnegative().nullish(),
  payment_terms: optionalText, governing_law: optionalText, dispute_resolution: optionalText,
  confidentiality: z.boolean().nullish(), exclusivity: z.boolean().nullish(),
  penalty_clauses: z.array(z.string()).nullish(),
  key_risks: z.array(z.string()).nullish(), key_opportunities: z.array(z.string()).nullish(),
  signatories: z.array(z.object({ name: z.string(), role: optionalText, date: optionalText })).nullish(),
  commitments: z.array(z.object({
    type: optionalText, description: z.string(), amount: z.number().nullish(),
    currency: optionalText, deadline: optionalText, party_responsible: optionalText,
  })).nullish(),
  action_items: z.array(z.object({ action: z.string(), deadline: optionalText, owner: optionalText })).nullish(),
});
export type ExtractedData = z.infer<typeof extractedSchema>;

const MAX_TEXT_CHARS = 12000;

/** Pattern de parsing robuste — extrait le JSON même si le LLM ajoute du texte */
function extractJSON(response: string): string {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Pas de JSON trouvé dans la réponse");
  return response.slice(start, end + 1);
}

export async function analyzeContract(
  contractText: string,
  contractType: ContractType
): Promise<ExtractedData> {
  if (!contractText.trim()) throw new Error("Aucun texte à analyser");
  const truncated = contractText.slice(0, MAX_TEXT_CHARS);
  const prompt = TEMPLATE_ANALYSE_CONTRAT({ contractText: truncated, contractType });
  const { content } = await vllmClient.chat([{ role: "user", content: prompt }], { max_tokens: 4096 });
  return extractedSchema.parse(JSON.parse(extractJSON(content)));
}
