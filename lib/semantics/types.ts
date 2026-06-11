/**
 * Couche sémantique des composants bpm.* — ce que chaque composant SIGNIFIE,
 * au-delà de ses props de rendu.
 *
 * ALIGNEMENT Ω : cette couche est une INSTANCE de l'ontologie AppSpec
 * (packages/core/src/schema/app-spec.ts), pas une ontologie parallèle.
 * Chaque `frame` référence une tranche de l'AppSpec (voir FRAME_SOURCE).
 *
 * GOUVERNANCE (moat) : le SCHÉMA est mécanique ; les VALEURS de sens sont des
 * PROPOSITIONS de la boucle (`status: "proposed"`). Tout jugement de domaine
 * passe en `needs-curation` avec la question précise. Seul l'humain passe une
 * entrée en `curated` — l'ontologie reste curée, c'est elle le moat.
 *
 * Source de données : lib/semantics/bpm-semantics.json (curée à la main).
 * Validation : scripts/validate-semantics.py (ledger docs/automation/semantique.json).
 */
import type { AppSpec } from "@/packages/core/src/schema/app-spec";

/** Rôle sémantique : ce que le composant FAIT porter à l'écran. */
export type SemanticRole =
  | "indicateur" // porte une mesure ou un état qui appelle un jugement (metric, charts, statusTracker…)
  | "affichage" // restitue un fait sans jugement (table, labelValue, markdown…)
  | "saisie" // capture une valeur de champ ou une intention (input, selectbox, promptInput…)
  | "action" // déclenche un événement ou une transition (button, fab…)
  | "conteneur" // structure l'espace, ne porte pas de sens propre (card, grid, modal…)
  | "navigation" // déplace l'attention dans la structure (breadcrumb, topNav, pagination…)
  | "feedback" // reflète l'état du système vers l'utilisateur (toast, spinner, confirmModal…)
  | "composite"; // assemblage autoporteur multi-rôles (crud, dataExplorer, chatInterface…)

/**
 * Frame Ω : le cadre de l'AppSpec auquel le composant se rattache.
 * Les valeurs sont les tranches du seed Ω — voir FRAME_SOURCE pour le câblage typé.
 */
export type OmegaFrame =
  | "kpi" // KPIDefinition — mesure, agrégation, cible, seuils
  | "entity" // Entity / Field — données métier et leurs champs
  | "workflow" // Workflow / WorkflowState / Transition — états et transitions
  | "rule" // BusinessRule — gardes, validations, contraintes
  | "event" // DomainEvent / EventEffect — événements et notifications
  | "section" // Section / LayoutType — structure d'écran
  | "ai" // AIFeature — assistant, prédiction, anomalie
  | "connector" // Connector — flux externes, IoT, pont physique↔numérique
  | "permission" // PermissionModel / Role — acteurs, rôles, accès
  | "meta"; // AppSpecMeta — domaine, locale, thème, branding

/**
 * Câblage typé frame → tranche AppSpec : garantit à la compilation que chaque
 * frame est bien une instance de l'ontologie Ω et non un concept orphelin.
 */
export const FRAME_SOURCE: Record<OmegaFrame, keyof AppSpec> = {
  kpi: "kpis",
  entity: "entities",
  workflow: "workflows",
  rule: "rules",
  event: "events",
  section: "sections",
  ai: "aiFeatures",
  connector: "connectors",
  permission: "permissions",
  meta: "meta",
};

/** Nature de la mesure portée par un composant-indicateur. */
export type IndicatorType =
  | "scalaire-kpi" // valeur unique de KPI (KPIDefinition.aggregation sum/avg/custom)
  | "ratio" // rapport entre deux grandeurs (aggregation "ratio")
  | "taux" // pourcentage normalisé 0-100
  | "compte" // dénombrement (aggregation "count")
  | "monetaire" // valeur en devise (unit/currency)
  | "statut" // valeur d'énumération d'état (WorkflowState)
  | "progression" // avancement vers une borne (target)
  | "tendance" // évolution dans le temps
  | "distribution"; // répartition / comparaison entre catégories

/**
 * Polarité de lecture : ce qu'une variation signifie.
 * "contextuel" = la polarité dépend du KPI affiché, pas du composant
 * (ex. bpm.metric la paramètre via deltaType normal/inverse).
 */
export type Directionality =
  | "hausse=bon"
  | "hausse=mauvais"
  | "neutre"
  | "borne-cible" // la valeur se juge par rapport à une borne/cible, pas par sa direction
  | "contextuel";

/** Rapport au temps de la mesure (cf. KPIDefinition.deltaComparison). */
export type Temporality =
  | "instantane" // photo à l'instant t
  | "cumule" // accumulation depuis une origine
  | "serie" // suite ordonnée de points
  | "periode-sur-periode" // comparaison N vs N-1 (deltaComparison "previous_period")
  | "contextuel"; // dépend des données fournies

/** Bloc indicateur — requis quand semanticRole === "indicateur". */
export interface IndicatorSemantics {
  /** Types de mesure que le composant peut porter, du plus typique au moins typique. */
  indicatorType: IndicatorType[];
  directionality: Directionality;
  temporality: Temporality;
}

/**
 * Relation entre INDICATEURS (sens), distincte de l'imbrication de composants
 * (associated/parent du registre, qui décrivent le rendu).
 */
export interface IndicatorRelation {
  type:
    | "compose-dans" // cette mesure entre dans la composition de la mesure cible
    | "derive-de" // cette mesure se dérive de la mesure cible
    | "contraste-avec"; // mesure voisine dont le choix oppose deux lectures
  /** Nom bpm.* du composant-indicateur cible. */
  target: string;
  note?: string;
}

/** Guidance agent : quand employer, avec quoi s'associer (sens), quoi éviter. */
export interface AgentGuidance {
  /** Quand employer ce composant (critère sémantique, pas esthétique). */
  use: string;
  /** Composants bpm.* avec lesquels il s'associe SÉMANTIQUEMENT (consommé par suggest_composition). */
  pairWith: string[];
  /** Ce pour quoi NE PAS l'utiliser (et l'alternative). */
  avoid: string;
}

/** Statut de curation — voir gouvernance en tête de fichier. */
export type SemanticStatus = "proposed" | "needs-curation" | "curated";

/** Couche sémantique d'un composant du catalogue. Additif : ne touche pas aux props. */
export interface ComponentSemantics {
  semanticRole: SemanticRole;
  /** Frame Ω de rattachement (instance du seed AppSpec). */
  frame: OmegaFrame;
  /** Présent si et seulement si semanticRole === "indicateur". */
  indicator?: IndicatorSemantics;
  agentGuidance: AgentGuidance;
  /** Relations de sens entre indicateurs — réservé aux composants-indicateurs. */
  indicatorRelations?: IndicatorRelation[];
  /** Contexte/données attendus pour que le composant ait du sens. */
  contextHints: string[];
  status: SemanticStatus;
  /** Question précise posée au curateur — requise quand status === "needs-curation". */
  curationQuestion?: string;
}

/** Fichier lib/semantics/bpm-semantics.json. */
export interface SemanticsFile {
  version: number;
  ontology: string;
  note: string;
  components: Record<string, ComponentSemantics>;
}
