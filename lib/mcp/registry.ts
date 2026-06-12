/**
 * Accès read-only au catalogue de composants Blueprint Modular pour le connecteur MCP.
 *
 * Source de vérité : lib/generated/mcp-registry.json — fichier GÉNÉRÉ
 * (voir scripts/generate-mcp-registry.mjs) à partir de bpm-components.json + llms.txt.
 * Aucune donnée n'est dupliquée à la main ici.
 *
 * HYGIÈNE DES SORTIES : les fonctions publiques ne renvoient QUE de la donnée
 * catalogue (nom, catégorie, description, props, exemple, associés/parents).
 * Aucun identifiant interne (slug), chemin de fichier, timestamp ou champ debug
 * n'est exposé. L'index de recherche `_haystack` reste strictement interne.
 */
import registry from "@/lib/generated/mcp-registry.json";
import type { ComponentSemantics } from "@/lib/semantics/types";

export interface BpmComponent {
  slug: string;
  name: string;
  description: string;
  category: string;
  fullDescription?: string;
  props?: string;
  example?: string;
  associated?: string[];
  parent?: string[];
  /**
   * Couche sémantique (rôle, frame Ω, indicateur, guidance agent) — valeurs
   * PROPOSÉES par la boucle, curées par l'humain (champ status). Source :
   * lib/semantics/bpm-semantics.json, fusionnée par generate-mcp-registry.mjs.
   */
  semantics?: ComponentSemantics;
  /** Index de recherche pré-calculé (tout en minuscules). Interne — jamais exposé. */
  _haystack: string;
}

// `unknown` d'abord : le JSON généré élargit les unions littérales de ComponentSemantics.
const COMPONENTS = registry.components as unknown as BpmComponent[];

export const CATEGORIES: string[] = registry.categories;
export const TOTAL: number = registry.total;

/** Plafonds de pagination — bornent la taille (et donc les tokens) de chaque réponse. */
export const LIST_PAGE_SIZE = 25;
export const SEARCH_PAGE_SIZE = 15;
export const SUGGEST_MAX = 12;
export const SUGGEST_DEFAULT = 8;

/** Erreur applicative actionnable : message clair + indication pour rebondir. */
export class RegistryError extends Error {
  hint?: string;
  constructor(message: string, hint?: string) {
    super(message);
    this.name = "RegistryError";
    this.hint = hint;
  }
}

/** Normalise un nom fourni par l'utilisateur : "bpm.Metric", "Metric", "metric" → "metric". */
function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^bpm\./, "");
}

// ---------------------------------------------------------------------------
// Curseurs opaques (pagination stateless)
// ---------------------------------------------------------------------------

/** Encode un offset en curseur opaque base64url. */
function encodeCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ o: offset }), "utf-8").toString("base64url");
}

/** Décode un curseur. Retourne 0 si absent. Lève RegistryError si invalide. */
function decodeCursor(cursor?: string): number {
  if (cursor === undefined || cursor === null || cursor === "") return 0;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
    const o = parsed?.o;
    if (typeof o !== "number" || !Number.isInteger(o) || o < 0) throw new Error("bad");
    return o;
  } catch {
    throw new RegistryError(
      "Curseur de pagination invalide.",
      "Relancez l'outil sans le paramètre 'cursor' pour repartir du début.",
    );
  }
}

// ---------------------------------------------------------------------------
// Vues publiques (sortie nettoyée)
// ---------------------------------------------------------------------------

/** Résumé court (une ligne) — utilisé pour les listes paginées. Aucun champ interne. */
export interface ComponentSummary {
  name: string;
  category: string;
  description: string;
}

function summarize(c: BpmComponent): ComponentSummary {
  return { name: c.name, category: c.category, description: c.description };
}

/** Récupère un composant par nom (insensible au préfixe bpm. et à la casse). */
export function getComponent(name: string): BpmComponent | undefined {
  const n = normalizeName(name);
  return COMPONENTS.find(
    (c) => c.slug.toLowerCase() === n || c.name.toLowerCase().replace(/^bpm\./, "") === n,
  );
}

/** Détail public d'un composant — donnée catalogue + couche sémantique. */
export function componentDetail(c: BpmComponent) {
  return {
    name: c.name,
    category: c.category,
    description: c.fullDescription || c.description,
    props: c.props ?? "(props non documentées dans le registre)",
    example: c.example ?? null,
    associated: c.associated ?? [],
    parent: c.parent ?? [],
    semantics: c.semantics ?? null,
    import: "import { bpm } from '@blueprint-modular/core'",
  };
}

// ---------------------------------------------------------------------------
// list_components
// ---------------------------------------------------------------------------

export interface ListResult {
  category: string | null;
  categories: string[];
  total: number;
  returned: number;
  components: ComponentSummary[];
  nextCursor?: string;
}

/**
 * Liste paginée (curseur) des composants, filtrable par catégorie.
 * @throws RegistryError si la catégorie est inconnue ou le curseur invalide.
 */
export function listComponents(opts: { category?: string; cursor?: string }): ListResult {
  const offset = decodeCursor(opts.cursor);

  let filtered = COMPONENTS;
  let matchedCategory: string | null = null;
  if (opts.category && opts.category.trim()) {
    const q = opts.category.trim().toLowerCase();
    const found =
      CATEGORIES.find((c) => c.toLowerCase() === q) ||
      CATEGORIES.find((c) => c.toLowerCase().includes(q));
    if (!found) {
      throw new RegistryError(
        `Catégorie inconnue : "${opts.category}".`,
        `Catégories valides : ${CATEGORIES.join(", ")}. Ou appelez list_components sans 'category'.`,
      );
    }
    matchedCategory = found;
    filtered = COMPONENTS.filter((c) => c.category === found);
  }

  const total = filtered.length;
  const page = filtered.slice(offset, offset + LIST_PAGE_SIZE);
  const nextOffset = offset + page.length;

  return {
    category: matchedCategory,
    categories: CATEGORIES,
    total,
    returned: page.length,
    components: page.map(summarize),
    ...(nextOffset < total ? { nextCursor: encodeCursor(nextOffset) } : {}),
  };
}

// ---------------------------------------------------------------------------
// Moteur de score (recherche + suggestion)
// ---------------------------------------------------------------------------

// Mots vides FR/EN : sans valeur discriminante, ils pollueraient le scoring par sous-chaîne.
const STOPWORDS = new Set([
  "un", "une", "des", "du", "de", "le", "la", "les", "et", "ou", "à", "au", "aux",
  "avec", "sans", "pour", "dans", "sur", "par", "en", "qui", "que", "quoi", "dont",
  "ce", "cet", "cette", "ces", "se", "sa", "son", "ses", "mon", "ma", "mes", "nos",
  "vos", "leur", "leurs", "est", "sont", "être", "avoir", "fait", "faire", "plus",
  "comme", "afin", "the", "and", "for", "with", "that", "this", "from", "into",
  "your", "you", "are", "use", "using",
]);

/** Découpe une requête en tokens significatifs (>= 3 caractères, hors mots vides). */
function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-zàâäéèêëîïôöùûüç0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/** Variantes d'un token pour un match tolérant au pluriel FR/EN (métriques → métrique). */
function tokenVariants(t: string): string[] {
  const variants = new Set([t]);
  if (t.endsWith("s") && t.length > 3) variants.add(t.slice(0, -1));
  if (t.endsWith("x") && t.length > 3) variants.add(t.slice(0, -1));
  return [...variants];
}

function fieldMatches(field: string, token: string): boolean {
  return tokenVariants(token).some((v) => field.includes(v));
}

/** Texte sémantique d'un composant (sens : rôle, frame Ω, types, guidance). */
function semanticText(c: BpmComponent): string {
  const s = c.semantics;
  if (!s) return "";
  return [
    s.semanticRole,
    s.frame,
    ...(s.indicator
      ? [...s.indicator.indicatorType, s.indicator.directionality, s.indicator.temporality]
      : []),
    s.agentGuidance.use,
    ...s.agentGuidance.pairWith,
    ...s.contextHints,
  ]
    .join(" ")
    .toLowerCase();
}

/** Index sémantique pré-calculé : la signification pèse plus que le simple tag. */
const SEM_TEXT = new Map<string, string>(COMPONENTS.map((c) => [c.slug, semanticText(c)]));

interface Scored {
  c: BpmComponent;
  score: number;
  matched: string[];
}

function scoreComponents(query: string): Scored[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const results: Scored[] = [];
  for (const c of COMPONENTS) {
    const nameL = c.name.toLowerCase();
    const descL = c.description.toLowerCase();
    const catL = c.category.toLowerCase();
    const semL = SEM_TEXT.get(c.slug) ?? "";
    let score = 0;
    const matched: string[] = [];

    for (const t of tokens) {
      let hit = false;
      if (fieldMatches(nameL, t)) {
        score += 6;
        hit = true;
      }
      if (fieldMatches(semL, t)) {
        score += 4;
        hit = true;
      }
      if (fieldMatches(descL, t)) {
        score += 3;
        hit = true;
      }
      if (fieldMatches(catL, t)) {
        score += 2;
        hit = true;
      }
      if (!hit && fieldMatches(c._haystack, t)) {
        score += 1;
        hit = true;
      }
      if (hit) matched.push(t);
    }

    if (score > 0) results.push({ c, score, matched });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

// ---------------------------------------------------------------------------
// search_components
// ---------------------------------------------------------------------------

export interface SearchResult {
  query: string;
  total: number;
  returned: number;
  results: Array<ComponentSummary & { matched: string[] }>;
  nextCursor?: string;
}

/**
 * Recherche pertinente paginée (curseur) sur nom / description / catégorie / tags.
 * @throws RegistryError si la requête est vide ou le curseur invalide.
 */
export function searchComponents(query: string, cursor?: string): SearchResult {
  const q = (query ?? "").trim();
  if (!q) {
    throw new RegistryError(
      "Requête de recherche vide.",
      "Fournissez des termes dans 'query' (ex. 'tableau triable', 'graphique').",
    );
  }
  const offset = decodeCursor(cursor);
  const scored = scoreComponents(q);
  const total = scored.length;
  const page = scored.slice(offset, offset + SEARCH_PAGE_SIZE);
  const nextOffset = offset + page.length;

  return {
    query: q,
    total,
    returned: page.length,
    results: page.map((s) => ({ ...summarize(s.c), matched: s.matched })),
    ...(nextOffset < total ? { nextCursor: encodeCursor(nextOffset) } : {}),
  };
}

// ---------------------------------------------------------------------------
// suggest_composition
// ---------------------------------------------------------------------------

/** Résumé sémantique joint à chaque suggestion : le POURQUOI du composant, pas son rendu. */
export interface SuggestionMeaning {
  role: string;
  frame: string;
  indicatorType?: string[];
  directionality?: string;
  use: string;
  pairWith: string[];
  status: string;
}

export interface SuggestResult {
  need: string;
  count: number;
  suggestions: Array<ComponentSummary & { why: string; meaning?: SuggestionMeaning }>;
}

function meaningOf(c: BpmComponent): SuggestionMeaning | undefined {
  const s = c.semantics;
  if (!s) return undefined;
  return {
    role: s.semanticRole,
    frame: s.frame,
    ...(s.indicator
      ? { indicatorType: s.indicator.indicatorType, directionality: s.indicator.directionality }
      : {}),
    use: s.agentGuidance.use,
    pairWith: s.agentGuidance.pairWith,
    status: s.status,
  };
}

/**
 * Suggère une composition de composants répondant à un besoin décrit en langage naturel.
 * Le scoring et la réponse s'appuient sur la couche sémantique (rôle, frame Ω, guidance) :
 * chaque suggestion explicite son sens et ses associations sémantiques.
 * Réponse bornée (SUGGEST_MAX), pas de curseur.
 * @throws RegistryError si le besoin est vide.
 */
export function suggestComposition(need: string, limit?: number): SuggestResult {
  const n = (need ?? "").trim();
  if (!n) {
    throw new RegistryError(
      "Besoin vide.",
      "Décrivez l'écran ou la fonctionnalité dans 'need' (ex. 'un dashboard avec métriques et graphique').",
    );
  }
  const cap = Math.min(SUGGEST_MAX, Math.max(1, limit ?? SUGGEST_DEFAULT));
  const scored = scoreComponents(n).slice(0, cap);
  return {
    need: n,
    count: scored.length,
    suggestions: scored.map((s) => ({
      ...summarize(s.c),
      why: s.matched.length
        ? `Correspond à : ${s.matched.join(", ")}`
        : "Pertinent pour le besoin décrit",
      meaning: meaningOf(s.c),
    })),
  };
}
