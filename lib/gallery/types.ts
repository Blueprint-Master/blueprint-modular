/**
 * Forme publique d'une app de la galerie « Apps créées avec Modular ».
 * Strictement les 5 champs du contrat — cf. docs/contracts/maker-gallery-endpoint.md.
 * Aucune donnée sensible : pas de `code`, pas de `previewUrl`, pas de backend live.
 */
export interface CuratedApp {
  id: string;
  title: string;
  prompt: string;
  /** URL d'une capture (image ou poster vidéo). `null` si aucune capture. */
  screenshotUrl: string | null;
  /** Date ISO 8601. */
  createdAt: string;
}
