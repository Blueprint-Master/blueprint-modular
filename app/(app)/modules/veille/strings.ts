/**
 * Chaînes bilingues du module Veille / Monitoring.
 * Parité fr/en garantie par le type : `const en: typeof fr`.
 */

export type Localized = { fr: string; en: string };

export type SourceStatus = "active" | "warning" | "paused";

export type RelTimeKey = "min12" | "h1" | "h6" | "yesterday" | "justNow";

export type ActivityActionKey =
  | "collected"
  | "spikeDetected"
  | "alertPublished"
  | "sourceAdded";

const fr = {
  // Partagé
  moduleName: "Veille",
  breadcrumbModules: "Modules",

  // En-tête de la page module (page.tsx)
  moduleDescription:
    "Centralisez vos sources (RSS, API, pages, alertes), suivez la collecte et remontez les écarts. Testez l'assemblage dans le Simulateur.",
  categoryBadge: "Données & reporting",
  openDocumentation: "Ouvrir la documentation",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",

  // Onglet documentation intégré (page.tsx)
  aboutHeading: "À propos",
  about1:
    "Le module Veille centralise vos sources d'information (flux RSS, API, pages web, alertes métier), suit leur collecte et remonte les écarts comme des alertes. Le simulateur est un assemblage réel de composants ",
  about2:
    " — métriques, tableau de sources avec statuts, détection d'anomalie et flux d'activité — avec des données câblées que vous pouvez faire évoluer (ajout d'une source).",
  componentsHeading: "Composants utilisés",
  componentsStatusNote: " (statut rendu par ",
  componentsAnd: " et ",
  configHeading: "Paramétrage",
  config1: "Le module fait partie de l'application Next.js : ",
  configThen: " puis ",
  config2: " suffisent. Définir ",
  configIn: " dans ",
  config3: " comme pour le reste de l'app. Voir la ",
  configDocLink: "documentation",
  config4: " pour les sources, seuils d'alerte et filtres.",

  // Simulateur (page.tsx)
  metricSources: "Sources suivies",
  metricAlerts: "Alertes à vérifier",
  metricArticles: "Articles collectés",
  anomalyTitle: "Pic de prix détecté — matières premières",
  anomalyExpected: "+2 % / sem.",
  anomalyActual: "+11 % / sem.",
  panelSourcesTitle: "Sources suivies",
  panelAddTitle: "Ajouter une source",
  panelActivityTitle: "Activité récente",
  colSource: "Source",
  colType: "Type",
  colStatus: "Statut",
  colLast: "Dernière collecte",
  colArticles: "Articles",
  typeOptions: [
    { value: "RSS", label: "Flux RSS" },
    { value: "API", label: "API REST" },
    { value: "Page", label: "Page web (scraping)" },
    { value: "Alerte", label: "Alerte métier" },
  ],
  statusLabels: {
    active: "Active",
    warning: "À vérifier",
    paused: "En pause",
  },
  relTime: {
    min12: "il y a 12 min",
    h1: "il y a 1 h",
    h6: "il y a 6 h",
    yesterday: "hier",
    justNow: "à l'instant",
  },
  activityActor: "Veille",
  activityActions: {
    collected: "a collecté",
    spikeDetected: "a détecté un pic sur",
    alertPublished: "a publié l'alerte",
    sourceAdded: "a ajouté la source",
  },
  sourceNameLabel: "Nom de la source",
  sourceNamePlaceholder: "Ex. Veille concurrentielle — secteur X",
  typeLabel: "Type",
  typePlaceholder: "Type",
  addButton: "Ajouter",

  // Page documentation (documentation/page.tsx)
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Veille",
  docDescription:
    "Monitoring et veille : suivi des sources, alertes et flux d'information.",
  intro1: "Les modules Blueprint Modular font partie de l'",
  introStrongApp: "application Next.js",
  intro2: ". Il n'y a pas de package séparé par module (pas de ",
  introNor: " ni ",
  intro3: ") : on installe l'application une fois. Cette documentation décrit ",
  introStrongInstall: "comment installer",
  intro4: " l'app pour accéder au module Veille, ",
  introStrongWorks: "comment il fonctionne",
  intro5: " (état actuel et évolutions prévues), ",
  introStrongConfigure: "comment le paramétrer",
  intro6:
    " (aucune variable spécifique pour l'instant) et comment l'utiliser (page ",
  intro7: ").",
  howHeading: "Comment fonctionne le module Veille",
  how1:
    "Le module Veille centralise la veille stratégique et opérationnelle : agrégation de flux (RSS, API, pages web, alertes métier), suivi de la collecte et remontée des écarts. La page ",
  how2:
    " propose un onglet Documentation et un onglet Simulateur : ce dernier est un assemblage réel de composants ",
  how3: " — ",
  how4: " (sources suivies, alertes, articles), ",
  how5: " avec statut rendu par ",
  how6: ", ",
  how7: " (pic détecté), ",
  how8: " (collectes récentes) et un formulaire ",
  how9:
    " pour ajouter une source. Les données du simulateur sont câblées côté client (état React) afin de démontrer l'interaction sans dépendance externe.",
  installHeading: "Installation et dépendances",
  installBody:
    "Le module Veille fait partie de l'application Next.js. Installer l'application suffit pour accéder à la page du module. Aucune dépendance externe spécifique (API, base dédiée) n'est requise pour l'instant.",
  commandsHeading:
    "Résumé des commandes (installer l'app et accéder au module Veille)",
  bashSnippet: `# Depuis la racine du projet (application Next.js)
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy
npm run dev

# Ouvrir le module Veille
# http://localhost:3000/modules/veille`,
  envNote1: "Définir ",
  envNoteIn: " dans ",
  envNote2:
    " (comme pour le reste de l'app). Aucune variable d'environnement spécifique au module Veille n'est requise pour l'instant.",
  loadHeading: "Comment charger et utiliser le module",
  loadStrongLoad: "Charger",
  load1: " : le module est intégré à l'app ; après ",
  loadAnd: " et ",
  load2: ", il est disponible. ",
  loadStrongUse: "Utiliser",
  load3: " : ouvrez la page ",
  load4:
    " pour accéder à la description du module et aux évolutions prévues (sources RSS, alertes, filtres). Aucune API dédiée ni paramètre spécifique pour l'instant.",
  envHeading: "Variables d'environnement et paramétrage",
  envBody:
    "Aucune variable d'environnement spécifique au module Veille. Les évolutions à venir (sources, seuils d'alertes, filtres) pourront introduire des paramètres ou variables ; la documentation sera mise à jour en conséquence.",
  evolHeading: "Paramétrage et évolution",
  evolBody:
    "Les fonctionnalités à venir peuvent inclure : configuration des sources (URLs RSS, APIs), seuils d'alertes, filtres par thème ou workspace, et intégration avec le module Notification pour les alertes. Lorsque ces fonctionnalités seront implémentées, la documentation sera mise à jour avec les paramètres, API et lignes de commande associés.",
  backToModule: "← Retour au module Veille",

  // Page simulateur (simulateur/page.tsx)
  redirecting: "Redirection vers le module Veille…",
};

const en: typeof fr = {
  // Shared
  moduleName: "Monitoring",
  breadcrumbModules: "Modules",

  // Module page header (page.tsx)
  moduleDescription:
    "Centralize your sources (RSS, API, pages, alerts), track collection and surface deviations. Try the assembly in the Simulator.",
  categoryBadge: "Data & reporting",
  openDocumentation: "Open the documentation",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",

  // Embedded documentation tab (page.tsx)
  aboutHeading: "About",
  about1:
    "The Monitoring module centralizes your information sources (RSS feeds, APIs, web pages, business alerts), tracks their collection and surfaces deviations as alerts. The simulator is a real assembly of ",
  about2:
    " components — metrics, a source table with statuses, anomaly detection and an activity feed — with wired data you can evolve (adding a source).",
  componentsHeading: "Components used",
  componentsStatusNote: " (status rendered by ",
  componentsAnd: " and ",
  configHeading: "Configuration",
  config1: "The module is part of the Next.js application: ",
  configThen: " then ",
  config2: " is all you need. Set ",
  configIn: " in ",
  config3: " as for the rest of the app. See the ",
  configDocLink: "documentation",
  config4: " for sources, alert thresholds and filters.",

  // Simulator (page.tsx)
  metricSources: "Tracked sources",
  metricAlerts: "Alerts to review",
  metricArticles: "Collected articles",
  anomalyTitle: "Price spike detected — raw materials",
  anomalyExpected: "+2% / week",
  anomalyActual: "+11% / week",
  panelSourcesTitle: "Tracked sources",
  panelAddTitle: "Add a source",
  panelActivityTitle: "Recent activity",
  colSource: "Source",
  colType: "Type",
  colStatus: "Status",
  colLast: "Last collection",
  colArticles: "Articles",
  typeOptions: [
    { value: "RSS", label: "RSS feed" },
    { value: "API", label: "REST API" },
    { value: "Page", label: "Web page (scraping)" },
    { value: "Alerte", label: "Business alert" },
  ],
  statusLabels: {
    active: "Active",
    warning: "To review",
    paused: "Paused",
  },
  relTime: {
    min12: "12 min ago",
    h1: "1 h ago",
    h6: "6 h ago",
    yesterday: "yesterday",
    justNow: "just now",
  },
  activityActor: "Monitoring",
  activityActions: {
    collected: "collected",
    spikeDetected: "detected a spike on",
    alertPublished: "published the alert",
    sourceAdded: "added the source",
  },
  sourceNameLabel: "Source name",
  sourceNamePlaceholder: "e.g. Competitive watch — sector X",
  typeLabel: "Type",
  typePlaceholder: "Type",
  addButton: "Add",

  // Documentation page (documentation/page.tsx)
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Monitoring",
  docDescription:
    "Monitoring and watch: source tracking, alerts and information feeds.",
  intro1: "Blueprint Modular modules are part of the ",
  introStrongApp: "Next.js application",
  intro2: ". There is no separate package per module (no ",
  introNor: " or ",
  intro3: "): you install the application once. This documentation covers ",
  introStrongInstall: "how to install",
  intro4: " the app to access the Monitoring module, ",
  introStrongWorks: "how it works",
  intro5: " (current state and planned evolutions), ",
  introStrongConfigure: "how to configure it",
  intro6: " (no specific variables for now) and how to use it (the ",
  intro7: " page).",
  howHeading: "How the Monitoring module works",
  how1:
    "The Monitoring module centralizes strategic and operational intelligence: feed aggregation (RSS, APIs, web pages, business alerts), collection tracking and surfacing of deviations. The ",
  how2:
    " page offers a Documentation tab and a Simulator tab: the latter is a real assembly of ",
  how3: " components — ",
  how4: " (tracked sources, alerts, articles), ",
  how5: " with status rendered by ",
  how6: ", ",
  how7: " (spike detected), ",
  how8: " (recent collections) and a ",
  how9:
    " form to add a source. The simulator data is wired client-side (React state) to demonstrate the interaction without any external dependency.",
  installHeading: "Installation and dependencies",
  installBody:
    "The Monitoring module is part of the Next.js application. Installing the application is enough to access the module page. No specific external dependency (API, dedicated database) is required for now.",
  commandsHeading:
    "Command summary (install the app and access the Monitoring module)",
  bashSnippet: `# From the project root (Next.js application)
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy
npm run dev

# Open the Monitoring module
# http://localhost:3000/modules/veille`,
  envNote1: "Set ",
  envNoteIn: " in ",
  envNote2:
    " (as for the rest of the app). No environment variable specific to the Monitoring module is required for now.",
  loadHeading: "How to load and use the module",
  loadStrongLoad: "Load",
  load1: ": the module is built into the app; after ",
  loadAnd: " and ",
  load2: ", it is available. ",
  loadStrongUse: "Use",
  load3: ": open the ",
  load4:
    " page to access the module description and planned evolutions (RSS sources, alerts, filters). No dedicated API or specific parameter for now.",
  envHeading: "Environment variables and configuration",
  envBody:
    "No environment variable specific to the Monitoring module. Upcoming evolutions (sources, alert thresholds, filters) may introduce parameters or variables; the documentation will be updated accordingly.",
  evolHeading: "Configuration and evolution",
  evolBody:
    "Upcoming features may include: source configuration (RSS URLs, APIs), alert thresholds, filters by theme or workspace, and integration with the Notification module for alerts. When these features are implemented, the documentation will be updated with the related parameters, APIs and command lines.",
  backToModule: "← Back to the Monitoring module",

  // Simulator page (simulateur/page.tsx)
  redirecting: "Redirecting to the Monitoring module…",
};

export const STR = { fr, en } as const;
