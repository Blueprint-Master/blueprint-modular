/**
 * Types partagés (route API ↔ page client) de la démo « Built for AI » + snapshot de repli.
 *
 * Ce module NE dépend PAS de lib/mcp/registry (donc safe pour le bundle client) : il ne
 * porte que des types et une réponse PRÉ-CAPTURÉE réelle de suggest_composition, servant
 * de filet de sécurité si la route API est indisponible — la page de différenciation ne
 * doit jamais casser devant un visiteur (read-only de bout en bout).
 *
 * Le snapshot FALLBACK_RESULT a été capturé tel quel depuis la vraie logique d'outil
 * (lib/mcp/registry.suggestComposition) pour le prompt canonique de démonstration.
 */

/** Couche sémantique jointe à chaque suggestion (le POURQUOI du composant). */
export interface DemoMeaning {
  role: string;
  frame: string;
  indicatorType?: string[];
  directionality?: string;
  use: string;
  pairWith: string[];
  status: string;
}

/** Une suggestion enrichie : donnée catalogue + vérification barrel + sens. */
export interface DemoSuggestion {
  /** Nom public, ex. "bpm.statusTracker". */
  name: string;
  /** Clé normalisée (sans préfixe, minuscule) pour le rendu live. */
  slug: string;
  category: string;
  description: string;
  /** Tokens du besoin auxquels le composant répond. */
  why: string;
  /** true si get_component a confirmé l'existence du composant dans le barrel. */
  verified: boolean;
  meaning: DemoMeaning | null;
}

/** Résultat de suggest_composition, mis en forme pour la page. */
export interface DemoResult {
  need: string;
  count: number;
  suggestions: DemoSuggestion[];
}

/** Réponse de la route /api/built-for-ai/suggest. */
export interface SuggestResponse {
  ok: true;
  /** "mcp-registry" = vraie logique d'outil en direct ; "fallback" = snapshot pré-capturé. */
  source: "mcp-registry" | "fallback";
  tool: "suggest_composition";
  request: { need: string; limit: number };
  result: DemoResult;
}

/** Prompt canonique de la démonstration (cf. mission). */
export const DEMO_PROMPT = "un dashboard de suivi de commandes";

/**
 * Snapshot RÉEL de suggest_composition(DEMO_PROMPT, 8) — capturé depuis lib/mcp/registry.
 * Sert de repli côté client si la route API échoue. Ne pas éditer à la main : régénérer
 * via la route ou un appel direct à suggestComposition si le scoring évolue.
 */
export const FALLBACK_RESULT: DemoResult = {
  need: "un dashboard de suivi de commandes",
  count: 8,
  suggestions: [
    {
      name: "bpm.statusTracker",
      slug: "statustracker",
      category: "Affichage de données",
      description: "Suivi de statut réel (barre, étapes completed/current/pending/error).",
      why: "Correspond à : suivi, commandes",
      verified: true,
      meaning: {
        role: "indicateur",
        frame: "workflow",
        indicatorType: ["progression", "statut"],
        directionality: "borne-cible",
        use: "Position réelle d'une instance dans un processus à étapes normées (commande, dossier) : completed/current/pending/error.",
        pairWith: ["bpm.timeline", "bpm.badge", "bpm.card"],
        status: "proposed",
      },
    },
    {
      name: "bpm.commandPalette",
      slug: "commandpalette",
      category: "Navigation",
      description: "Palette de commandes modale (fuzzy, clavier, Cmd+K).",
      why: "Correspond à : commandes",
      verified: true,
      meaning: {
        role: "navigation",
        frame: "section",
        use: "Accès clavier universel (Cmd+K) aux commandes et destinations : recherche floue sur tout ce que l'app sait faire.",
        pairWith: ["bpm.topNav", "bpm.pageLayout"],
        status: "proposed",
      },
    },
    {
      name: "bpm.metric",
      slug: "metric",
      category: "Affichage de données",
      description: "Métrique avec valeur, label et delta.",
      why: "Correspond à : dashboard",
      verified: true,
      meaning: {
        role: "indicateur",
        frame: "kpi",
        indicatorType: ["scalaire-kpi", "monetaire", "compte", "taux"],
        directionality: "contextuel",
        use: "KPI scalaire en tête de dashboard : une valeur qui porte un jugement (delta, repère via context, tendance via trajectoire).",
        pairWith: ["bpm.metricRow", "bpm.lineChart", "bpm.badge"],
        status: "proposed",
      },
    },
    {
      name: "bpm.codeBlock",
      slug: "codeblock",
      category: "Utilitaires",
      description: "Bloc de code avec Copier.",
      why: "Correspond à : commandes",
      verified: true,
      meaning: {
        role: "affichage",
        frame: "section",
        use: "Montrer du code ou une commande à copier : extrait figé, exemple d'intégration.",
        pairWith: ["bpm.markdown", "bpm.tabs"],
        status: "proposed",
      },
    },
    {
      name: "bpm.badge",
      slug: "badge",
      category: "Affichage de données",
      description: "Badge / étiquette (success, warning, etc.).",
      why: "Correspond à : suivi",
      verified: true,
      meaning: {
        role: "indicateur",
        frame: "workflow",
        indicatorType: ["statut"],
        directionality: "neutre",
        use: "Statut ponctuel d'une instance : valeur d'énumération (WorkflowState) dont la couleur porte la sémantique d'état.",
        pairWith: ["bpm.table", "bpm.card", "bpm.timeline"],
        status: "proposed",
      },
    },
    {
      name: "bpm.stepper",
      slug: "stepper",
      category: "Navigation",
      description: "Progression multi-étapes (horizontal/vertical, tailles sm/md/lg).",
      why: "Correspond à : suivi",
      verified: true,
      meaning: {
        role: "navigation",
        frame: "workflow",
        use: "Situer l'utilisateur dans un parcours linéaire à étapes (assistant, onboarding) et matérialiser l'étape courante.",
        pairWith: ["bpm.wizardForm", "bpm.button"],
        status: "proposed",
      },
    },
    {
      name: "bpm.timeline",
      slug: "timeline",
      category: "Affichage de données",
      description: "Frise chronologique (événements ISO, groupement par date, fil vertical).",
      why: "Correspond à : suivi",
      verified: true,
      meaning: {
        role: "affichage",
        frame: "event",
        use: "Historique ordonné d'événements datés : audit d'une instance, jalons d'un dossier.",
        pairWith: ["bpm.badge", "bpm.card", "bpm.statusTracker"],
        status: "needs-curation",
      },
    },
    {
      name: "bpm.wizardForm",
      slug: "wizardform",
      category: "Interaction",
      description: "Formulaire multi-étapes avec stepper et validation.",
      why: "Correspond à : suivi",
      verified: true,
      meaning: {
        role: "saisie",
        frame: "entity",
        use: "Création/édition guidée en plusieurs étapes validées : formulaire long découpé en séquence logique.",
        pairWith: ["bpm.stepper", "bpm.input", "bpm.selectbox", "bpm.confirmModal"],
        status: "proposed",
      },
    },
  ],
};
