/**
 * Pipeline d'analyse IA d'un contrat — appelle vLLM local.
 * Extraction de métadonnées structurées (JSON) depuis le texte du contrat.
 */

import { vllmClient } from "./vllm-client";
import { AI_CONFIG } from "./config";

export type ContractType = "supplier" | "cgv" | "other";

export interface ExtractedData {
  supplier_name?: string;
  buyer_name?: string;
  signatories?: Array<{ name: string; role: string; date?: string }>;
  contract_date?: string;
  start_date?: string;
  end_date?: string;
  renewal_date?: string;
  termination_notice_days?: number;
  waiver_deadline?: string;
  commitments?: Array<{
    type: string;
    description: string;
    amount?: number;
    currency?: string;
    deadline?: string;
    party_responsible: string;
  }>;
  payment_terms?: string;
  penalty_clauses?: string[];
  confidentiality?: boolean;
  exclusivity?: boolean;
  governing_law?: string;
  dispute_resolution?: string;
  executive_summary?: string;
  key_risks?: string[];
  key_opportunities?: string[];
  action_items?: Array<{ action: string; deadline?: string; owner: string }>;
  overall_risk_level?: "low" | "medium" | "high";
}

const MAX_TEXT_CHARS = 12000;

function buildExtractionPrompt(text: string, contractType: ContractType): string {
  const truncated = text.slice(0, MAX_TEXT_CHARS);
  return `Tu es un assistant spécialisé dans l'analyse de contrats. Extrais les informations structurées du contrat ci-dessous.

Type de contrat : ${contractType}

Retourne UNIQUEMENT un objet JSON valide (pas de texte avant ou après, pas de markdown) avec les champs suivants quand tu peux les identifier (sinon null ou [] selon le cas) :
- supplier_name (string)
- buyer_name (string)
- signatories (array de { name, role, date })
- contract_date, start_date, end_date, renewal_date (YYYY-MM-DD ou null)
- termination_notice_days (number)
- waiver_deadline (YYYY-MM-DD ou null)
- commitments (array de { type, description, amount?, currency?, deadline?, party_responsible })
- payment_terms (string)
- penalty_clauses (array de string)
- confidentiality, exclusivity (boolean)
- governing_law, dispute_resolution (string)
- executive_summary (string, 3-5 phrases)
- key_risks, key_opportunities (array de string)
- action_items (array de { action, deadline?, owner })
- overall_risk_level ("low" | "medium" | "high")

Document :
---
${truncated}
---`;
}

function parseJsonResponse(response: string): ExtractedData {
  const trimmed = response.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse LLM sans JSON valide");
  return JSON.parse(jsonMatch[0]) as ExtractedData;
}

export async function analyzeContract(
  contractText: string,
  contractType: ContractType
): Promise<ExtractedData> {
  const prompt = buildExtractionPrompt(contractText, contractType);
  const { content } = await vllmClient.chat(
    [{ role: "user", content: prompt }],
    { max_tokens: 4096 }
  );
  return parseJsonResponse(content);
}
