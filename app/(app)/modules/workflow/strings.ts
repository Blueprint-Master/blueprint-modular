import type { Locale } from "@/lib/i18n";

/**
 * Internal (technical) status values — kept as-is so behavior does not change.
 * Display labels are resolved per locale via `statusBadge` / `statusInline`.
 */
export type Status = "brouillon" | "validé" | "archivé";

/** Structured history entry; display is resolved at render time. */
export type HistoryEntry = {
  from: Status;
  to: Status;
  /** Actor name, or CURRENT_USER for the signed-in user (localized at render). */
  who: string;
  when: Date;
};

/** Sentinel meaning "the current user" (rendered as « Vous » / "You"). */
export const CURRENT_USER = "__current_user__";

/** Rich-text segment used to compose paragraphs containing <strong>/<code>. */
export type Segment = { text: string; strong?: boolean; code?: boolean };

const pad = (n: number) => String(n).padStart(2, "0");

const STATUS_FR: Record<Status, string> = {
  brouillon: "Brouillon",
  validé: "Validé",
  archivé: "Archivé",
};
const STATUS_FR_INLINE: Record<Status, string> = {
  brouillon: "brouillon",
  validé: "validé",
  archivé: "archivé",
};
const STATUS_EN: Record<Status, string> = {
  brouillon: "Draft",
  validé: "Validated",
  archivé: "Archived",
};
const STATUS_EN_INLINE: Record<Status, string> = {
  brouillon: "draft",
  validé: "validated",
  archivé: "archived",
};

const EN_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type WorkflowStrings = {
  // Shared
  moduleName: string;
  breadcrumbModules: string;
  statusBadge: Record<Status, string>;
  statusInline: Record<Status, string>;
  documentTitle: (id: number) => string;
  statusLabel: string;
  historyHeading: string;
  you: string;
  historyLine: (from: Status, to: Status, who: string, when: string) => string;
  formatDateTime: (d: Date) => string;
  formatDateShort: (d: Date) => string;
  backToModule: string;

  // Module page (page.tsx)
  moduleDescription: string;
  categoryBadge: string;
  openSimulator: string;
  tabDocumentation: string;
  tabSimulator: string;
  aboutHeading: string;
  aboutBody: Segment[];
  simuHeading: string;
  overviewHistory: (from: Status, to: Status, who: string, when: string) => string;
  validateButton: string;
  archiveButton: string;

  // Simulator page (simulateur/page.tsx)
  breadcrumbSimulator: string;
  simulatorTitle: string;
  simulatorDescription: string;
  resetButton: string;

  // Documentation page (documentation/page.tsx)
  breadcrumbDocumentation: string;
  documentationTitle: string;
  documentationDescription: string;
  docIntro: Segment[];
  howItWorksHeading: string;
  howItWorksBody: Segment[];
  dataStructureHeading: string;
  dataStructureItems: Segment[][];
  integrationHeading: string;
  integrationBody: Segment[];
  simulatorHeading: string;
  simulatorBody: string;
  openWorkflowSimulator: string;
};

export const STR: Record<Locale, WorkflowStrings> = {
  fr: {
    moduleName: "Workflow",
    breadcrumbModules: "Modules",
    statusBadge: STATUS_FR,
    statusInline: STATUS_FR_INLINE,
    documentTitle: (id) => `Document #${id}`,
    statusLabel: "Statut :",
    historyHeading: "Historique :",
    you: "Vous",
    historyLine: (from, to, who, when) =>
      `${STATUS_FR_INLINE[from]} → ${STATUS_FR_INLINE[to]} (par ${who}, ${when})`,
    formatDateTime: (d) =>
      `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${d.getHours()}h${pad(d.getMinutes())}`,
    formatDateShort: (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
    backToModule: "← Retour au module Workflow",

    moduleDescription: "États et transitions avec historique. Testez dans le Simulateur.",
    categoryBadge: "Processus & workflow",
    openSimulator: "Ouvrir le simulateur",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulateur",
    aboutHeading: "À propos",
    aboutBody: [
      { text: "Le module " },
      { text: "Workflow", strong: true },
      { text: " gère des états et transitions (ex. brouillon → validé → archivé) avec historique des changements." },
    ],
    simuHeading: "États et transitions (démo)",
    overviewHistory: (from, to, who, when) =>
      `Historique : ${STATUS_FR[from]} → ${STATUS_FR[to]} (par ${who}, ${when}).`,
    validateButton: "Valider",
    archiveButton: "Archiver",

    breadcrumbSimulator: "Simulateur",
    simulatorTitle: "Simulateur — Workflow",
    simulatorDescription: "Testez les transitions Brouillon → Validé → Archivé et l'historique.",
    resetButton: "Réinitialiser (démo)",

    breadcrumbDocumentation: "Documentation",
    documentationTitle: "Documentation — Workflow",
    documentationDescription:
      "États et transitions (brouillon, validé, archivé) avec historique des changements.",
    docIntro: [
      { text: "Les modules Blueprint Modular font partie de l'" },
      { text: "application Next.js", strong: true },
      { text: ". Cette documentation décrit " },
      { text: "comment fonctionne", strong: true },
      { text: " le module Workflow (états, transitions, historique), " },
      { text: "comment l'intégrer", strong: true },
      { text: " (API ou store) et les données attendues." },
    ],
    howItWorksHeading: "Comment fonctionne le module Workflow",
    howItWorksBody: [
      { text: "Le module gère un " },
      { text: "workflow léger", strong: true },
      { text: " : des " },
      { text: "états", strong: true },
      { text: " (ex. Brouillon, Validé, Archivé) et des " },
      { text: "transitions", strong: true },
      { text: " autorisées entre états. Pour chaque entité (document, demande), on affiche le statut courant et les boutons de transition. Un " },
      { text: "historique", strong: true },
      { text: " enregistre qui a fait quelle transition et quand." },
    ],
    dataStructureHeading: "Structure des données",
    dataStructureItems: [
      [
        { text: "entityId", code: true },
        { text: " / " },
        { text: "entityType", code: true },
        { text: " — référence de l'entité" },
      ],
      [
        { text: "status", code: true },
        { text: " — état courant (brouillon, validé, archivé)" },
      ],
      [
        { text: "transitions", code: true },
        { text: " — transitions possibles depuis l'état courant" },
      ],
      [
        { text: "history", code: true },
        { text: " — événements (état précédent → nouvel état, auteur, date)" },
      ],
    ],
    integrationHeading: "Intégration côté app",
    integrationBody: [
      { text: "Page " },
      { text: "/modules/workflow", code: true },
      { text: ". Exposez " },
      { text: "GET /api/workflow/entity/:id", code: true },
      { text: " (statut + historique) et " },
      { text: "POST /api/workflow/entity/:id/transition", code: true },
      { text: " (body : to). Session NextAuth pour l'auteur. Aucune variable d'environnement spécifique." },
    ],
    simulatorHeading: "Simulateur",
    simulatorBody: "Le simulateur permet de tester les transitions et l'historique sans backend.",
    openWorkflowSimulator: "Ouvrir le simulateur Workflow",
  },
  en: {
    moduleName: "Workflow",
    breadcrumbModules: "Modules",
    statusBadge: STATUS_EN,
    statusInline: STATUS_EN_INLINE,
    documentTitle: (id) => `Document #${id}`,
    statusLabel: "Status:",
    historyHeading: "History:",
    you: "You",
    historyLine: (from, to, who, when) =>
      `${STATUS_EN_INLINE[from]} → ${STATUS_EN_INLINE[to]} (by ${who}, ${when})`,
    formatDateTime: (d) => {
      const hours = d.getHours();
      const h12 = hours % 12 || 12;
      const ampm = hours < 12 ? "AM" : "PM";
      return `${EN_MONTHS[d.getMonth()]} ${d.getDate()}, ${h12}:${pad(d.getMinutes())} ${ampm}`;
    },
    formatDateShort: (d) => `${EN_MONTHS[d.getMonth()]} ${d.getDate()}`,
    backToModule: "← Back to the Workflow module",

    moduleDescription: "States and transitions with history. Try it in the Simulator.",
    categoryBadge: "Process & workflow",
    openSimulator: "Open the simulator",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulator",
    aboutHeading: "About",
    aboutBody: [
      { text: "The " },
      { text: "Workflow", strong: true },
      { text: " module manages states and transitions (e.g. draft → validated → archived) with a history of changes." },
    ],
    simuHeading: "States and transitions (demo)",
    overviewHistory: (from, to, who, when) =>
      `History: ${STATUS_EN[from]} → ${STATUS_EN[to]} (by ${who}, ${when}).`,
    validateButton: "Validate",
    archiveButton: "Archive",

    breadcrumbSimulator: "Simulator",
    simulatorTitle: "Simulator — Workflow",
    simulatorDescription: "Try the Draft → Validated → Archived transitions and the history.",
    resetButton: "Reset (demo)",

    breadcrumbDocumentation: "Documentation",
    documentationTitle: "Documentation — Workflow",
    documentationDescription:
      "States and transitions (draft, validated, archived) with a history of changes.",
    docIntro: [
      { text: "Blueprint Modular modules are part of the " },
      { text: "Next.js application", strong: true },
      { text: ". This documentation describes " },
      { text: "how the Workflow module works", strong: true },
      { text: " (states, transitions, history), " },
      { text: "how to integrate it", strong: true },
      { text: " (API or store), and the expected data." },
    ],
    howItWorksHeading: "How the Workflow module works",
    howItWorksBody: [
      { text: "The module manages a " },
      { text: "lightweight workflow", strong: true },
      { text: ": " },
      { text: "states", strong: true },
      { text: " (e.g. Draft, Validated, Archived) and the " },
      { text: "transitions", strong: true },
      { text: " allowed between them. For each entity (document, request), it displays the current status and the transition buttons. A " },
      { text: "history", strong: true },
      { text: " records who made which transition and when." },
    ],
    dataStructureHeading: "Data structure",
    dataStructureItems: [
      [
        { text: "entityId", code: true },
        { text: " / " },
        { text: "entityType", code: true },
        { text: " — reference to the entity" },
      ],
      [
        { text: "status", code: true },
        { text: " — current state (draft, validated, archived)" },
      ],
      [
        { text: "transitions", code: true },
        { text: " — transitions available from the current state" },
      ],
      [
        { text: "history", code: true },
        { text: " — events (previous state → new state, author, date)" },
      ],
    ],
    integrationHeading: "App-side integration",
    integrationBody: [
      { text: "Page " },
      { text: "/modules/workflow", code: true },
      { text: ". Expose " },
      { text: "GET /api/workflow/entity/:id", code: true },
      { text: " (status + history) and " },
      { text: "POST /api/workflow/entity/:id/transition", code: true },
      { text: " (body: to). NextAuth session provides the author. No specific environment variables." },
    ],
    simulatorHeading: "Simulator",
    simulatorBody: "The simulator lets you try out transitions and the history without a backend.",
    openWorkflowSimulator: "Open the Workflow simulator",
  },
};
