/**
 * Application du `responseMapping` : projette une réponse API (ou sa fixture) vers
 * la forme de données Ω. Pur et déterministe — aucun réseau, aucun secret.
 *
 * C'est cette fonction qui alimente la démo vitrine (sur sampleResponse) et les
 * tests de mapping.
 */
import type { Operation, ResponseMappingRule } from "./types";

/** Transformation pure d'une valeur scalaire, référencée par nom dans une règle. */
export type Transform = (value: unknown) => unknown;

/**
 * Registre des transformations déclarables via `ResponseMappingRule.transform`.
 * Ajout d'une transformation = ajout d'une entrée ici (curé, jamais arbitraire).
 */
export const TRANSFORMS: Record<string, Transform> = {
  /** Centimes (entier) → unité monétaire (nombre). 4200 -> 42. */
  centsToEuros: (v: unknown) => (typeof v === "number" ? v / 100 : v),
  /** Timestamp UNIX (secondes) → ISO 8601. */
  isoFromUnix: (v: unknown) => (typeof v === "number" ? new Date(v * 1000).toISOString() : v),
  /** Coerce en nombre. */
  toNumber: (v: unknown) => (typeof v === "number" ? v : Number(v)),
  /** Coerce en chaîne. */
  toString: (v: unknown) => (v === null || v === undefined ? v : String(v)),
  /** Identité (par défaut quand `transform` est absent). */
  identity: (v: unknown) => v,
};

/**
 * Résout un dot-path avec indices de tableau dans un objet.
 * Supporte "a.b", "a[0].b", "data[2].amount". Renvoie undefined si le chemin casse.
 */
export function getByPath(obj: unknown, path: string): unknown {
  if (path === "") return obj;
  const segments = path
    .replace(/\[(\d+)\]/g, ".$1") // "a[0].b" -> "a.0.b"
    .split(".")
    .filter((s) => s.length > 0);
  let current: unknown = obj;
  for (const seg of segments) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[seg];
  }
  return current;
}

/** Pose une valeur dans un objet selon un dot-path (crée les niveaux manquants). */
export function setByPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split(".").filter((s) => s.length > 0);
  let cursor: Record<string, unknown> = target;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (typeof cursor[seg] !== "object" || cursor[seg] === null) cursor[seg] = {};
    cursor = cursor[seg] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = value;
}

/** Applique une transformation nommée (identité si nom absent/inconnu signalé). */
function applyTransform(name: string | undefined, value: unknown): unknown {
  if (!name) return value;
  const fn = TRANSFORMS[name];
  if (!fn) throw new Error(`Transform inconnue : "${name}" (non déclarée dans TRANSFORMS).`);
  return fn(value);
}

/** Mappe un enregistrement unique selon un jeu de règles. */
function mapRecord(record: unknown, rules: ResponseMappingRule[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const rule of rules) {
    const raw = getByPath(record, rule.source);
    setByPath(out, rule.target, applyTransform(rule.transform, raw));
  }
  return out;
}

/**
 * Applique le mapping d'une opération à une réponse (typiquement sa fixture).
 * - Si `operation.collectionPath` est défini, mappe chaque élément du tableau ciblé
 *   et renvoie un tableau d'objets.
 * - Sinon, traite la réponse entière comme un enregistrement unique.
 */
export function applyResponseMapping(
  response: unknown,
  operation: Pick<Operation, "responseMapping" | "collectionPath">
): Record<string, unknown> | Record<string, unknown>[] {
  if (operation.collectionPath) {
    const collection = getByPath(response, operation.collectionPath);
    if (!Array.isArray(collection)) {
      throw new Error(
        `collectionPath "${operation.collectionPath}" ne pointe pas sur un tableau.`
      );
    }
    return collection.map((item) => mapRecord(item, operation.responseMapping));
  }
  return mapRecord(response, operation.responseMapping);
}
