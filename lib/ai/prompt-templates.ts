/**
 * Templates de prompts — français, adaptés au contexte métier Blueprint Modular.
 */

export const SYSTEM_PROMPT_BASE = `Tu es un assistant IA intégré à Blueprint Modular, un framework de gestion d'entreprise. Tu as accès aux données en temps réel de l'application. Tu réponds en français, de manière précise et structurée. Tu ne fais jamais d'hypothèses sur des données que tu n'as pas reçues.`;

export function SYSTEM_PROMPT_WITH_CONTEXT(context: string): string {
  return `${SYSTEM_PROMPT_BASE}

Voici les données des modules actuellement sélectionnés (à utiliser pour répondre aux questions) :

---
${context}
---

Utilise uniquement ces données pour répondre. Si la question porte sur des informations absentes du contexte, indique-le clairement.`;
}

export const templates = {
  analyse_donnees: ({ context, question }: { context: string; question: string }) =>
    `Contexte :\n${context}\n\nQuestion : ${question}\n\nAnalyse les données ci-dessus et réponds de façon structurée.`,
  synthese_executive: ({ context, question }: { context: string; question: string }) =>
    `Contexte :\n${context}\n\nQuestion : ${question}\n\nProduis une synthèse executive en 3 à 5 points.`,
  recommandations: ({ context, question }: { context: string; question: string }) =>
    `Contexte :\n${context}\n\nQuestion : ${question}\n\nDonne des recommandations concrètes et priorisées.`,
};
