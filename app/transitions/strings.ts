// Dictionnaire bilingue local à la page /transitions (surface sans chrome).
// Motif requis : `fr` d'abord, puis `en: typeof fr` pour garantir la parité des clés.

export const fr = {
  // En-tête de page
  pageTitle: "Transitions d'interface",
  pageSubtitle: "Motifs de contexte, de navigation et de continuité — CSS uniquement.",

  // Titres de section
  contextHeading: "Contexte (onglets + squelette → contenu)",
  drillHeading: "Navigation (liste → détail, glissé)",
  continuityHeading: "Continuité (carte → superposition, agrandissement)",

  // Libellés d'onglets
  tabOverview: "Aperçu",
  tabActivity: "Activité",
  tabSettings: "Paramètres",

  // Libellés de statistiques — Aperçu
  statActiveUsers: "Utilisateurs actifs",
  statRevenue: "Revenu",
  statSessions: "Sessions",
  // Activité
  statEventsToday: "Événements aujourd'hui",
  statAvgDuration: "Durée moyenne",
  statBounceRate: "Taux de rebond",
  // Paramètres
  statApiCalls: "Appels API",
  statErrors: "Erreurs",
  statUptime: "Disponibilité",

  // Catégories de projets
  catDesign: "Design",
  catEngineering: "Ingénierie",
  catMarketing: "Marketing",

  // Statuts de projets
  statusInProgress: "En cours",
  statusReview: "En revue",
  statusDone: "Terminé",

  // Détail (Drill)
  back: "← retour",
  statusLabel: "Statut",
  itemsLabel: "Éléments",

  // Continuité
  storage: "Stockage",
  used: "utilisé",
  expand: "agrandir ↗",
  storageExpanded: "Stockage (agrandi)",
  close: "✕ fermer",
  storageDetail: "68 % utilisé — 12,4 Go sur 18 Go",
  usedShort: "68 % utilisé",
};

export const en: typeof fr = {
  pageTitle: "UI Transitions",
  pageSubtitle: "Context, drill-down, and continuity patterns — CSS only.",

  contextHeading: "Context (tabs + skeleton → content)",
  drillHeading: "Drill (list → detail, slide-in)",
  continuityHeading: "Continuity (card → overlay, scale-up)",

  tabOverview: "Overview",
  tabActivity: "Activity",
  tabSettings: "Settings",

  statActiveUsers: "Active users",
  statRevenue: "Revenue",
  statSessions: "Sessions",
  statEventsToday: "Events today",
  statAvgDuration: "Avg. duration",
  statBounceRate: "Bounce rate",
  statApiCalls: "API calls",
  statErrors: "Errors",
  statUptime: "Uptime",

  catDesign: "Design",
  catEngineering: "Engineering",
  catMarketing: "Marketing",

  statusInProgress: "In progress",
  statusReview: "Review",
  statusDone: "Done",

  back: "← back",
  statusLabel: "Status",
  itemsLabel: "Items",

  storage: "Storage",
  used: "used",
  expand: "expand ↗",
  storageExpanded: "Storage (expanded)",
  close: "✕ close",
  storageDetail: "68% used — 12.4 GB of 18 GB",
  usedShort: "68% used",
};

export type TransitionsStrings = typeof fr;
