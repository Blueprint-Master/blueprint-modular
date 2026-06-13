/**
 * Chaînes bilingues du module Rapports.
 * La parité de clés FR/EN est garantie par le type : `en` est contraint par
 * `ModuleStrings = typeof STR_FR`.
 */

export type ModeleId = "ca-mensuel" | "commandes-region" | "effectifs-service";
export type PeriodeId = "annee-2025" | "s1-2025" | "s2-2025";
export type ServiceKey = "production" | "commercial" | "support" | "rnd" | "adminFinance";

const STR_FR = {
  /* ------------------------------------------------------------------ */
  /* Page module (page.tsx)                                              */
  /* ------------------------------------------------------------------ */
  breadcrumbModule: "Rapports",
  moduleTitle: "Rapports",
  moduleDescription:
    "Générez des rapports d'entreprise à partir de modèles prédéfinis : choisissez un modèle et une période, visualisez métriques, graphique et tableau, puis exportez en CSV. Tout est testable dans le Simulateur.",
  categoryBadge: "Données & reporting",
  openSimulator: "Ouvrir le simulateur",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",

  aboutTitle: "À propos",
  aboutText:
    "Le module Rapports génère des rapports d'entreprise prêts à diffuser à partir de modèles prédéfinis : chiffre d'affaires mensuel, commandes par région, effectifs par service. On choisit un modèle et une période (année complète ou semestre — la période filtre réellement les données), on génère, et le rapport s'affiche immédiatement : métriques clés, graphique et tableau détaillé. Chaque rapport généré est conservé dans l'historique et exportable en CSV d'un clic.",
  componentsTitle: "Composants utilisés",
  and: "et",
  compMetrics: "indicateurs de tête et métriques du rapport",
  compSelectbox: "modèle et période",
  compCharts: "visualisations",
  compTablePrefix: "détail et historique, variations rendues par",
  compTableActions: "actions par",
  compConfirm: "suppression",
  compToast: "confirmations",
  configTitle: "Paramétrage",
  configText1:
    "Le simulateur fonctionne entièrement en local (jeux de données seedés, aucune API requise). En production, brancher chaque modèle sur vos sources (ERP, CRM, SIRH) et l'export CSV sur votre stockage documentaire. Voir la",
  configDocLink: "documentation",
  configText2: "pour le modèle de données et les points d'intégration.",

  /* ------------------------------------------------------------------ */
  /* Page simulateur (simulateur/page.tsx)                               */
  /* ------------------------------------------------------------------ */
  simBreadcrumb: "Simulateur",
  simTitle: "Simulateur — Rapports",
  simDescription:
    "Trois modèles prêts à l'emploi (CA mensuel, commandes par région, effectifs par service) et deux rapports déjà générés. Choisissez un modèle et une période — le filtre s'applique vraiment aux données —, générez, consultez l'aperçu (métriques, graphique, tableau) et téléchargez le CSV.",

  /* ------------------------------------------------------------------ */
  /* Page documentation (documentation/page.tsx)                         */
  /* ------------------------------------------------------------------ */
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Rapports",
  docDescription:
    "Génération de rapports d'entreprise à partir de modèles : modèle de données, fonctionnement et points d'intégration en production.",
  dataModelTitle: "Modèle de données",
  dm1: "Un ",
  dmStrong1: "modèle de rapport",
  dm2: " décrit une source de données, des colonnes et des visualisations. Un ",
  dmStrong2: "rapport généré",
  dm3: " est l'instanciation d'un modèle sur une période : il fige le périmètre (modèle + période + horodatage + auteur) et sert de base à l'aperçu et à l'export CSV.",
  docJsonExample: `{
  "modele": "ca-mensuel",        // ca-mensuel | commandes-region | effectifs-service
  "periode": "s1-2025",          // annee-2025 | s1-2025 | s2-2025
  "nom": "Chiffre d'affaires mensuel — S1 2025",
  "genereLe": "2026-06-10T09:12:00",
  "auteur": "Claire Morel"
}`,
  providedTitle: "Modèles fournis",
  tmpl1Name: "Chiffre d'affaires mensuel",
  tmpl1Pre: " — 12 mois de CA 2025 avec comparatif 2024 : courbe (",
  tmpl1Post:
    "), tableau des variations N-1 et métriques (total période, meilleur mois, variation vs 2024).",
  tmpl2Name: "Commandes par région",
  tmpl2Pre: " — 6 régions françaises : volume de commandes et panier moyen par semestre, barres (",
  tmpl2Post: "), CA estimé par région.",
  tmpl3Name: "Effectifs par service",
  tmpl3Desc:
    " — 5 services : effectif, ETP et turnover par semestre, avec turnover annuel consolidé sur l'année.",
  behaviourTitle: "Fonctionnement",
  b1Name: "Générer",
  b1Desc:
    " — le couple modèle + période est validé, la période filtre réellement les données (S1 = janvier–juin, S2 = juillet–décembre), le rapport est ajouté en tête de l'historique et l'aperçu s'affiche (métriques, graphique, tableau).",
  b2Name: "Afficher",
  b2Desc: " — recharge l'aperçu d'un rapport déjà généré, avec son périmètre d'origine.",
  b3Name: "Télécharger CSV",
  b3Desc:
    " — export réel côté navigateur (Blob + lien de téléchargement), séparateur « ; » et BOM UTF-8 pour Excel français.",
  b4Name: "Supprimer",
  b4Pre: " — confirmation explicite (",
  b4Post: ") avant retrait de l'historique.",
  prodTitle: "Intégration en production",
  prod1:
    "Le simulateur fonctionne en local (état React seedé, données déterministes). Pour brancher un vrai backend : exposer chaque modèle comme une requête sur vos sources (ERP pour le CA, OMS/CRM pour les commandes, SIRH pour les effectifs), persister les rapports générés (table ",
  prod2:
    " : modèle, période, horodatage, auteur, snapshot des données), produire le CSV côté serveur pour les gros volumes et archiver les fichiers dans votre stockage documentaire. L'historique « Rapports générés » correspond alors à un simple ",
  prod3: " trié par date de génération.",

  /* ------------------------------------------------------------------ */
  /* Seeds bilingues (simulateur-content.tsx)                            */
  /* ------------------------------------------------------------------ */
  models: {
    "ca-mensuel": "Chiffre d'affaires mensuel",
    "commandes-region": "Commandes par région",
    "effectifs-service": "Effectifs par service",
  } as Record<ModeleId, string>,
  periods: {
    "annee-2025": "Année 2025",
    "s1-2025": "S1 2025",
    "s2-2025": "S2 2025",
  } as Record<PeriodeId, string>,
  periodOptions: {
    "annee-2025": "Année 2025",
    "s1-2025": "S1 2025 (janvier–juin)",
    "s2-2025": "S2 2025 (juillet–décembre)",
  } as Record<PeriodeId, string>,
  monthsFull: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthsShort: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
  services: {
    production: "Production",
    commercial: "Commercial",
    support: "Support client",
    rnd: "Recherche & développement",
    adminFinance: "Administration & finance",
  } as Record<ServiceKey, string>,
  you: "Vous",

  /* Métriques de tête */
  metricGenerated30d: "Rapports générés (30 j)",
  metricTemplates: "Modèles disponibles",
  metricLastGenerated: "Dernière génération",

  /* Formulaire de génération */
  panelGenerate: "Générer un rapport",
  labelTemplate: "Modèle de rapport",
  labelPeriod: "Période",
  placeholderTemplate: "Choisir un modèle",
  placeholderPeriod: "Choisir une période",
  formError: "Choisissez un modèle de rapport et une période.",
  buttonGenerate: "Générer",

  /* Aperçu */
  previewTitle: "Aperçu",
  previewMeta: (date: string, author: string, period: string) =>
    `Généré le ${date} par ${author} · période : ${period}`,

  /* Métriques par modèle */
  mCaTotal: "CA total de la période",
  mBestMonth: "Meilleur mois",
  mYoY: "Variation vs 2024",
  mTotalOrders: "Commandes totales",
  mAvgBasket: "Panier moyen global",
  mTopRegion: "Région la plus active",
  ordersAbbr: "cmd",
  mHeadcount: "Effectif total",
  peopleUnit: "pers.",
  mFte: "ETP total",
  mAvgTurnover: "Turnover moyen",

  /* Colonnes des tableaux de rapport */
  colMonth: "Mois",
  colCa2025: "CA 2025",
  colCa2024: "CA 2024",
  colYoY: "Variation N-1",
  colRegion: "Région",
  colOrders: "Commandes",
  colBasket: "Panier moyen",
  colEstimatedCa: "CA estimé",
  colService: "Service",
  colWorkforce: "Effectif",
  colFte: "ETP",
  colTurnover: "Turnover",

  /* Historique */
  panelHistory: "Rapports générés",
  colReport: "Rapport",
  colTemplate: "Modèle",
  colPeriod: "Période",
  colGeneratedOn: "Généré le",
  colActions: "Actions",
  byAuthor: (author: string) => `par ${author}`,
  buttonShow: "Afficher",
  buttonDownloadCsv: "Télécharger CSV",
  buttonDelete: "Supprimer",
  emptyHistory:
    "Aucun rapport pour l'instant : choisissez un modèle et une période ci-dessus, puis cliquez sur « Générer ».",

  /* Toasts */
  toastSource: "Rapports",
  toastGeneratedTitle: "Rapport généré",
  toastGenerated: (name: string) =>
    `« ${name} » généré : aperçu mis à jour, export CSV disponible dans la liste.`,
  toastExportTitle: "Export CSV",
  toastExport: (fileName: string) => `Fichier « ${fileName} » téléchargé.`,
  toastDeletedTitle: "Rapport supprimé",
  toastDeleted: (name: string) => `Rapport « ${name} » supprimé.`,

  /* ConfirmModal */
  confirmTitle: "Supprimer le rapport",
  confirmMessage: (name: string, date: string) =>
    `« ${name} » (généré le ${date}) sera retiré de la liste. Cette action est immédiate.`,
  confirmLabel: "Supprimer",
  cancelLabel: "Annuler",

  /* Dates */
  dateTimeSep: " à ",

  /* Entêtes CSV (traduites au moment de l'export) */
  csvHeaderCa: "Mois;CA 2025 (EUR);CA 2024 (EUR);Variation N-1 (%)",
  csvHeaderRegion: "Région;Commandes;Panier moyen (EUR);CA estimé (EUR)",
  csvHeaderService: "Service;Effectif;ETP;Turnover (%)",
};

export type ModuleStrings = typeof STR_FR;

const STR_EN: ModuleStrings = {
  /* Module page */
  breadcrumbModule: "Reports",
  moduleTitle: "Reports",
  moduleDescription:
    "Generate business reports from predefined templates: choose a template and a period, view metrics, chart and table, then export to CSV. Everything can be tried out in the Simulator.",
  categoryBadge: "Data & reporting",
  openSimulator: "Open the simulator",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",

  aboutTitle: "About",
  aboutText:
    "The Reports module produces ready-to-share business reports from predefined templates: monthly revenue, orders by region, headcount by department. Pick a template and a period (full year or half-year — the period genuinely filters the data), generate, and the report is displayed immediately: key metrics, a chart and a detailed table. Every generated report is kept in the history and can be exported to CSV in one click.",
  componentsTitle: "Components used",
  and: "and",
  compMetrics: "header indicators and report metrics",
  compSelectbox: "template and period",
  compCharts: "charts",
  compTablePrefix: "detail and history, with change badges rendered by",
  compTableActions: "actions by",
  compConfirm: "deletion",
  compToast: "confirmations",
  configTitle: "Configuration",
  configText1:
    "The simulator runs entirely locally (seeded datasets, no API required). In production, connect each template to your sources (ERP, CRM, HRIS) and the CSV export to your document storage. See the",
  configDocLink: "documentation",
  configText2: "for the data model and integration points.",

  /* Simulator page */
  simBreadcrumb: "Simulator",
  simTitle: "Simulator — Reports",
  simDescription:
    "Three ready-to-use templates (monthly revenue, orders by region, headcount by department) and two pre-generated reports. Choose a template and a period — the filter genuinely applies to the data —, generate, review the preview (metrics, chart, table) and download the CSV.",

  /* Documentation page */
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Reports",
  docDescription:
    "Business report generation from templates: data model, behaviour and production integration points.",
  dataModelTitle: "Data model",
  dm1: "A ",
  dmStrong1: "report template",
  dm2: " describes a data source, columns and visualisations. A ",
  dmStrong2: "generated report",
  dm3: " is the instantiation of a template over a period: it freezes the scope (template + period + timestamp + author) and serves as the basis for the preview and the CSV export.",
  docJsonExample: `{
  "modele": "ca-mensuel",        // ca-mensuel | commandes-region | effectifs-service
  "periode": "s1-2025",          // annee-2025 | s1-2025 | s2-2025
  "nom": "Monthly revenue — H1 2025",
  "genereLe": "2026-06-10T09:12:00",
  "auteur": "Claire Morel"
}`,
  providedTitle: "Built-in templates",
  tmpl1Name: "Monthly revenue",
  tmpl1Pre: " — 12 months of 2025 revenue with a 2024 comparison: line chart (",
  tmpl1Post:
    "), year-over-year variation table and metrics (period total, best month, change vs 2024).",
  tmpl2Name: "Orders by region",
  tmpl2Pre: " — 6 French regions: order volume and average order value per half-year, bars (",
  tmpl2Post: "), estimated revenue per region.",
  tmpl3Name: "Headcount by department",
  tmpl3Desc:
    " — 5 departments: headcount, FTE and turnover per half-year, with annual turnover consolidated over the year.",
  behaviourTitle: "How it works",
  b1Name: "Generate",
  b1Desc:
    " — the template + period pair is validated, the period genuinely filters the data (H1 = January–June, H2 = July–December), the report is added to the top of the history and the preview is displayed (metrics, chart, table).",
  b2Name: "View",
  b2Desc: " — reloads the preview of a previously generated report, with its original scope.",
  b3Name: "Download CSV",
  b3Desc:
    " — real browser-side export (Blob + download link), “;” separator and UTF-8 BOM for French Excel.",
  b4Name: "Delete",
  b4Pre: " — explicit confirmation (",
  b4Post: ") before removal from the history.",
  prodTitle: "Production integration",
  prod1:
    "The simulator runs locally (seeded React state, deterministic data). To connect a real backend: expose each template as a query on your sources (ERP for revenue, OMS/CRM for orders, HRIS for headcount), persist generated reports (a ",
  prod2:
    " table: template, period, timestamp, author, data snapshot), produce the CSV server-side for large volumes and archive the files in your document storage. The “Generated reports” history then maps to a simple ",
  prod3: " sorted by generation date.",

  /* Bilingual seeds */
  models: {
    "ca-mensuel": "Monthly revenue",
    "commandes-region": "Orders by region",
    "effectifs-service": "Headcount by department",
  },
  periods: {
    "annee-2025": "Year 2025",
    "s1-2025": "H1 2025",
    "s2-2025": "H2 2025",
  },
  periodOptions: {
    "annee-2025": "Year 2025",
    "s1-2025": "H1 2025 (January–June)",
    "s2-2025": "H2 2025 (July–December)",
  },
  monthsFull: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  services: {
    production: "Production",
    commercial: "Sales",
    support: "Customer support",
    rnd: "Research & development",
    adminFinance: "Administration & finance",
  },
  you: "You",

  /* Header metrics */
  metricGenerated30d: "Reports generated (30 d)",
  metricTemplates: "Available templates",
  metricLastGenerated: "Last generated",

  /* Generation form */
  panelGenerate: "Generate a report",
  labelTemplate: "Report template",
  labelPeriod: "Period",
  placeholderTemplate: "Choose a template",
  placeholderPeriod: "Choose a period",
  formError: "Choose a report template and a period.",
  buttonGenerate: "Generate",

  /* Preview */
  previewTitle: "Preview",
  previewMeta: (date: string, author: string, period: string) =>
    `Generated on ${date} by ${author} · period: ${period}`,

  /* Per-template metrics */
  mCaTotal: "Total revenue for the period",
  mBestMonth: "Best month",
  mYoY: "Change vs 2024",
  mTotalOrders: "Total orders",
  mAvgBasket: "Overall average order value",
  mTopRegion: "Most active region",
  ordersAbbr: "orders",
  mHeadcount: "Total headcount",
  peopleUnit: "people",
  mFte: "Total FTE",
  mAvgTurnover: "Average turnover",

  /* Report table columns */
  colMonth: "Month",
  colCa2025: "Revenue 2025",
  colCa2024: "Revenue 2024",
  colYoY: "YoY change",
  colRegion: "Region",
  colOrders: "Orders",
  colBasket: "Average order value",
  colEstimatedCa: "Estimated revenue",
  colService: "Department",
  colWorkforce: "Headcount",
  colFte: "FTE",
  colTurnover: "Turnover",

  /* History */
  panelHistory: "Generated reports",
  colReport: "Report",
  colTemplate: "Template",
  colPeriod: "Period",
  colGeneratedOn: "Generated on",
  colActions: "Actions",
  byAuthor: (author: string) => `by ${author}`,
  buttonShow: "View",
  buttonDownloadCsv: "Download CSV",
  buttonDelete: "Delete",
  emptyHistory:
    "No reports yet: choose a template and a period above, then click “Generate”.",

  /* Toasts */
  toastSource: "Reports",
  toastGeneratedTitle: "Report generated",
  toastGenerated: (name: string) =>
    `“${name}” generated: preview updated, CSV export available in the list.`,
  toastExportTitle: "CSV export",
  toastExport: (fileName: string) => `File “${fileName}” downloaded.`,
  toastDeletedTitle: "Report deleted",
  toastDeleted: (name: string) => `Report “${name}” deleted.`,

  /* ConfirmModal */
  confirmTitle: "Delete report",
  confirmMessage: (name: string, date: string) =>
    `“${name}” (generated on ${date}) will be removed from the list. This action takes effect immediately.`,
  confirmLabel: "Delete",
  cancelLabel: "Cancel",

  /* Dates */
  dateTimeSep: ", ",

  /* CSV headers (translated at export time) */
  csvHeaderCa: "Month;Revenue 2025 (EUR);Revenue 2024 (EUR);YoY change (%)",
  csvHeaderRegion: "Region;Orders;Average order value (EUR);Estimated revenue (EUR)",
  csvHeaderService: "Department;Headcount;FTE;Turnover (%)",
};

export const STR = { fr: STR_FR, en: STR_EN } as const;
