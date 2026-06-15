import { getLlmsPropsBlock } from "./llmsDoc";
import registry from "./generated/bpm-components.json";

/**
 * Dérive des spécifications de props éditables à partir de la référence machine
 * `public/llms.txt` (source de vérité générée depuis le TypeScript). Aucune liste
 * de props n'est codée en dur : tout est parsé du bloc `## bpm.<name>`.
 *
 * Règle de dégradation : une prop non typée exploitablement (tableau, objet,
 * fonction, type nommé sans énumération connue) est marquée `editable: false`
 * et n'expose aucun contrôle — on ne plante jamais.
 */

export type PlaygroundControl = "boolean" | "number" | "string" | "select";

export interface PropSpec {
  name: string;
  /** Type brut tel qu'écrit dans llms.txt (ex. "BadgeVariant", `"sm" | "md"`). */
  type: string;
  required: boolean;
  /** Vrai si un contrôle de formulaire peut être généré pour cette prop. */
  editable: boolean;
  control?: PlaygroundControl;
  /** Valeurs possibles pour un contrôle `select`. */
  options?: string[];
  default?: string | number | boolean;
  description?: string;
}

export interface PlaygroundComponentMeta {
  slug: string;
  name: string;
  description: string;
  category: string;
  specs: PropSpec[];
}

const EM_DASH = "—"; // — séparateur "type — description" dans llms.txt

/** Extrait tous les littéraux entre quotes simples ou doubles d'une chaîne. */
function extractQuoted(source: string): string[] {
  const out: string[] = [];
  const re = /['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) out.push(m[1]);
  return out;
}

/** Déduit les options d'un select depuis le type littéral puis la description. */
function inferOptions(type: string, description: string): string[] {
  // 1) Union de littéraux dans le type : "a" | "b" | "c"
  if (type.includes("|") && /['"]/.test(type)) {
    const fromType = extractQuoted(type);
    if (fromType.length > 0) return fromType;
  }
  // 2) Énumération décrite : « Valeurs : 'a' | 'b'. » ou « 'sm' (défaut) | 'md' ».
  const valuesIdx = description.search(/[Vv]aleurs?\s*:/);
  const scope = valuesIdx >= 0 ? description.slice(valuesIdx) : description;
  if (scope.includes("|") && /['"]/.test(scope)) {
    const fromDesc = extractQuoted(scope);
    if (fromDesc.length > 1) return fromDesc;
  }
  return [];
}

/** Cherche une valeur par défaut dans la description (Default:/défaut). */
function inferDefault(description: string): string | undefined {
  const patterns = [
    /Default:\s*'([^']+)'/,
    /Default:\s*"([^"]+)"/,
    /Default:\s*([A-Za-z0-9_.-]+)/,
    /'([^']+)'\s*\(d[ée]faut\)/i,
    /"([^"]+)"\s*\(d[ée]faut\)/i,
  ];
  for (const p of patterns) {
    const m = description.match(p);
    if (m) return m[1];
  }
  return undefined;
}

/** Parse une ligne de props llms.txt en PropSpec, ou null si non parsable. */
function parseLine(line: string): PropSpec | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const dashIdx = trimmed.indexOf(` ${EM_DASH} `);
  const head = dashIdx >= 0 ? trimmed.slice(0, dashIdx).trim() : trimmed;
  const description = dashIdx >= 0 ? trimmed.slice(dashIdx + 3).trim() : "";

  // head = "name*: Type" | "name?: Type" | "name: Type"
  const m = head.match(/^([A-Za-z_][A-Za-z0-9_]*)([*?]?)\s*:\s*(.+)$/);
  if (!m) return null;

  const name = m[1];
  const marker = m[2];
  const type = m[3].trim();
  const required = marker === "*";

  const spec: PropSpec = { name, type, required, editable: false, description };

  const isBoolean = type === "boolean";
  const isNumberOnly = type === "number";
  const isReactNode = /\bReact\.ReactNode\b|\bReactNode\b/.test(type);
  const options = inferOptions(type, description);
  const rawDefault = inferDefault(description);

  if (isBoolean) {
    spec.editable = true;
    spec.control = "boolean";
    spec.default = /Default:\s*true/i.test(description) ? true : false;
  } else if (options.length > 0) {
    spec.editable = true;
    spec.control = "select";
    spec.options = options;
    spec.default = rawDefault && options.includes(rawDefault) ? rawDefault : options[0];
  } else if (isNumberOnly) {
    spec.editable = true;
    spec.control = "number";
    if (rawDefault !== undefined && !Number.isNaN(Number(rawDefault))) {
      spec.default = Number(rawDefault);
    }
  } else if (isReactNode || /\bstring\b/.test(type)) {
    // ReactNode et number|string dégradent proprement en champ texte.
    spec.editable = true;
    spec.control = "string";
    spec.default = rawDefault ?? "";
  } else if (/\bnumber\b/.test(type)) {
    spec.editable = true;
    spec.control = "number";
    if (rawDefault !== undefined && !Number.isNaN(Number(rawDefault))) {
      spec.default = Number(rawDefault);
    }
  }
  // sinon : tableau / objet / fonction / type nommé inconnu → editable=false

  return spec;
}

/** Parse toutes les props d'un composant bpm.* depuis llms.txt. */
export function parsePropSpecs(name: string): PropSpec[] {
  const block = getLlmsPropsBlock(name);
  if (!block) return [];
  return block
    .split("\n")
    .map(parseLine)
    .filter((s): s is PropSpec => s !== null);
}

/** Métadonnées complètes (registry + specs parsées) pour tous les composants. */
export function getPlaygroundComponents(): PlaygroundComponentMeta[] {
  return registry.components.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    category: c.category,
    specs: parsePropSpecs(c.name),
  }));
}
