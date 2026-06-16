/**
 * Forme publique d'une app de la galerie « Apps créées avec Modular ».
 * Cf. docs/contracts/maker-gallery-endpoint.md.
 *
 * 5 champs publics historiques (id, title, prompt, screenshotUrl, createdAt)
 * PLUS `appSpec` : vue STRUCTURELLE filtrée de l'AppSpec ayant produit l'app
 * (entités / modules / KPIs), ou `null`. Aucune donnée sensible : pas de `code`,
 * pas de `previewUrl`, pas de backend live, pas d'AppSpec brut, pas de valeur
 * métier — uniquement des libellés / noms / types affichables.
 */

/** Champ structurel d'une entité (jamais de valeur, d'enum ou de défaut). */
export interface CuratedAppSpecField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

/** Entité du domaine + ses champs structurels. */
export interface CuratedAppSpecEntity {
  name: string;
  label: string;
  labelPlural: string;
  fields: CuratedAppSpecField[];
}

/** Module de navigation (dérivé d'une section côté Maker). */
export interface CuratedAppSpecModule {
  key: string;
  label: string;
  /** Type de vue (ex. `crud-table`, `kpi-overview`). */
  layout: string;
  /** Entité rattachée, ou `null` (ex. tableau de bord transverse). */
  entity: string | null;
}

/** Indicateur : libellé + définition calculable (jamais la formule brute). */
export interface CuratedAppSpecKpi {
  label: string;
  unit: string | null;
  aggregation: string;
  entity: string | null;
}

/**
 * Vue structurelle filtrée de l'AppSpec. Les trois tableaux sont toujours
 * présents (éventuellement vides). Quand il n'y a aucune structure exploitable,
 * le champ vaut `null` côté `CuratedApp` (pas un objet vide).
 */
export interface CuratedAppSpec {
  entities: CuratedAppSpecEntity[];
  modules: CuratedAppSpecModule[];
  kpis: CuratedAppSpecKpi[];
}

export interface CuratedApp {
  id: string;
  title: string;
  prompt: string;
  /** URL d'une capture (image ou poster vidéo). `null` si aucune capture. */
  screenshotUrl: string | null;
  /** Date ISO 8601. */
  createdAt: string;
  /** AppSpec structurel filtré, ou `null` si absent/inexploitable. */
  appSpec: CuratedAppSpec | null;
}
