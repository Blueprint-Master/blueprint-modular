/**
 * Chaînes bilingues du module Notifications ciblées.
 * Parité de clés garantie par le type : `en` est déclaré `typeof fr`.
 * Les codes techniques (devis.cree, e-mail, « montant > … ») ne sont jamais traduits :
 * le moteur de règles matche sur ces valeurs.
 */

export type Canal = "in-app" | "e-mail" | "SMS";

export type EventCode =
  | "document.valide"
  | "devis.cree"
  | "ticket.critique"
  | "contrat.echeance_30j"
  | "stock.rupture"
  | "facture.impayee";

/** Clés stables des équipes (valeurs stockées dans les règles, jamais traduites). */
export type TeamKey =
  | "Auteur du document"
  | "Direction commerciale"
  | "Astreinte technique"
  | "Service juridique"
  | "Équipe achats";

/** Texte bilingue stocké structuré et résolu au render selon la locale. */
export type LText = { fr: string; en: string };

export const EVENT_CODES: EventCode[] = [
  "document.valide",
  "devis.cree",
  "ticket.critique",
  "contrat.echeance_30j",
  "stock.rupture",
  "facture.impayee",
];

export const TEAM_KEYS: TeamKey[] = [
  "Auteur du document",
  "Direction commerciale",
  "Astreinte technique",
  "Service juridique",
  "Équipe achats",
];

export const CANAUX: Canal[] = ["in-app", "e-mail", "SMS"];

const fr = {
  // ---- Commun ----
  moduleName: "Notifications ciblées",
  breadcrumbDoc: "Documentation",
  breadcrumbSim: "Simulateur",
  openSimulator: "Ouvrir le simulateur",

  // ---- Page module ----
  pageDescription:
    "Moteur de règles événement → conditions → destinataires/canaux : notifiez la bonne équipe, sur le bon canal, uniquement quand c'est pertinent. Émettez un événement dans le banc d'essai et observez les règles se déclencher.",
  category: "Processus & workflow",
  tabDocumentation: "Documentation",
  tabSimulateur: "Simulateur",
  aboutTitle: "À propos",
  aboutText:
    "Le module Notifications ciblées est un moteur de règles : à chaque événement métier (document validé, devis créé, ticket critique…) il évalue les règles actives — événement, condition optionnelle (ex. « montant > 10 000 »), destinataires (équipe ou rôle), canaux — et envoie les notifications uniquement aux bonnes personnes, sur les bons canaux (in-app, e-mail, SMS). Le banc d'essai intégré émet de vrais événements : les règles se déclenchent, le journal se remplit et les notifications in-app arrivent dans la cloche du header (module Notification).",
  componentsTitle: "Composants utilisés",
  compStatusBy: "statut et canaux rendus par",
  compActionsBy: "actions par",
  compMultiChannel: "multi-canaux",
  compJournal: "journal des déclenchements",
  and: "et",
  paramTitle: "Paramétrage",
  paramText1:
    "Le simulateur fonctionne entièrement en local (règles seedées, aucune API requise). En production, brancher l'émission d'événements sur votre bus (webhooks, file de messages) et les canaux sur vos services d'envoi. Voir la",
  paramLink: "documentation",
  paramText2:
    "pour le modèle de règle, les événements disponibles et les bonnes pratiques anti-spam.",

  // ---- Page documentation ----
  docTitle: "Documentation — Notifications ciblées",
  docDescription:
    "Moteur de règles de notification : modèle de règle, événements disponibles, canaux et bonnes pratiques anti-spam.",
  ruleModelTitle: "Modèle de règle",
  ruleModel1:
    "Une règle associe un événement métier à des destinataires (équipe ou rôle) et à un ou plusieurs canaux. La condition est optionnelle et lisible (ex. « montant > 10 000 ») ; le statut (",
  ruleModel2: ") permet de suspendre sans supprimer, et le compteur",
  ruleModel3: "sert au suivi anti-spam.",
  ruleModelCode: `{
  "nom": "Gros devis → direction commerciale",
  "evenement": "devis.cree",
  "condition": "montant > 10 000",          // optionnelle, lisible
  "destinataires": "Direction commerciale", // équipe ou rôle, pas d'adresses en dur
  "canaux": ["e-mail", "in-app"],           // in-app | e-mail | SMS
  "actif": true,
  "declenchements7j": 4
}`,
  eventsTitle: "Événements disponibles",
  eventItems: [
    { code: "document.valide", desc: "un document vient d'être validé (contexte : auteur)." },
    { code: "devis.cree", desc: "un devis est créé (contexte : montant en €)." },
    { code: "ticket.critique", desc: "un ticket de sévérité critique est ouvert." },
    { code: "contrat.echeance_30j", desc: "un contrat arrive à échéance dans 30 jours." },
    { code: "stock.rupture", desc: "une référence passe en rupture de stock." },
    { code: "facture.impayee", desc: "une facture dépasse sa date d'échéance (contexte : montant)." },
  ],
  eventsNote1: "À chaque événement émis, le moteur évalue toutes les règles",
  eventsNoteStrong: "actives",
  eventsNote2:
    "dont l'événement correspond ; si la règle porte une condition de montant, elle ne se déclenche que si le contexte fournit un montant qui la satisfait.",
  channelsTitle: "Canaux",
  channelItems: [
    {
      name: "in-app",
      desc: "notification dans la cloche du header (module Notification) ; idéal pour l'information courante.",
    },
    {
      name: "e-mail",
      desc: "pour les destinataires hors application ou les sujets à trace écrite (direction, juridique).",
    },
    {
      name: "SMS",
      desc: "réservé à l'urgence réelle (astreinte, incident critique) : coûteux et intrusif.",
    },
  ],
  antispamTitle: "Bonnes pratiques anti-spam",
  antispamItems: [
    {
      strong: "Conditionnez",
      rest: "« devis créé » sans seuil noie la direction ; « montant > 10 000 » cible les cas qui comptent.",
    },
    {
      strong: "Ciblez une équipe, pas tout le monde",
      rest: "un rôle ou une équipe par règle ; évitez les listes de diffusion larges.",
    },
    {
      strong: "Un canal adapté à l'urgence",
      rest: "in-app par défaut, e-mail si une trace est nécessaire, SMS uniquement pour l'astreinte.",
    },
    {
      strong: "Surveillez les déclenchements (7 j)",
      rest: "une règle qui part des dizaines de fois par semaine doit être resserrée ou regroupée en digest.",
    },
    {
      strong: "Suspendez plutôt que supprimer",
      rest: "la pause conserve la configuration ; dupliquez pour tester une variante sans toucher à la règle en service.",
    },
  ],
  prodTitle: "Intégration en production",
  prod1:
    "Le simulateur fonctionne en local (état React seedé) ; le canal in-app est déjà branché sur le contexte de notifications de l'application. Pour un vrai backend : persister les règles (table",
  prod2:
    "), abonner le moteur à votre bus d'événements (webhooks, file de messages), résoudre les équipes en destinataires concrets au moment de l'envoi, et journaliser chaque déclenchement (l'équivalent du « Journal des déclenchements »).",

  // ---- Page simulateur ----
  simPageTitle: "Simulateur — Notifications ciblées",
  simPageDescription:
    "Cinq règles déjà configurées (validation, gros devis, ticket critique, échéance contrat, rupture de stock). Créez une règle, suspendez, dupliquez, supprimez — puis émettez un événement dans le banc d'essai : le moteur évalue les règles, alimente le journal et pousse les notifications in-app dans la cloche du header.",

  // ---- Simulateur : métriques & panneaux ----
  metricActiveRules: "Règles actives",
  metricTriggers7d: "Déclenchements (7 j)",
  metricChannels: "Canaux configurés",
  panelRules: "Règles de notification",
  panelCreate: "Créer une règle",
  panelBench: "Banc d'essai — simuler un événement",
  panelJournal: "Journal des déclenchements",

  // ---- Simulateur : table ----
  colRule: "Règle",
  colRecipients: "Destinataires",
  colChannels: "Canaux",
  colTriggers: "Déclenchements (7 j)",
  colStatus: "Statut",
  colActions: "Actions",
  statusActive: "Active",
  statusPaused: "En pause",
  actionEnable: "Activer",
  actionSuspend: "Suspendre",
  actionDuplicate: "Dupliquer",
  actionDelete: "Supprimer",
  conditionNote: (cond: string) => ` · si ${cond}`,

  // ---- Libellés des codes techniques (résolus au render) ----
  events: {
    "document.valide": "Document validé",
    "devis.cree": "Devis créé",
    "ticket.critique": "Ticket critique ouvert",
    "contrat.echeance_30j": "Contrat à échéance (30 j)",
    "stock.rupture": "Rupture de stock",
    "facture.impayee": "Facture impayée",
  } as Record<EventCode, string>,
  teams: {
    "Auteur du document": "Auteur du document",
    "Direction commerciale": "Direction commerciale",
    "Astreinte technique": "Astreinte technique",
    "Service juridique": "Service juridique",
    "Équipe achats": "Équipe achats",
  } as Record<TeamKey, string>,
  channels: {
    "in-app": "in-app",
    "e-mail": "e-mail",
    SMS: "SMS",
  } as Record<Canal, string>,

  // ---- Noms des règles seedées ----
  seedRules: {
    r1: "Document validé → auteur",
    r2: "Gros devis → direction commerciale",
    r3: "Ticket critique → astreinte",
    r4: "Échéance contrat → juridique",
    r5: "Rupture de stock → achats",
  },
  copySuffix: " (copie)",

  // ---- Formulaire de création ----
  formEventLabel: "Événement déclencheur",
  formEventPlaceholder: "Choisir un événement",
  formConditionLabel: "Condition (optionnelle)",
  formConditionPlaceholder: "ex. montant > 10 000",
  formTeamLabel: "Destinataires (équipe ou rôle)",
  formTeamPlaceholder: "Choisir une équipe",
  formChannelsLabel: "Canaux (au moins un)",
  formSubmit: "Créer la règle",
  errors: {
    event: "Choisissez l'événement déclencheur.",
    team: "Choisissez les destinataires (équipe ou rôle).",
    channels: "Sélectionnez au moins un canal (in-app, e-mail ou SMS).",
  },

  // ---- Banc d'essai ----
  benchIntro:
    "Émettez un événement métier : le moteur évalue les règles actives (événement + condition de montant le cas échéant), journalise chaque déclenchement et pousse les notifications in-app dans la cloche du header.",
  benchEventLabel: "Événement à émettre",
  benchAmountLabel: "Contexte — montant en € (optionnel)",
  benchAmountPlaceholder: "ex. 12500",
  benchSubmit: "Émettre l'événement",
  simNoEvent: "Choisissez un événement à émettre.",
  simBadAmount: (raw: string) =>
    `Contexte « ${raw} » illisible : indiquez un montant numérique (ex. 12500).`,
  simNone: (evt: string, amountNote: string) =>
    `Aucune règle déclenchée pour « ${evt} »${amountNote}.`,
  simNoneDetailCondition:
    " Une règle correspond à l'événement mais sa condition de montant n'est pas remplie.",
  simNoneDetailPaused: " Une règle correspond à l'événement mais elle est en pause.",
  simTriggered: (count: number, total: number, names: string) =>
    `${count} règle${count > 1 ? "s" : ""} déclenchée${count > 1 ? "s" : ""} → ${total} notification${total > 1 ? "s" : ""} (${names}).`,
  namesSeparator: " ; ",
  amountNote: (n: number) => ` (montant : ${n.toLocaleString("fr-FR")} €)`,

  // ---- Toasts ----
  toastSource: "Notifications ciblées",
  toastRuleEnabledTitle: "Règle activée",
  toastRuleSuspendedTitle: "Règle suspendue",
  toastRuleEnabled: (nom: string) => `La règle « ${nom} » est de nouveau active.`,
  toastRuleSuspended: (nom: string) =>
    `La règle « ${nom} » est suspendue : elle ne sera plus évaluée.`,
  toastDuplicatedTitle: "Règle dupliquée",
  toastDuplicated: (nom: string) => `« ${nom} » créée en pause : ajustez-la puis activez-la.`,
  toastDeletedTitle: "Règle supprimée",
  toastDeleted: (nom: string) => `Règle « ${nom} » supprimée.`,
  toastCreatedTitle: "Règle créée",
  toastCreated: (evt: string, cond: string, team: string, channels: string) =>
    `Sur « ${evt} »${cond ? ` (si ${cond})` : ""}, ${team} sera notifié via ${channels}.`,
  toastEmittedTitle: "Événement émis",
  toastEmitted: (count: number, total: number) =>
    `${count} règle${count > 1 ? "s" : ""} déclenchée${count > 1 ? "s" : ""} → ${total} notification${total > 1 ? "s" : ""}. Les envois in-app sont visibles dans la cloche du header.`,

  // ---- Cloche du header (module Notification) ----
  bellTitle: "Notification ciblée",
  bellMessage: (nom: string, team: string, evt: string, montant: number | null) =>
    `Règle « ${nom} » : ${team} notifié (événement ${evt}${montant !== null ? `, montant ${montant.toLocaleString("fr-FR")} €` : ""}).`,

  // ---- Journal des déclenchements ----
  journalActor: "Moteur de règles",
  journalAction: "a déclenché",

  // ---- Modale de suppression ----
  deleteTitle: "Supprimer la règle",
  deleteMessage: (nom: string, evt: string, team: string) =>
    `« ${nom} » (${evt}) ne notifiera plus ${team}. Cette action est immédiate.`,
  deleteConfirm: "Supprimer",
  deleteCancel: "Annuler",
};

const en: typeof fr = {
  // ---- Common ----
  moduleName: "Targeted notifications",
  breadcrumbDoc: "Documentation",
  breadcrumbSim: "Simulator",
  openSimulator: "Open the simulator",

  // ---- Module page ----
  pageDescription:
    "An event → conditions → recipients/channels rules engine: notify the right team, on the right channel, only when it matters. Emit an event in the test bench and watch the rules fire.",
  category: "Process & workflow",
  tabDocumentation: "Documentation",
  tabSimulateur: "Simulator",
  aboutTitle: "About",
  aboutText:
    "The Targeted notifications module is a rules engine: for every business event (document validated, quote created, critical ticket…) it evaluates the active rules — event, optional condition (e.g. “montant > 10 000”), recipients (team or role), channels — and sends notifications only to the right people, on the right channels (in-app, email, SMS). The built-in test bench emits real events: rules fire, the log fills up and in-app notifications land in the header bell (Notification module).",
  componentsTitle: "Components used",
  compStatusBy: "status and channels rendered by",
  compActionsBy: "actions by",
  compMultiChannel: "multi-channel",
  compJournal: "trigger log",
  and: "and",
  paramTitle: "Configuration",
  paramText1:
    "The simulator runs entirely locally (seeded rules, no API required). In production, wire event emission to your bus (webhooks, message queue) and the channels to your delivery services. See the",
  paramLink: "documentation",
  paramText2: "for the rule model, available events and anti-spam best practices.",

  // ---- Documentation page ----
  docTitle: "Documentation — Targeted notifications",
  docDescription:
    "Notification rules engine: rule model, available events, channels and anti-spam best practices.",
  ruleModelTitle: "Rule model",
  ruleModel1:
    "A rule binds a business event to recipients (a team or role) and one or more channels. The condition is optional and human-readable (e.g. “montant > 10 000”); the status (",
  ruleModel2: ") lets you pause without deleting, and the",
  ruleModel3: "counter supports anti-spam monitoring.",
  ruleModelCode: `{
  "nom": "Large quote → sales management",
  "evenement": "devis.cree",
  "condition": "montant > 10 000",          // optional, human-readable
  "destinataires": "Direction commerciale", // team or role, no hard-coded addresses
  "canaux": ["e-mail", "in-app"],           // in-app | e-mail | SMS
  "actif": true,
  "declenchements7j": 4
}`,
  eventsTitle: "Available events",
  eventItems: [
    { code: "document.valide", desc: "a document has just been validated (context: author)." },
    { code: "devis.cree", desc: "a quote is created (context: montant, the amount in €)." },
    { code: "ticket.critique", desc: "a critical-severity ticket is opened." },
    { code: "contrat.echeance_30j", desc: "a contract expires within 30 days." },
    { code: "stock.rupture", desc: "an item goes out of stock." },
    { code: "facture.impayee", desc: "an invoice is past its due date (context: montant)." },
  ],
  eventsNote1: "Each time an event is emitted, the engine evaluates every",
  eventsNoteStrong: "active",
  eventsNote2:
    "rule whose event matches; if the rule carries an amount condition, it fires only when the context provides an amount that satisfies it.",
  channelsTitle: "Channels",
  channelItems: [
    {
      name: "in-app",
      desc: "a notification in the header bell (Notification module); ideal for everyday information.",
    },
    {
      name: "email",
      desc: "for recipients outside the application or topics that need a written trail (management, legal).",
    },
    {
      name: "SMS",
      desc: "reserved for genuine emergencies (on-call, critical incidents): costly and intrusive.",
    },
  ],
  antispamTitle: "Anti-spam best practices",
  antispamItems: [
    {
      strong: "Add conditions",
      rest: "“quote created” with no threshold drowns management; “montant > 10 000” targets the cases that matter.",
    },
    {
      strong: "Target a team, not everyone",
      rest: "one role or team per rule; avoid broad distribution lists.",
    },
    {
      strong: "Match the channel to the urgency",
      rest: "in-app by default, email when a written trail is needed, SMS only for on-call.",
    },
    {
      strong: "Watch the triggers (7 d)",
      rest: "a rule that fires dozens of times a week should be tightened or rolled into a digest.",
    },
    {
      strong: "Suspend rather than delete",
      rest: "pausing keeps the configuration; duplicate to test a variant without touching the rule in service.",
    },
  ],
  prodTitle: "Production integration",
  prod1:
    "The simulator runs locally (seeded React state); the in-app channel is already wired to the application's notification context. For a real backend: persist the rules (a",
  prod2:
    " table), subscribe the engine to your event bus (webhooks, message queue), resolve teams into concrete recipients at send time, and log every trigger (the equivalent of the “Trigger log”).",

  // ---- Simulator page ----
  simPageTitle: "Simulator — Targeted notifications",
  simPageDescription:
    "Five rules already configured (validation, large quotes, critical tickets, contract expiry, stock-outs). Create a rule, suspend, duplicate, delete — then emit an event in the test bench: the engine evaluates the rules, feeds the log and pushes in-app notifications to the header bell.",

  // ---- Simulator: metrics & panels ----
  metricActiveRules: "Active rules",
  metricTriggers7d: "Triggers (7 d)",
  metricChannels: "Configured channels",
  panelRules: "Notification rules",
  panelCreate: "Create a rule",
  panelBench: "Test bench — simulate an event",
  panelJournal: "Trigger log",

  // ---- Simulator: table ----
  colRule: "Rule",
  colRecipients: "Recipients",
  colChannels: "Channels",
  colTriggers: "Triggers (7 d)",
  colStatus: "Status",
  colActions: "Actions",
  statusActive: "Active",
  statusPaused: "Paused",
  actionEnable: "Enable",
  actionSuspend: "Suspend",
  actionDuplicate: "Duplicate",
  actionDelete: "Delete",
  conditionNote: (cond: string) => ` · if ${cond}`,

  // ---- Labels for technical codes (resolved at render) ----
  events: {
    "document.valide": "Document validated",
    "devis.cree": "Quote created",
    "ticket.critique": "Critical ticket opened",
    "contrat.echeance_30j": "Contract expiring (30 d)",
    "stock.rupture": "Out of stock",
    "facture.impayee": "Unpaid invoice",
  } as Record<EventCode, string>,
  teams: {
    "Auteur du document": "Document author",
    "Direction commerciale": "Sales management",
    "Astreinte technique": "Technical on-call",
    "Service juridique": "Legal department",
    "Équipe achats": "Procurement team",
  } as Record<TeamKey, string>,
  channels: {
    "in-app": "in-app",
    "e-mail": "email",
    SMS: "SMS",
  } as Record<Canal, string>,

  // ---- Seeded rule names ----
  seedRules: {
    r1: "Document validated → author",
    r2: "Large quote → sales management",
    r3: "Critical ticket → on-call",
    r4: "Contract expiry → legal",
    r5: "Out of stock → procurement",
  },
  copySuffix: " (copy)",

  // ---- Creation form ----
  formEventLabel: "Trigger event",
  formEventPlaceholder: "Choose an event",
  formConditionLabel: "Condition (optional)",
  formConditionPlaceholder: "e.g. montant > 10 000",
  formTeamLabel: "Recipients (team or role)",
  formTeamPlaceholder: "Choose a team",
  formChannelsLabel: "Channels (at least one)",
  formSubmit: "Create rule",
  errors: {
    event: "Choose the trigger event.",
    team: "Choose the recipients (team or role).",
    channels: "Select at least one channel (in-app, email or SMS).",
  },

  // ---- Test bench ----
  benchIntro:
    "Emit a business event: the engine evaluates the active rules (event plus amount condition where applicable), logs every trigger and pushes in-app notifications to the header bell.",
  benchEventLabel: "Event to emit",
  benchAmountLabel: "Context — amount in € (optional)",
  benchAmountPlaceholder: "e.g. 12500",
  benchSubmit: "Emit event",
  simNoEvent: "Choose an event to emit.",
  simBadAmount: (raw: string) =>
    `Unreadable context “${raw}”: enter a numeric amount (e.g. 12500).`,
  simNone: (evt: string, amountNote: string) =>
    `No rule triggered for “${evt}”${amountNote}.`,
  simNoneDetailCondition:
    " A rule matches the event, but its amount condition is not met.",
  simNoneDetailPaused: " A rule matches the event, but it is paused.",
  simTriggered: (count: number, total: number, names: string) =>
    `${count} rule${count > 1 ? "s" : ""} triggered → ${total} notification${total > 1 ? "s" : ""} (${names}).`,
  namesSeparator: "; ",
  amountNote: (n: number) => ` (amount: €${n.toLocaleString("en-US")})`,

  // ---- Toasts ----
  toastSource: "Targeted notifications",
  toastRuleEnabledTitle: "Rule enabled",
  toastRuleSuspendedTitle: "Rule suspended",
  toastRuleEnabled: (nom: string) => `Rule “${nom}” is active again.`,
  toastRuleSuspended: (nom: string) =>
    `Rule “${nom}” is suspended: it will no longer be evaluated.`,
  toastDuplicatedTitle: "Rule duplicated",
  toastDuplicated: (nom: string) =>
    `“${nom}” created in paused state: adjust it, then enable it.`,
  toastDeletedTitle: "Rule deleted",
  toastDeleted: (nom: string) => `Rule “${nom}” deleted.`,
  toastCreatedTitle: "Rule created",
  toastCreated: (evt: string, cond: string, team: string, channels: string) =>
    `On “${evt}”${cond ? ` (if ${cond})` : ""}, ${team} will be notified via ${channels}.`,
  toastEmittedTitle: "Event emitted",
  toastEmitted: (count: number, total: number) =>
    `${count} rule${count > 1 ? "s" : ""} triggered → ${total} notification${total > 1 ? "s" : ""}. In-app deliveries are visible in the header bell.`,

  // ---- Header bell (Notification module) ----
  bellTitle: "Targeted notification",
  bellMessage: (nom: string, team: string, evt: string, montant: number | null) =>
    `Rule “${nom}”: ${team} notified (event ${evt}${montant !== null ? `, amount €${montant.toLocaleString("en-US")}` : ""}).`,

  // ---- Trigger log ----
  journalActor: "Rules engine",
  journalAction: "triggered",

  // ---- Delete modal ----
  deleteTitle: "Delete rule",
  deleteMessage: (nom: string, evt: string, team: string) =>
    `“${nom}” (${evt}) will no longer notify ${team}. This action takes effect immediately.`,
  deleteConfirm: "Delete",
  deleteCancel: "Cancel",
};

export const STR = { fr, en } as const;
