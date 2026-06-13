/**
 * Chaînes bilingues du module Export planifié.
 * `type ModuleStrings = typeof STR.fr` + `satisfies` garantissent la parité
 * des clés FR/EN à la compilation.
 */

/** Paire de libellés résolue selon la locale courante. */
export type L = { fr: string; en: string };

export type Frequence = "daily" | "weekly" | "monthly";

export type ReportKey = "ventes" | "tresorerie" | "stocks" | "rh" | "qualite";

/** Catalogue des rapports (libellés métier bilingues, clés stables). */
export const REPORT_LABELS: Record<ReportKey, L> = {
  ventes: { fr: "Ventes — synthèse hebdomadaire", en: "Sales — weekly summary" },
  tresorerie: { fr: "Trésorerie — position quotidienne", en: "Treasury — daily cash position" },
  stocks: { fr: "Stocks — ruptures et alertes", en: "Inventory — stockouts and alerts" },
  rh: { fr: "RH — absences du mois", en: "HR — monthly absences" },
  qualite: { fr: "Qualité — non-conformités", en: "Quality — non-conformities" },
};

/** Libellé court de fréquence (bilingue). */
export const FREQ_LABEL: Record<Frequence, L> = {
  daily: { fr: "Quotidien", en: "Daily" },
  weekly: { fr: "Hebdomadaire", en: "Weekly" },
  monthly: { fr: "Mensuel", en: "Monthly" },
};

/** Actions du journal d'activité (bilingues, ré-résolues au render). */
export const ACTIVITY_ACTIONS = {
  sent: { fr: "a envoyé", en: "sent" },
  sentManual: { fr: "a envoyé (manuel)", en: "sent (manual)" },
  paused: { fr: "a suspendu", en: "paused" },
  resumed: { fr: "a réactivé", en: "resumed" },
  deleted: { fr: "a supprimé la planification", en: "deleted the schedule" },
  scheduled: { fr: "a planifié", en: "scheduled" },
} satisfies Record<string, L>;

const fr = {
  /* Partagé (breadcrumbs, liens) */
  moduleTitle: "Export planifié",
  docLabel: "Documentation",
  simLabel: "Simulateur",
  openSimulator: "Ouvrir le simulateur",

  /* Page module (page.tsx) */
  moduleDescription:
    "Envoyez automatiquement vos rapports PDF/CSV par e-mail — quotidien, hebdomadaire ou mensuel. Planifiez, suspendez, déclenchez un envoi manuel : tout est visible dans le Simulateur.",
  categoryBadge: "Données & reporting",
  aboutHeading: "À propos",
  aboutBody:
    "Le module Export planifié envoie automatiquement vos rapports (PDF ou CSV) par e-mail : la DAF reçoit sa position de trésorerie chaque matin, la direction commerciale sa synthèse des ventes chaque lundi. On planifie une fois (rapport + fréquence + heure + destinataires), le planificateur fait le reste — et chaque planification reste pilotable : envoi manuel, suspension, reprise, suppression.",
  componentsHeading: "Composants utilisés",
  compsTableParen1: "statut et format rendus par",
  compsTableParen2: "actions par",
  compsInputParen: "validation e-mail",
  andWord: "et",
  configHeading: "Paramétrage",
  configBody1:
    "Le simulateur fonctionne entièrement en local (données seedées, aucune API requise). En production, brancher la création sur votre planificateur (cron, worker) et l'envoi sur votre service e-mail. Voir la",
  configLinkLabel: "documentation",
  configBody2: "pour le modèle de données et les points d'intégration.",

  /* Page simulateur (simulateur/page.tsx) */
  simPageTitle: "Simulateur — Export planifié",
  simPageDescription:
    "Quatre exports déjà planifiés (ventes, trésorerie, stocks, RH). Planifiez-en un nouveau, déclenchez un envoi manuel, suspendez ou supprimez : chaque action met à jour le tableau, les métriques et l'historique.",

  /* Page documentation (documentation/page.tsx) */
  docPageTitle: "Documentation — Export planifié",
  docPageDescription:
    "Envoi périodique de rapports PDF/CSV par e-mail : modèle de données, cycle de vie et points d'intégration.",
  dataModelHeading: "Modèle de données",
  dataModelP1:
    "Une planification associe un rapport à une fréquence, une heure d'envoi, un format et une liste de destinataires. Le statut (",
  dataModelP2: ") permet de suspendre sans supprimer ; ",
  dataModelP3: " est recalculé à chaque changement.",
  lifecycleHeading: "Cycle de vie",
  lcScheduleTitle: "Planifier",
  lcScheduleDesc: "validation des adresses, calcul du prochain envoi, ajout en tête de liste.",
  lcSendTitle: "Envoyer maintenant",
  lcSendDesc: "déclenchement manuel sans toucher à la planification.",
  lcPauseTitle: "Suspendre / Reprendre",
  lcPauseDesc: "bascule du statut ; le prochain envoi est recalculé à la reprise.",
  lcDeleteTitle: "Supprimer",
  lcDeleteDesc1: "confirmation explicite (",
  lcDeleteDesc2: "), action tracée dans l'historique.",
  integrationHeading: "Intégration en production",
  integrationP1:
    "Le simulateur fonctionne en local (état React seedé). Pour brancher un vrai backend : persister les planifications (table ",
  integrationP2:
    "), déclencher les envois via un cron/worker qui génère le rapport (PDF/CSV) et l'envoie par votre service e-mail, puis journaliser chaque envoi (l'équivalent du flux « Derniers envois »).",

  /* Simulateur — métriques et panneaux */
  metricActive: "Exports actifs",
  metricSends30d: "Envois — 30 derniers jours",
  metricUniqueRecipients: "Destinataires uniques",
  panelScheduled: "Exports planifiés",
  panelNew: "Planifier un nouvel export",
  panelRecent: "Derniers envois",

  /* Simulateur — colonnes du tableau */
  colReport: "Rapport",
  colFormat: "Format",
  colFrequency: "Fréquence",
  colNextSend: "Prochain envoi",
  colLastSend: "Dernier envoi",
  colStatus: "Statut",
  colActions: "Actions",

  /* Simulateur — badges et boutons */
  badgeActive: "Actif",
  badgePaused: "En pause",
  btnSend: "Envoyer",
  btnPause: "Suspendre",
  btnResume: "Reprendre",
  btnDelete: "Supprimer",
  btnSchedule: "Planifier l'export",

  /* Simulateur — formulaire */
  fieldReport: "Rapport",
  fieldFormat: "Format",
  fieldFrequency: "Fréquence",
  fieldTime: "Heure d'envoi",
  fieldRecipients: "Destinataires (séparés par des virgules)",
  phChooseReport: "Choisir un rapport",
  phFormat: "Format",
  phFrequency: "Fréquence",
  phTime: "Heure",
  freqOptDaily: "Quotidien (jours ouvrés)",
  freqOptWeekly: "Hebdomadaire (lundi)",
  freqOptMonthly: "Mensuel (le 1ᵉʳ)",

  /* Simulateur — erreurs de validation */
  errMissingFields: "Choisissez un rapport, une fréquence, une heure et un format.",
  errNoRecipient: "Indiquez au moins un destinataire.",
  errInvalidEmails: (list: string) => `Adresse(s) invalide(s) : ${list}`,

  /* Simulateur — toasts */
  toastSource: "Export planifié",
  toastSentTitle: "Export envoyé",
  toastSentMsg: (name: string, recipients: string) => `« ${name} » envoyé à ${recipients}.`,
  toastResumedTitle: "Export réactivé",
  toastResumedMsg: (name: string) => `Planification « ${name} » réactivée.`,
  toastPausedTitle: "Export suspendu",
  toastPausedMsg: (name: string) => `Planification « ${name} » suspendue.`,
  toastDeletedTitle: "Export supprimé",
  toastDeletedMsg: (name: string) => `Planification « ${name} » supprimée.`,
  toastScheduledTitle: "Export planifié",
  toastScheduledMsg: (name: string, freqLower: string, heure: string, next: string) =>
    `« ${name} » sera envoyé ${freqLower} à ${heure} (prochain envoi : ${next}).`,

  /* Simulateur — modale de confirmation */
  confirmTitle: "Supprimer la planification",
  confirmMessage: (name: string, count: number) =>
    `« ${name} » ne sera plus envoyé à ${count} destinataire(s). Cette action est immédiate.`,
  confirmLabel: "Supprimer",
  cancelLabel: "Annuler",

  /* Simulateur — journal d'activité */
  schedulerActor: "Planificateur",
};

type ModuleStrings = typeof fr;

const en = {
  /* Shared (breadcrumbs, links) */
  moduleTitle: "Scheduled export",
  docLabel: "Documentation",
  simLabel: "Simulator",
  openSimulator: "Open the simulator",

  /* Module page (page.tsx) */
  moduleDescription:
    "Automatically email your PDF/CSV reports — daily, weekly or monthly. Schedule, pause, trigger a manual send: everything is visible in the Simulator.",
  categoryBadge: "Data & reporting",
  aboutHeading: "About",
  aboutBody:
    "The Scheduled export module automatically emails your reports (PDF or CSV): the CFO gets the cash position every morning, the sales leadership its sales summary every Monday. Set it up once (report + frequency + time + recipients) and the scheduler does the rest — each schedule stays fully controllable: manual send, pause, resume, delete.",
  componentsHeading: "Components used",
  compsTableParen1: "status and format rendered with",
  compsTableParen2: "actions with",
  compsInputParen: "email validation",
  andWord: "and",
  configHeading: "Configuration",
  configBody1:
    "The simulator runs entirely locally (seeded data, no API required). In production, wire creation to your scheduler (cron, worker) and delivery to your email service. See the",
  configLinkLabel: "documentation",
  configBody2: "for the data model and integration points.",

  /* Simulator page (simulateur/page.tsx) */
  simPageTitle: "Simulator — Scheduled export",
  simPageDescription:
    "Four exports already scheduled (sales, treasury, inventory, HR). Schedule a new one, trigger a manual send, pause or delete: every action updates the table, the metrics and the history.",

  /* Documentation page (documentation/page.tsx) */
  docPageTitle: "Documentation — Scheduled export",
  docPageDescription:
    "Periodic delivery of PDF/CSV reports by email: data model, lifecycle and integration points.",
  dataModelHeading: "Data model",
  dataModelP1:
    "A schedule ties a report to a frequency, a send time, a format and a list of recipients. The status (",
  dataModelP2: ") lets you pause without deleting; ",
  dataModelP3: " is recalculated on every change.",
  lifecycleHeading: "Lifecycle",
  lcScheduleTitle: "Schedule",
  lcScheduleDesc: "address validation, next-send calculation, added to the top of the list.",
  lcSendTitle: "Send now",
  lcSendDesc: "manual trigger without affecting the schedule.",
  lcPauseTitle: "Pause / Resume",
  lcPauseDesc: "toggles the status; the next send is recalculated on resume.",
  lcDeleteTitle: "Delete",
  lcDeleteDesc1: "explicit confirmation (",
  lcDeleteDesc2: "), action recorded in the history.",
  integrationHeading: "Production integration",
  integrationP1:
    "The simulator runs locally (seeded React state). To wire up a real backend: persist the schedules (",
  integrationP2:
    " table), trigger sends via a cron/worker that generates the report (PDF/CSV) and delivers it through your email service, then log each send (the equivalent of the “Recent sends” feed).",

  /* Simulator — metrics and panels */
  metricActive: "Active exports",
  metricSends30d: "Sends — last 30 days",
  metricUniqueRecipients: "Unique recipients",
  panelScheduled: "Scheduled exports",
  panelNew: "Schedule a new export",
  panelRecent: "Recent sends",

  /* Simulator — table columns */
  colReport: "Report",
  colFormat: "Format",
  colFrequency: "Frequency",
  colNextSend: "Next send",
  colLastSend: "Last sent",
  colStatus: "Status",
  colActions: "Actions",

  /* Simulator — badges and buttons */
  badgeActive: "Active",
  badgePaused: "Paused",
  btnSend: "Send",
  btnPause: "Pause",
  btnResume: "Resume",
  btnDelete: "Delete",
  btnSchedule: "Schedule export",

  /* Simulator — form */
  fieldReport: "Report",
  fieldFormat: "Format",
  fieldFrequency: "Frequency",
  fieldTime: "Send time",
  fieldRecipients: "Recipients (comma-separated)",
  phChooseReport: "Choose a report",
  phFormat: "Format",
  phFrequency: "Frequency",
  phTime: "Time",
  freqOptDaily: "Daily (weekdays)",
  freqOptWeekly: "Weekly (Monday)",
  freqOptMonthly: "Monthly (on the 1st)",

  /* Simulator — validation errors */
  errMissingFields: "Choose a report, a frequency, a time and a format.",
  errNoRecipient: "Enter at least one recipient.",
  errInvalidEmails: (list: string) => `Invalid address(es): ${list}`,

  /* Simulator — toasts */
  toastSource: "Scheduled export",
  toastSentTitle: "Export sent",
  toastSentMsg: (name: string, recipients: string) => `“${name}” sent to ${recipients}.`,
  toastResumedTitle: "Export resumed",
  toastResumedMsg: (name: string) => `Schedule “${name}” resumed.`,
  toastPausedTitle: "Export paused",
  toastPausedMsg: (name: string) => `Schedule “${name}” paused.`,
  toastDeletedTitle: "Export deleted",
  toastDeletedMsg: (name: string) => `Schedule “${name}” deleted.`,
  toastScheduledTitle: "Export scheduled",
  toastScheduledMsg: (name: string, freqLower: string, heure: string, next: string) =>
    `“${name}” will be sent ${freqLower} at ${heure} (next send: ${next}).`,

  /* Simulator — confirm modal */
  confirmTitle: "Delete schedule",
  confirmMessage: (name: string, count: number) =>
    `“${name}” will no longer be sent to ${count} recipient(s). This action takes effect immediately.`,
  confirmLabel: "Delete",
  cancelLabel: "Cancel",

  /* Simulator — activity feed */
  schedulerActor: "Scheduler",
} satisfies ModuleStrings;

export const STR = { fr, en } as const;
export type { ModuleStrings };
