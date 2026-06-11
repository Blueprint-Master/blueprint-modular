/**
 * Accès read-only au catalogue de composants Blueprint Modular pour le connecteur MCP.
 *
 * Source de vérité : lib/generated/mcp-registry.json — fichier GÉNÉRÉ
 * (voir scripts/generate-mcp-registry.mjs) à partir de bpm-components.json + llms.txt.
 * Aucune donnée n'est dupliquée à la main ici.
 */
import registry from "@/lib/generated/mcp-registry.json";

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
  /** Index de recherche pré-calculé (tout en minuscules). Interne. */
  _haystack: string;
}

const COMPONENTS = registry.components as BpmComponent[];

export const CATEGORIES: string[] = registry.categories;
export const TOTAL: number = registry.total;
export const GENERATED_AT: string = registry.generatedAt;

/** Normalise un nom fourni par l'utilisateur : "bpm.Metric", "Metric", "metric" → "metric". */
function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^bpm\./, "");
}

/** Résumé court (une ligne) d'un composant — utilisé pour les listes paginées/scopées. */
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

/** Détail public d'un composant (sans l'index interne _haystack). */
export function componentDetail(c: BpmComponent) {
  return {
    name: c.name,
    category: c.category,
    description: c.fullDescription || c.description,
    props: c.props ?? "(props non documentées dans le registre)",
    example: c.example ?? null,
    associated: c.associated ?? [],
    parent: c.parent ?? [],
    import: "import { bpm } from '@blueprint-modular/core'",
  };
}

export interface ListResult {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  category: string | null;
  categories: string[];
  components: ComponentSummary[];
}

/** Liste paginée des composants, filtrable par catégorie (match insensible à la casse / partiel). */
export function listComponents(opts: {
  category?: string;
  page?: number;
  pageSize?: number;
}): ListResult {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 30));

  let filtered = COMPONENTS;
  let matchedCategory: string | null = null;
  if (opts.category && opts.category.trim()) {
    const q = opts.category.trim().toLowerCase();
    matchedCategory =
      CATEGORIES.find((c) => c.toLowerCase() === q) ||
      CATEGORIES.find((c) => c.toLowerCase().includes(q)) ||
      opts.category;
    filtered = COMPONENTS.filter((c) => c.category.toLowerCase() === matchedCategory!.toLowerCase());
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const components = filtered.slice(start, start + pageSize).map(summarize);

  return {
    total,
    page,
    pageSize,
    totalPages,
    category: matchedCategory,
    categories: CATEGORIES,
    components,
  };
}

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

/** Vrai si l'un des variants du token apparaît dans le texte. */
function fieldMatches(field: string, token: string): boolean {
  return tokenVariants(token).some((v) => field.includes(v));
}

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
    let score = 0;
    const matched: string[] = [];

    for (const t of tokens) {
      let hit = false;
      if (fieldMatches(nameL, t)) {
        score += 6;
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

export interface SearchResult {
  query: string;
  count: number;
  results: Array<ComponentSummary & { matched: string[] }>;
}

/** Recherche pertinente sur nom / description / catégorie / tags. Scopée (limit). */
export function searchComponents(query: string, limit = 10): SearchResult {
  const scored = scoreComponents(query).slice(0, Math.min(50, Math.max(1, limit)));
  return {
    query,
    count: scored.length,
    results: scored.map((s) => ({ ...summarize(s.c), matched: s.matched })),
  };
}

export interface SuggestResult {
  need: string;
  count: number;
  suggestions: Array<ComponentSummary & { why: string }>;
}

/**
 * Suggère une composition de composants répondant à un besoin décrit en langage naturel.
 * S'appuie sur le même moteur de score que la recherche, avec une sortie orientée "pourquoi".
 */
export function suggestComposition(need: string, limit = 8): SuggestResult {
  const scored = scoreComponents(need).slice(0, Math.min(20, Math.max(1, limit)));
  return {
    need,
    count: scored.length,
    suggestions: scored.map((s) => ({
      ...summarize(s.c),
      why: s.matched.length
        ? `Correspond à : ${s.matched.join(", ")}`
        : "Pertinent pour le besoin décrit",
    })),
  };
}
