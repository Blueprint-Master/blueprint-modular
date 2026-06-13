/**
 * Chaînes bilingues du module Webhooks.
 * La parité des clés FR/EN est garantie par le type ModuleStrings.
 */

const fr = {
  // ---- Page module (page.tsx) ----
  moduleTitle: "Webhooks",
  moduleDescription:
    "Émettez vos événements métier vers des URLs externes (Slack, ERP, compta, CRM) avec signature HMAC, journal des livraisons et retries. Testez, suspendez, supprimez : tout est visible dans le Simulateur.",
  categoryBadge: "Intégrations & technique",
  openSimulator: "Ouvrir le simulateur",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",
  aboutTitle: "À propos",
  aboutBody:
    "Le module Webhooks pousse vos événements métier (commande créée, seuil de stock atteint, facture payée…) vers des URLs externes : Slack, ERP, compta, CRM. Chaque webhook associe un événement déclencheur à une URL HTTPS et à un secret de signature HMAC ; la console suit le statut, le taux de succès et le journal des livraisons (code HTTP, durée). Tout reste pilotable : test manuel, suspension, reprise, suppression.",
  componentsTitle: "Composants utilisés",
  compStatusRendered: " (statut et code HTTP rendus par ",
  compActionsBy: ", actions par ",
  compEvent: " (événement), ",
  compValidation: " (validation https://), ",
  compAnd: " et ",
  bpmSnippet: `import bpm

bpm.metricRow([
    bpm.metric("Webhooks actifs", 2),
    bpm.metric("Livraisons 24 h", 196),
    bpm.metric("Taux de succès global", "89,5 %"),
])

bpm.table(
    columns=[("evenement", "Webhook"), ("statut", "Statut"), ("tauxSucces", "Succès")],
    data=webhooks,
)

bpm.button("Créer le webhook", on_click=creer_webhook)`,
  configTitle: "Paramétrage",
  configP1:
    "Le simulateur fonctionne entièrement en local (données seedées, aucune API requise). En production, brancher la création sur votre bus d'événements et l'envoi sur un worker HTTP avec signature HMAC et retries exponentiels. Voir la ",
  configDocLink: "documentation",
  configP2: " pour le modèle de données, la signature et les points d'intégration.",

  // ---- Page simulateur (simulateur/page.tsx) ----
  simulatorBreadcrumb: "Simulateur",
  simulatorTitle: "Simulateur — Webhooks",
  simulatorDescription:
    "Quatre webhooks déjà configurés (Slack, ERP, compta, CRM). Testez une livraison, créez un webhook avec validation de l'URL, suspendez ou supprimez : chaque action met à jour le tableau, les métriques et le journal des livraisons.",

  // ---- Page documentation (documentation/page.tsx) ----
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Webhooks",
  docDescription:
    "Émission d'événements métier vers des URLs externes : modèle de données, signature HMAC, politique de retries et points d'intégration.",
  dataModelTitle: "Modèle de données",
  dataModelBody:
    "Un webhook associe un événement déclencheur à une URL de destination (HTTPS obligatoire) et à un secret de signature. Le statut permet de suspendre sans supprimer ; le taux de succès et le dernier envoi sont recalculés à chaque livraison.",
  hmacTitle: "Signature HMAC",
  hmacP1: "Chaque livraison est signée avec le secret du webhook (",
  hmacP2: ") : l'en-tête ",
  hmacP3: " contient le HMAC-SHA256 de ",
  hmacP4:
    ". Le destinataire recalcule la signature et rejette toute requête dont l'horodatage a plus de 5 minutes (protection anti-rejeu).",
  retriesTitle: "Politique de retries",
  retryItems: [
    {
      label: "Succès",
      text: " — toute réponse 2xx en moins de 10 secondes ; la livraison est journalisée (code, durée).",
    },
    {
      label: "Échec",
      text: " — réponse 4xx/5xx ou timeout : nouvelle tentative avec backoff exponentiel (1 min, 5 min, 30 min, 2 h, 12 h).",
    },
    {
      label: "Statut « Erreur »",
      text: " — après 5 échecs consécutifs, le webhook passe en erreur et une alerte est émise ; les tentatives continuent.",
    },
    {
      label: "Suspension automatique",
      text: " — après 72 h d'échecs ininterrompus, le webhook est mis en pause pour protéger le destinataire.",
    },
  ],
  productionTitle: "Intégration en production",
  prodP1:
    "Le simulateur fonctionne en local (état React seedé). Pour brancher un vrai backend : persister les webhooks (table ",
  prodP2: ") et les livraisons (table ",
  prodP3:
    ", l'équivalent du « Journal des livraisons »), publier les événements métier sur un bus interne, puis déléguer l'envoi HTTP à un worker qui signe chaque requête, applique les retries et met à jour le taux de succès. La rotation du secret se fait sans coupure : deux secrets actifs pendant la fenêtre de migration.",

  // ---- Simulateur (simulateur-content.tsx) ----
  statusLabels: {
    active: "Actif",
    error: "Erreur",
    paused: "En pause",
  },
  eventDescriptions: {
    "commande.creee": "nouvelle commande",
    "commande.expediee": "commande expédiée",
    "stock.seuil_atteint": "seuil de stock",
    "facture.payee": "facture encaissée",
    "client.cree": "nouveau client",
  },
  metricActive: "Webhooks actifs",
  metricDeliveries: "Livraisons 24 h",
  metricSuccessRate: "Taux de succès global",
  panelConfigured: "Webhooks configurés",
  panelAdd: "Ajouter un webhook",
  panelLog: "Journal des livraisons",
  selectLabel: "Événement déclencheur",
  selectPlaceholder: "Choisir un événement",
  inputLabel: "URL de destination (https obligatoire)",
  inputPlaceholder: "https://votre-app.fr/webhooks",
  createButton: "Créer le webhook",
  btnTest: "Tester",
  btnSending: "Envoi…",
  btnSuspend: "Suspendre",
  btnResume: "Activer",
  btnDelete: "Supprimer",
  cancelLabel: "Annuler",
  colWebhook: "Webhook",
  colStatus: "Statut",
  colLastSent: "Dernier envoi",
  colSuccess: "Succès",
  colSecret: "Secret",
  colActions: "Actions",
  colEvent: "Événement",
  colTargetUrl: "URL cible",
  colHttpCode: "Code HTTP",
  colDuration: "Durée",
  colTimestamp: "Horodatage",
  lastSentNow: "à l'instant",
  lastSentMinutes: (minutes: number) => `il y a ${minutes} min`,
  lastSentHours: (hours: number) => `il y a ${hours} h`,
  lastSentYesterday: (time: string) => `hier ${time}`,
  fmtRate: (value: number) => `${value.toFixed(1).replace(".", ",")} %`,
  fmtPercent: (value: number) => `${value} %`,
  fmtDuration: (ms: number) => `${ms} ms`,
  fmtTimestamp: (iso: string) => {
    const [date, time] = iso.slice(0, 19).split("T");
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year} ${time}`;
  },
  errorChooseEvent: "Choisissez un événement déclencheur.",
  errorUrlHttps: "L'URL doit commencer par https:// (TLS obligatoire pour la signature).",
  errorUrlComplete: "Indiquez une URL complète, par exemple https://votre-app.fr/webhooks.",
  toastSource: "Webhooks",
  toastFailTitle: "Échec de la livraison",
  toastFailMsg: (url: string, duree: number) =>
    `${url} a répondu HTTP 500 en ${duree} ms. La livraison sera retentée automatiquement.`,
  toastOkTitle: "Livraison réussie",
  toastOkMsg: (url: string, duree: number) => `${url} a répondu HTTP 200 en ${duree} ms.`,
  toastResumedTitle: "Webhook activé",
  toastResumedMsg: (evenement: string) =>
    `Le webhook « ${evenement} » est de nouveau actif : les prochains événements seront livrés.`,
  toastSuspendedTitle: "Webhook suspendu",
  toastSuspendedMsg: (evenement: string) =>
    `Le webhook « ${evenement} » est suspendu : aucun événement ne sera envoyé.`,
  toastDeletedTitle: "Webhook supprimé",
  toastDeletedMsg: (evenement: string, url: string) =>
    `« ${evenement} → ${url} » a été supprimé. Le secret associé est révoqué.`,
  toastCreatedTitle: "Webhook créé",
  toastCreatedMsg: (evenement: string, url: string, secret: string) =>
    `« ${evenement} » sera livré sur ${url}. Secret de signature : ${secret}.`,
  confirmDeleteTitle: "Supprimer le webhook",
  confirmDeleteMsg: (evenement: string, url: string) =>
    `« ${evenement} » ne sera plus livré sur ${url} et le secret de signature sera révoqué. Cette action est immédiate.`,
};

type ModuleStrings = typeof fr;

const en: ModuleStrings = {
  // ---- Module page (page.tsx) ----
  moduleTitle: "Webhooks",
  moduleDescription:
    "Push your business events to external URLs (Slack, ERP, accounting, CRM) with HMAC signing, a delivery log and retries. Test, suspend, delete: everything is visible in the Simulator.",
  categoryBadge: "Integrations & engineering",
  openSimulator: "Open the simulator",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",
  aboutTitle: "About",
  aboutBody:
    "The Webhooks module pushes your business events (order created, stock threshold reached, invoice paid…) to external URLs: Slack, ERP, accounting, CRM. Each webhook ties a trigger event to an HTTPS URL and an HMAC signing secret; the console tracks status, success rate and the delivery log (HTTP code, duration). Everything stays under control: manual test, suspend, resume, delete.",
  componentsTitle: "Components used",
  compStatusRendered: " (status and HTTP code rendered by ",
  compActionsBy: ", actions by ",
  compEvent: " (event), ",
  compValidation: " (https:// validation), ",
  compAnd: " and ",
  bpmSnippet: `import bpm

bpm.metricRow([
    bpm.metric("Active webhooks", 2),
    bpm.metric("Deliveries (24 h)", 196),
    bpm.metric("Overall success rate", "89.5%"),
])

bpm.table(
    columns=[("evenement", "Webhook"), ("statut", "Status"), ("tauxSucces", "Success")],
    data=webhooks,
)

bpm.button("Create webhook", on_click=creer_webhook)`,
  configTitle: "Configuration",
  configP1:
    "The simulator runs entirely locally (seeded data, no API required). In production, wire creation to your event bus and delivery to an HTTP worker with HMAC signing and exponential retries. See the ",
  configDocLink: "documentation",
  configP2: " for the data model, signature and integration points.",

  // ---- Simulator page (simulateur/page.tsx) ----
  simulatorBreadcrumb: "Simulator",
  simulatorTitle: "Simulator — Webhooks",
  simulatorDescription:
    "Four webhooks already configured (Slack, ERP, accounting, CRM). Test a delivery, create a webhook with URL validation, suspend or delete one: every action updates the table, the metrics and the delivery log.",

  // ---- Documentation page (documentation/page.tsx) ----
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Webhooks",
  docDescription:
    "Pushing business events to external URLs: data model, HMAC signature, retry policy and integration points.",
  dataModelTitle: "Data model",
  dataModelBody:
    "A webhook ties a trigger event to a destination URL (HTTPS required) and a signing secret. The status lets you suspend without deleting; the success rate and last delivery are recalculated after each delivery.",
  hmacTitle: "HMAC signature",
  hmacP1: "Each delivery is signed with the webhook secret (",
  hmacP2: "): the ",
  hmacP3: " header contains the HMAC-SHA256 of ",
  hmacP4:
    ". The recipient recomputes the signature and rejects any request whose timestamp is more than 5 minutes old (replay protection).",
  retriesTitle: "Retry policy",
  retryItems: [
    {
      label: "Success",
      text: " — any 2xx response within 10 seconds; the delivery is logged (code, duration).",
    },
    {
      label: "Failure",
      text: " — 4xx/5xx response or timeout: retried with exponential backoff (1 min, 5 min, 30 min, 2 h, 12 h).",
    },
    {
      label: "“Error” status",
      text: " — after 5 consecutive failures, the webhook switches to error and an alert is raised; retries keep going.",
    },
    {
      label: "Automatic suspension",
      text: " — after 72 h of uninterrupted failures, the webhook is paused to protect the recipient.",
    },
  ],
  productionTitle: "Production integration",
  prodP1:
    "The simulator runs locally (seeded React state). To wire up a real backend: persist webhooks (table ",
  prodP2: ") and deliveries (table ",
  prodP3:
    ", the equivalent of the “Delivery log”), publish business events on an internal bus, then delegate HTTP delivery to a worker that signs each request, applies the retries and updates the success rate. Secret rotation happens with zero downtime: two secrets stay active during the migration window.",

  // ---- Simulator (simulateur-content.tsx) ----
  statusLabels: {
    active: "Active",
    error: "Error",
    paused: "Paused",
  },
  eventDescriptions: {
    "commande.creee": "new order",
    "commande.expediee": "order shipped",
    "stock.seuil_atteint": "stock threshold",
    "facture.payee": "invoice paid",
    "client.cree": "new customer",
  },
  metricActive: "Active webhooks",
  metricDeliveries: "Deliveries (24 h)",
  metricSuccessRate: "Overall success rate",
  panelConfigured: "Configured webhooks",
  panelAdd: "Add a webhook",
  panelLog: "Delivery log",
  selectLabel: "Trigger event",
  selectPlaceholder: "Choose an event",
  inputLabel: "Destination URL (https required)",
  inputPlaceholder: "https://your-app.com/webhooks",
  createButton: "Create webhook",
  btnTest: "Test",
  btnSending: "Sending…",
  btnSuspend: "Suspend",
  btnResume: "Resume",
  btnDelete: "Delete",
  cancelLabel: "Cancel",
  colWebhook: "Webhook",
  colStatus: "Status",
  colLastSent: "Last delivery",
  colSuccess: "Success",
  colSecret: "Secret",
  colActions: "Actions",
  colEvent: "Event",
  colTargetUrl: "Target URL",
  colHttpCode: "HTTP code",
  colDuration: "Duration",
  colTimestamp: "Timestamp",
  lastSentNow: "just now",
  lastSentMinutes: (minutes: number) => `${minutes} min ago`,
  lastSentHours: (hours: number) => `${hours} h ago`,
  lastSentYesterday: (time: string) => `yesterday at ${time}`,
  fmtRate: (value: number) => `${value.toFixed(1)}%`,
  fmtPercent: (value: number) => `${value}%`,
  fmtDuration: (ms: number) => `${ms} ms`,
  fmtTimestamp: (iso: string) => {
    const [date, time] = iso.slice(0, 19).split("T");
    const [year, month, day] = date.split("-");
    return `${month}/${day}/${year} ${time}`;
  },
  errorChooseEvent: "Choose a trigger event.",
  errorUrlHttps: "The URL must start with https:// (TLS is required for signing).",
  errorUrlComplete: "Enter a full URL, for example https://your-app.com/webhooks.",
  toastSource: "Webhooks",
  toastFailTitle: "Delivery failed",
  toastFailMsg: (url: string, duree: number) =>
    `${url} responded with HTTP 500 in ${duree} ms. Delivery will be retried automatically.`,
  toastOkTitle: "Delivery succeeded",
  toastOkMsg: (url: string, duree: number) => `${url} responded with HTTP 200 in ${duree} ms.`,
  toastResumedTitle: "Webhook resumed",
  toastResumedMsg: (evenement: string) =>
    `Webhook “${evenement}” is active again: upcoming events will be delivered.`,
  toastSuspendedTitle: "Webhook suspended",
  toastSuspendedMsg: (evenement: string) =>
    `Webhook “${evenement}” is suspended: no events will be sent.`,
  toastDeletedTitle: "Webhook deleted",
  toastDeletedMsg: (evenement: string, url: string) =>
    `“${evenement} → ${url}” has been deleted. The associated secret has been revoked.`,
  toastCreatedTitle: "Webhook created",
  toastCreatedMsg: (evenement: string, url: string, secret: string) =>
    `“${evenement}” will be delivered to ${url}. Signing secret: ${secret}.`,
  confirmDeleteTitle: "Delete webhook",
  confirmDeleteMsg: (evenement: string, url: string) =>
    `“${evenement}” will no longer be delivered to ${url} and the signing secret will be revoked. This action is immediate.`,
};

export const STR = { fr, en } as const;
export type { ModuleStrings };
