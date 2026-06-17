/**
 * Source de données read-only de la galerie publique « Apps créées avec Modular ».
 *
 * Le filtrage « pouce vert » est fait CÔTÉ Maker — cf.
 * docs/contracts/maker-gallery-endpoint.md. Modular ne fait que :
 *   1. consommer l'endpoint Maker (MAKER_GALLERY_URL), jamais en dur ;
 *   2. valider/assainir la forme reçue ;
 *   3. n'exposer que les champs publics du contrat (5 historiques + `appSpec`
 *      structurel filtré, nullable).
 * Jamais de `code`, de `previewUrl` ni d'URL de backend live ne transite par ici.
 */
import type {
  CuratedApp,
  CuratedAppSpec,
  CuratedAppSpecEntity,
  CuratedAppSpecField,
  CuratedAppSpecKpi,
  CuratedAppSpecModule,
} from "./types";
import { GALLERY_FIXTURE } from "./fixture";

export type { CuratedApp } from "./types";

/** `Record` typé si `v` est un objet simple (ni null, ni tableau), sinon `null`. */
function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/** Chaîne nettoyée non vide, sinon `null`. */
function asStr(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

/**
 * Assainit le champ `appSpec` reçu du Maker — **defense in depth**. Même si le
 * Maker filtre déjà, on ne fait jamais confiance aveuglément à une structure
 * réseau :
 *   - accepte `null` / absent → `null` ;
 *   - valide la forme clé par clé (entities / modules / kpis = tableaux d'objets
 *     aux clés attendues) ; toute clé inattendue est ignorée ;
 *   - écarte proprement les éléments mal typés (jamais d'exception) ;
 *   - si plus aucune structure exploitable ne subsiste → `null` (« pas de
 *     structure affichable »), jamais un objet vide ou partiel incohérent.
 */
export function sanitizeAppSpec(raw: unknown): CuratedAppSpec | null {
  const spec = asRecord(raw);
  if (!spec) return null;

  const entities: CuratedAppSpecEntity[] = (
    Array.isArray(spec.entities) ? spec.entities : []
  )
    .map((e): CuratedAppSpecEntity | null => {
      const ent = asRecord(e);
      const name = ent && asStr(ent.name);
      if (!name) return null;
      const fields: CuratedAppSpecField[] = (
        Array.isArray(ent.fields) ? ent.fields : []
      )
        .map((f): CuratedAppSpecField | null => {
          const fl = asRecord(f);
          const fname = fl && asStr(fl.name);
          if (!fname) return null;
          return {
            name: fname,
            label: asStr(fl.label) ?? fname,
            type: asStr(fl.type) ?? "string",
            required: fl.required === true,
          };
        })
        .filter((f): f is CuratedAppSpecField => f !== null);
      return {
        name,
        label: asStr(ent.label) ?? name,
        labelPlural: asStr(ent.labelPlural) ?? asStr(ent.label) ?? name,
        fields,
      };
    })
    .filter((e): e is CuratedAppSpecEntity => e !== null);

  const modules: CuratedAppSpecModule[] = (
    Array.isArray(spec.modules) ? spec.modules : []
  )
    .map((m): CuratedAppSpecModule | null => {
      const mod = asRecord(m);
      const key = mod && asStr(mod.key);
      if (!key) return null;
      return {
        key,
        label: asStr(mod.label) ?? key,
        layout: asStr(mod.layout) ?? "custom",
        entity: asStr(mod.entity),
      };
    })
    .filter((m): m is CuratedAppSpecModule => m !== null);

  const kpis: CuratedAppSpecKpi[] = (Array.isArray(spec.kpis) ? spec.kpis : [])
    .map((k): CuratedAppSpecKpi | null => {
      const kpi = asRecord(k);
      const label = kpi && asStr(kpi.label);
      if (!label) return null;
      return {
        label,
        unit: asStr(kpi.unit),
        aggregation: asStr(kpi.aggregation) ?? "count",
        entity: asStr(kpi.entity),
      };
    })
    .filter((k): k is CuratedAppSpecKpi => k !== null);

  // Aucune structure exploitable → null (pas de section vide côté UI).
  if (entities.length === 0 && modules.length === 0 && kpis.length === 0) {
    return null;
  }

  return { entities, modules, kpis };
}

/**
 * Ne retient que les champs publics du contrat, avec coercition défensive.
 * Tout élément inexploitable (sans id ou titre) est ignoré silencieusement.
 * Accepte soit un tableau brut, soit l'enveloppe `{ apps: [...] }`. Le champ
 * `appSpec` est validé via `sanitizeAppSpec` (ou `null`).
 */
export function sanitizeCuratedApps(raw: unknown): CuratedApp[] {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { apps?: unknown }).apps)
      ? ((raw as { apps: unknown[] }).apps)
      : [];

  const out: CuratedApp[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : null;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    if (!id || !title) continue; // garde-fou : item inexploitable

    out.push({
      id,
      title,
      prompt: typeof o.prompt === "string" ? o.prompt : "",
      screenshotUrl:
        typeof o.screenshotUrl === "string" && o.screenshotUrl.length > 0
          ? o.screenshotUrl
          : null,
      createdAt:
        typeof o.createdAt === "string" ? o.createdAt : new Date(0).toISOString(),
      appSpec: sanitizeAppSpec(o.appSpec),
    });
  }
  return out;
}

/**
 * Récupère les apps pouce vert exposées par le Maker.
 *   - `GALLERY_USE_FIXTURE=1` → fixture locale conforme au contrat (dev / CI),
 *     pour builder et tester la page sans endpoint réel.
 *   - `MAKER_GALLERY_URL` absente → galerie vide (jamais de fixture en prod sans
 *     opt-in explicite, jamais d'erreur).
 *   - Endpoint injoignable / réponse invalide → galerie vide (fallback propre,
 *     pas de 500).
 */
export async function fetchCuratedApps(): Promise<CuratedApp[]> {
  if (process.env.GALLERY_USE_FIXTURE === "1") {
    return sanitizeCuratedApps(GALLERY_FIXTURE);
  }

  const url = process.env.MAKER_GALLERY_URL;
  if (!url) return [];

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    // Le contrat Maker peut exiger un Bearer interne partagé (optionnel).
    const secret = process.env.INTERNAL_API_SECRET;
    if (secret) headers.Authorization = `Bearer ${secret}`;

    const res = await fetch(url, {
      headers,
      // Revalidation courte et bornée (30 s). Le filtrage « pouce vert » étant
      // fait côté Maker, une app dé-validée doit disparaître de /galerie sans
      // délai perceptible : 30 s borne la fraîcheur (vs 300 s qui servait une
      // version périmée jusqu'à ~5 min). On ne passe PAS en `no-store` : avec
      // revalidate, le Maker reçoit au plus 1 appel/30 s par instance quel que
      // soit le trafic, là où no-store ferait 1 appel par vue de page.
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return sanitizeCuratedApps(data);
  } catch {
    // Endpoint injoignable → galerie vide, jamais d'erreur propagée.
    return [];
  }
}

/**
 * Récupère une app de la galerie par id pour la vue détail `/galerie/[id]`.
 * Réutilise la même source assainie (`fetchCuratedApps`) — un seul chemin de
 * curation, jamais d'appel supplémentaire au Maker. Renvoie `null` si l'app
 * n'est pas (ou plus) exposée (→ `notFound()` côté page).
 */
export async function getCuratedApp(id: string): Promise<CuratedApp | null> {
  if (!id) return null;
  const apps = await fetchCuratedApps();
  return apps.find((a) => a.id === id) ?? null;
}
