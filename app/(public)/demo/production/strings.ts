/**
 * Dictionnaire bilingue LOCAL pour la démo Production publique.
 * `en: typeof fr` garantit qu'une clé EN manquante casse le build.
 * On NE traduit PAS les identifiants de données mock (noms de lignes, codes, IDs).
 */

const fr = {
  // Chrome / layout
  demoBadge: "Démo Production",
  documentation: "Documentation",
  appBuilder: "App Builder",
  demoBanner:
    "Démo — données fictives. Déployez votre propre instance pour connecter vos lignes et indicateurs.",

  // Nav
  navOverview: "Vue globale",
  navLines: "Lignes",
  navAlerts: "Alertes",
  navNewSession: "Saisir une session",

  // Error boundary
  errorTitle: "Erreur d’affichage",
  errorBody:
    "Le dashboard démo n’a pas pu s’afficher. Rechargez la page ou réessayez plus tard.",

  // Unavailable fallback (page.tsx)
  unavailableTitle: "Démo indisponible",
  unavailableBody:
    "Le serveur n'a pas pu charger les données. Vérifiez la base de données ou réessayez plus tard.",
  retry: "Réessayer",
  backHome: "Retour à l'accueil",

  // Overview page
  overviewTitle: "Vue globale",
  metricGlobalTRS: "TRS global",
  metricRejectRate: "Taux de rejet",
  metricMaterialLoss: "Pertes matière (%)",
  metricPartsProduced: "Pièces produites",
  trsObjective: (trs: string, target: string | number) =>
    `${trs}% / objectif ${target}%`,
  trsBelowObjective:
    "TRS sous l’objectif — couleur d’alerte appliquée au besoin.",
  trsEvolution: "Évolution TRS (période)",
  linesSummary: "Résumé des lignes",
  colLine: "Ligne",
  colCode: "Code",
  colTRS: "TRS %",
  colStatus: "Statut",
  colAction: "Action",
  seeDetail: "Voir le détail →",
  activeCriticalAlerts: "Alertes critiques actives",
  seeAllAlerts: "Voir toutes les alertes →",
  noProductionData: "Aucune donnée production. Lancez le seed :",

  // Alerts client
  alertsTitle: "Alertes",
  alertsCount: (active: number, critical: number) =>
    `${active} alerte(s) active(s) dont ${critical} critique(s).`,
  severityLabel: "Sévérité :",
  statusLabel: "Statut :",
  severityAll: "Toutes",
  statusActive: "Actives",
  statusAllPlural: "Toutes",
  exportCSV: "Export CSV",
  exportPDF: "Export PDF (impression)",
  colDate: "Date",
  colType: "Type",
  colSeverity: "Sévérité",
  colMessage: "Message",
  colValueVsThreshold: "Valeur vs Seuil",
  acknowledge: "Acquitter",
  acknowledged: "Acquittée ✓",

  // Lines client
  colAvailability: "Disponibilité %",
  colPerformance: "Performance %",
  colQuality: "Qualité %",
  colSessions: "Sessions",

  // Line detail
  lineNotFound: (code: string) => `Ligne "${code}" introuvable.`,
  backToLines: "← Retour aux lignes",
  lineMeta: (code: string, status: string, rate: number | string) =>
    `Code : ${code} — Statut : ${status} — Cadence théorique : ${rate} u/h`,
  metricTRS: "TRS",
  metricAvailability: "Disponibilité",
  metricPerformance: "Performance",
  metricQuality: "Qualité",
  materialLossPeriod: "Pertes matière (période)",
  lastSessions: "Dernières sessions",
  colShift: "Shift",
  colOperator: "Opérateur",
  colGoodTotal: "Bonnes / Total",
  colLossesKg: "Pertes (kg)",
  colNotes: "Notes",
  lineAlerts: "Alertes de cette ligne",

  // New session form
  newSessionTitle: "Saisir une session (simulation)",
  fieldProductionLine: "Ligne de production",
  fieldShift: "Shift",
  fieldOperator: "Opérateur",
  operatorPlaceholder: "Nom de l'opérateur",
  fieldStart: "Début",
  fieldEnd: "Fin",
  fieldAvailableTime: "Temps disponible (min)",
  fieldPlannedStops: "Arrêts planifiés (min)",
  fieldUnplannedStops: "Arrêts non planifiés (min)",
  fieldPartsProduced: "Pièces produites",
  fieldGoodParts: "Pièces conformes",
  fieldMaterialUsed: "Matière utilisée (kg)",
  fieldMaterialLost: "Matière perdue (kg)",
  fieldNotes: "Notes",
  notesPlaceholder: "Notes optionnelles",
  saveSimulation: "Enregistrer (simulation)",
  resultTitle: "Résultat (simulation)",
  resultSummary: (
    trs: number,
    availability: number,
    performance: number,
    quality: number,
  ) =>
    `Session enregistrée (simulation) — TRS calculé : ${trs}% | Disponibilité : ${availability}% | Performance : ${performance}% | Qualité : ${quality}%`,
  resultNote:
    "En production réelle, cette session serait enregistrée en base et déclencherait une alerte si TRS < 70%.",
  newEntry: "Nouvelle saisie",
  shiftMorning: "Matin",
  shiftAfternoon: "Après-midi",
  shiftNight: "Nuit",

  // DemoProductionDashboard (legacy/standalone dashboard view)
  dashboardTitle: "Dashboard Production",
  metricBestLine: "Meilleure ligne",
  metricLineToWatch: "Ligne à surveiller",
  trsTargetLabel: (target: number | string) => `Objectif TRS : ${target} %`,
  trsEvolution30d: "Évolution TRS (30 jours)",
  productionLines: "Lignes de production",
  noLine: "Aucune ligne.",
  activeAlertsTitle: "Alertes actives",
  noActiveAlert: "Aucune alerte active.",
  colAvailShort: "Dispo %",
  colPerfShort: "Perf %",
  assistantTitle: "Assistant Production",
};

const en: typeof fr = {
  demoBadge: "Production Demo",
  documentation: "Documentation",
  appBuilder: "App Builder",
  demoBanner:
    "Demo — sample data. Deploy your own instance to connect your lines and indicators.",

  navOverview: "Overview",
  navLines: "Lines",
  navAlerts: "Alerts",
  navNewSession: "Log a session",

  errorTitle: "Display error",
  errorBody:
    "The demo dashboard could not be displayed. Reload the page or try again later.",

  unavailableTitle: "Demo unavailable",
  unavailableBody:
    "The server could not load the data. Check the database or try again later.",
  retry: "Retry",
  backHome: "Back to home",

  overviewTitle: "Overview",
  metricGlobalTRS: "Global OEE",
  metricRejectRate: "Reject rate",
  metricMaterialLoss: "Material loss (%)",
  metricPartsProduced: "Parts produced",
  trsObjective: (trs: string, target: string | number) =>
    `${trs}% / target ${target}%`,
  trsBelowObjective:
    "OEE below target — alert color applied as needed.",
  trsEvolution: "OEE trend (period)",
  linesSummary: "Lines summary",
  colLine: "Line",
  colCode: "Code",
  colTRS: "OEE %",
  colStatus: "Status",
  colAction: "Action",
  seeDetail: "View details →",
  activeCriticalAlerts: "Active critical alerts",
  seeAllAlerts: "View all alerts →",
  noProductionData: "No production data. Run the seed:",

  alertsTitle: "Alerts",
  alertsCount: (active: number, critical: number) =>
    `${active} active alert(s), ${critical} critical.`,
  severityLabel: "Severity:",
  statusLabel: "Status:",
  severityAll: "All",
  statusActive: "Active",
  statusAllPlural: "All",
  exportCSV: "Export CSV",
  exportPDF: "Export PDF (print)",
  colDate: "Date",
  colType: "Type",
  colSeverity: "Severity",
  colMessage: "Message",
  colValueVsThreshold: "Value vs Threshold",
  acknowledge: "Acknowledge",
  acknowledged: "Acknowledged ✓",

  colAvailability: "Availability %",
  colPerformance: "Performance %",
  colQuality: "Quality %",
  colSessions: "Sessions",

  lineNotFound: (code: string) => `Line "${code}" not found.`,
  backToLines: "← Back to lines",
  lineMeta: (code: string, status: string, rate: number | string) =>
    `Code: ${code} — Status: ${status} — Theoretical rate: ${rate} u/h`,
  metricTRS: "OEE",
  metricAvailability: "Availability",
  metricPerformance: "Performance",
  metricQuality: "Quality",
  materialLossPeriod: "Material loss (period)",
  lastSessions: "Latest sessions",
  colShift: "Shift",
  colOperator: "Operator",
  colGoodTotal: "Good / Total",
  colLossesKg: "Losses (kg)",
  colNotes: "Notes",
  lineAlerts: "Alerts for this line",

  newSessionTitle: "Log a session (simulation)",
  fieldProductionLine: "Production line",
  fieldShift: "Shift",
  fieldOperator: "Operator",
  operatorPlaceholder: "Operator name",
  fieldStart: "Start",
  fieldEnd: "End",
  fieldAvailableTime: "Available time (min)",
  fieldPlannedStops: "Planned stops (min)",
  fieldUnplannedStops: "Unplanned stops (min)",
  fieldPartsProduced: "Parts produced",
  fieldGoodParts: "Good parts",
  fieldMaterialUsed: "Material used (kg)",
  fieldMaterialLost: "Material lost (kg)",
  fieldNotes: "Notes",
  notesPlaceholder: "Optional notes",
  saveSimulation: "Save (simulation)",
  resultTitle: "Result (simulation)",
  resultSummary: (
    trs: number,
    availability: number,
    performance: number,
    quality: number,
  ) =>
    `Session saved (simulation) — Computed OEE: ${trs}% | Availability: ${availability}% | Performance: ${performance}% | Quality: ${quality}%`,
  resultNote:
    "In real production, this session would be saved to the database and would trigger an alert if OEE < 70%.",
  newEntry: "New entry",
  shiftMorning: "Morning",
  shiftAfternoon: "Afternoon",
  shiftNight: "Night",

  dashboardTitle: "Production Dashboard",
  metricBestLine: "Best line",
  metricLineToWatch: "Line to watch",
  trsTargetLabel: (target: number | string) => `OEE target: ${target} %`,
  trsEvolution30d: "OEE trend (30 days)",
  productionLines: "Production lines",
  noLine: "No line.",
  activeAlertsTitle: "Active alerts",
  noActiveAlert: "No active alert.",
  colAvailShort: "Avail. %",
  colPerfShort: "Perf. %",
  assistantTitle: "Production Assistant",
};

export const STR = { fr, en } as const;
