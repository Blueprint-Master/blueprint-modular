import type { Locale } from "@/lib/i18n";

/**
 * Chaînes bilingues du module Audit / Log.
 * Le dictionnaire FR fait référence ; le type `AuditLogStrings` garantit
 * la parité de clés (et de signatures) côté EN à la compilation.
 */
const fr = {
  modulePage: {
    breadcrumbModules: "Modules",
    breadcrumbCurrent: "Audit / Log",
    title: "Audit / Log",
    description:
      "Journal d'audit complet : qui a changé quoi, et quand. Recherche plein texte, filtres par acteur, type d'action et période, détail JSON de chaque événement et export CSV — tout est testable dans le Simulateur.",
    category: "Processus & workflow",
    openSimulator: "Ouvrir le simulateur",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulateur",
  },
  simulatorPage: {
    breadcrumbCurrent: "Simulateur",
    title: "Simulateur — Audit / Log",
    description:
      "32 événements tracés sur 10 jours (créations, modifications, suppressions, connexions — 5 acteurs). Combinez recherche plein texte, acteur, type d'action et période, cliquez sur une ligne pour le détail complet (JSON brut inclus) et exportez la sélection en CSV.",
  },
  docPage: {
    breadcrumbCurrent: "Documentation",
    title: "Documentation — Audit / Log",
    description:
      "Journal d'audit (qui, quand, quoi) : modèle d'événement, politique de rétention, garanties d'intégrité et points d'intégration.",
    eventModelTitle: "Modèle d'événement",
    retentionTitle: "Rétention",
    integrityTitle: "Conformité et intégrité",
    integrationTitle: "Intégration en production",
    openSimulator: "Ouvrir le simulateur",
  },
  actions: {
    creation: "Création",
    modification: "Modification",
    suppression: "Suppression",
    connexion: "Connexion",
  },
  sim: {
    metricEvents: "Événements (10 j)",
    metricActors: "Acteurs distincts",
    metricDeletions: "Suppressions (10 j)",
    filtersTitle: "Filtres",
    searchLabel: "Recherche",
    searchPlaceholder: "Acteur, entité, détail…",
    actorLabel: "Acteur",
    allActors: "Tous les acteurs",
    actionLabel: "Type d'action",
    allActions: "Toutes les actions",
    periodLabel: "Période",
    period24h: "24 h",
    period7d: "7 jours",
    periodAll: "10 jours (tout)",
    chipPeriod24h: "24 h",
    chipPeriod7d: "7 jours",
    chipPeriodAll: "10 jours",
    chipSearch: (q: string) => `Recherche : « ${q} »`,
    chipActor: (name: string) => `Acteur : ${name}`,
    chipAction: (label: string) => `Action : ${label}`,
    chipPeriod: (label: string) => `Période : ${label}`,
    resetFilters: "Réinitialiser les filtres",
    eventLogTitle: "Journal des événements",
    counter: (shown: number, total: number) =>
      `${shown} événement${shown > 1 ? "s" : ""} affiché${shown > 1 ? "s" : ""} sur ${total} — cliquez sur une ligne pour le détail`,
    exportCsv: (count: number) => `Exporter en CSV (${count})`,
    emptyMessage: "Aucun événement ne correspond aux filtres.",
    colTimestamp: "Horodatage",
    colActor: "Acteur",
    colAction: "Action",
    colEntity: "Entité",
    colDetail: "Détail",
    drawerTitle: (id: string) => `Événement ${id}`,
    drawerTitleFallback: "Détail de l'événement",
    drawerTimestamp: "Horodatage",
    drawerAction: "Action",
    drawerIp: "Adresse IP",
    drawerSource: "Source",
    drawerEntity: "Entité",
    drawerDetail: "Détail",
    drawerRawJson: "Événement brut (JSON)",
    csvHeaders: ["Identifiant", "Horodatage", "Acteur", "Action", "Entité", "Détail", "Adresse IP", "Source"],
    csvFilePrefix: "journal-audit",
    toastExportMessage: (count: number) =>
      `${count} événement(s) exporté(s) au format CSV (séparateur « ; »).`,
    toastExportTitle: "Export CSV",
    toastExportSubtitle: "Journal d'audit",
  },
};

export type AuditLogStrings = typeof fr;

const en: AuditLogStrings = {
  modulePage: {
    breadcrumbModules: "Modules",
    breadcrumbCurrent: "Audit / Log",
    title: "Audit / Log",
    description:
      "Complete audit log: who changed what, and when. Full-text search, filters by actor, action type and period, JSON detail for every event and CSV export — everything can be tried out in the Simulator.",
    category: "Process & workflow",
    openSimulator: "Open the simulator",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulator",
  },
  simulatorPage: {
    breadcrumbCurrent: "Simulator",
    title: "Simulator — Audit / Log",
    description:
      "32 events tracked over 10 days (creations, modifications, deletions, logins — 5 actors). Combine full-text search, actor, action type and period, click a row for the full detail (raw JSON included) and export the selection to CSV.",
  },
  docPage: {
    breadcrumbCurrent: "Documentation",
    title: "Documentation — Audit / Log",
    description:
      "Audit log (who, when, what): event model, retention policy, integrity guarantees and integration points.",
    eventModelTitle: "Event model",
    retentionTitle: "Retention",
    integrityTitle: "Compliance and integrity",
    integrationTitle: "Production integration",
    openSimulator: "Open the simulator",
  },
  actions: {
    creation: "Creation",
    modification: "Modification",
    suppression: "Deletion",
    connexion: "Login",
  },
  sim: {
    metricEvents: "Events (10 d)",
    metricActors: "Distinct actors",
    metricDeletions: "Deletions (10 d)",
    filtersTitle: "Filters",
    searchLabel: "Search",
    searchPlaceholder: "Actor, entity, detail…",
    actorLabel: "Actor",
    allActors: "All actors",
    actionLabel: "Action type",
    allActions: "All actions",
    periodLabel: "Period",
    period24h: "24 h",
    period7d: "7 days",
    periodAll: "10 days (all)",
    chipPeriod24h: "24 h",
    chipPeriod7d: "7 days",
    chipPeriodAll: "10 days",
    chipSearch: (q: string) => `Search: “${q}”`,
    chipActor: (name: string) => `Actor: ${name}`,
    chipAction: (label: string) => `Action: ${label}`,
    chipPeriod: (label: string) => `Period: ${label}`,
    resetFilters: "Reset filters",
    eventLogTitle: "Event log",
    counter: (shown: number, total: number) =>
      `${shown} of ${total} event${total > 1 ? "s" : ""} shown — click a row for details`,
    exportCsv: (count: number) => `Export CSV (${count})`,
    emptyMessage: "No events match the current filters.",
    colTimestamp: "Timestamp",
    colActor: "Actor",
    colAction: "Action",
    colEntity: "Entity",
    colDetail: "Detail",
    drawerTitle: (id: string) => `Event ${id}`,
    drawerTitleFallback: "Event detail",
    drawerTimestamp: "Timestamp",
    drawerAction: "Action",
    drawerIp: "IP address",
    drawerSource: "Source",
    drawerEntity: "Entity",
    drawerDetail: "Detail",
    drawerRawJson: "Raw event (JSON)",
    csvHeaders: ["ID", "Timestamp", "Actor", "Action", "Entity", "Detail", "IP address", "Source"],
    csvFilePrefix: "audit-log",
    toastExportMessage: (count: number) =>
      `${count} event(s) exported to CSV (“;” separator).`,
    toastExportTitle: "CSV export",
    toastExportSubtitle: "Audit log",
  },
};

const STRINGS: Record<Locale, AuditLogStrings> = { fr, en };

export function getAuditLogStrings(locale: Locale): AuditLogStrings {
  return STRINGS[locale] ?? fr;
}
