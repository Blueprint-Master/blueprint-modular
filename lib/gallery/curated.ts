/**
 * Source de données read-only de la galerie publique « Apps créées avec Modular ».
 *
 * Le filtrage « pouce vert » est fait CÔTÉ Maker — cf.
 * docs/contracts/maker-gallery-endpoint.md. Modular ne fait que :
 *   1. consommer l'endpoint Maker (MAKER_GALLERY_URL), jamais en dur ;
 *   2. valider/assainir la forme reçue ;
 *   3. n'exposer que les 5 champs publics du contrat.
 * Jamais de `code`, de `previewUrl` ni d'URL de backend live ne transite par ici.
 */
import type { CuratedApp } from "./types";
import { GALLERY_FIXTURE } from "./fixture";

export type { CuratedApp } from "./types";

/**
 * Ne retient que les 5 champs publics du contrat, avec coercition défensive.
 * Tout élément inexploitable (sans id ou titre) est ignoré silencieusement.
 * Accepte soit un tableau brut, soit l'enveloppe `{ apps: [...] }`.
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
      // Cache court : la galerie n'a pas besoin d'être temps réel.
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return sanitizeCuratedApps(data);
  } catch {
    // Endpoint injoignable → galerie vide, jamais d'erreur propagée.
    return [];
  }
}
