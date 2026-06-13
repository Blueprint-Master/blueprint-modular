/**
 * Chaînes bilingues du module Connecteurs.
 * `en` est typé sur `fr` : toute clé manquante ou excédentaire casse la compilation.
 */
const fr = {
  // ----- Commun -----
  pageTitle: "Connecteurs",
  openSimulator: "Ouvrir le simulateur",
  num: (n: number) => n.toLocaleString("fr-FR"),

  // ----- Page module (page.tsx) -----
  pageDescription:
    "Hub d'intégrations entrantes : API REST, SFTP, PostgreSQL, MySQL. Testez les connexions, lancez des synchronisations, suivez la volumétrie — tout est visible dans le Simulateur.",
  badgeCategory: "Intégrations & technique",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",
  aboutTitle: "À propos",
  aboutText:
    "Le module Connecteurs centralise vos intégrations de données entrantes : l'ERP expose ses écritures via API REST, la banque dépose ses relevés sur un SFTP, le datawarehouse se lit en PostgreSQL. Chaque connecteur déclare une source (type + hôte + identifiant), une planification de synchronisation et remonte son état de santé : statut, dernière synchro, volumétrie importée. Tout est pilotable à la main — tester la connexion, lancer une synchronisation, corriger un identifiant refusé, supprimer.",
  componentsTitle: "Composants utilisés",
  compBadge: "type et statut rendus par",
  compButton: "actions par",
  compInput: "validation hôte/URL",
  compFeed: "journal de synchronisation",
  and: "et",
  setupTitle: "Paramétrage",
  setupText1:
    "Le simulateur fonctionne entièrement en local (données seedées, aucune API requise). En production, brancher le test de connexion et les synchronisations sur vos workers, et stocker les secrets dans un coffre dédié. Voir la",
  setupLinkLabel: "documentation",
  setupText2:
    "pour le modèle de données, la gestion des secrets et la planification des synchros.",

  // ----- Page simulateur (simulateur/page.tsx) -----
  simBreadcrumb: "Simulateur",
  simTitle: "Simulateur — Connecteurs",
  simDescription:
    "Quatre connecteurs déjà configurés (ERP, banque, datawarehouse, CRM). Testez une connexion, lancez une synchronisation, corrigez l'identifiant refusé du datawarehouse, ajoutez un connecteur ou supprimez-en un : chaque action met à jour le tableau, les métriques et le journal.",

  // ----- Page documentation (documentation/page.tsx) -----
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Connecteurs",
  docDescription:
    "Intégrations de données entrantes : types de connecteurs, modèle de données, gestion des secrets et planification des synchronisations.",
  docTypesTitle: "Types de connecteurs",
  typeApiRest:
    "— interrogation HTTP(S) paginée d'une API métier (ERP, CRM). Authentification par jeton ou compte de service ; idéal pour des synchros fréquentes (horaires) et incrémentales.",
  typeSftp:
    "— récupération de fichiers déposés par un tiers (relevés bancaires, exports paie). Le connecteur liste un répertoire, importe les nouveaux fichiers et les archive ; rythme typiquement quotidien.",
  typePostgres:
    "— lecture directe d'une base (datawarehouse, réplique analytique) via un compte en lecture seule, avec curseur incrémental sur une colonne de mise à jour.",
  typeMysql:
    "— même principe que PostgreSQL pour les applications historiques adossées à MySQL/MariaDB.",
  docModelTitle: "Modèle de données",
  docModelText:
    "Un connecteur associe une source (type + hôte/URL + identifiant) à une planification et à un état de santé observable : statut, dernière synchronisation, volumétrie importée sur 24 h. Le secret n'est jamais stocké dans cet enregistrement — seul un pointeur vers le coffre y figure.",
  docJsonExample: `{
  "nom": "ERP Sage — API REST",
  "type": "API REST",                    // API REST | SFTP | PostgreSQL | MySQL
  "hote": "https://api.sage.acme.fr/v3",
  "identifiant": "svc-bpm-sage",         // compte de service (lecture seule)
  "secretRef": "vault://connecteurs/sage-api-token",
  "statut": "connected",                 // connected | error | paused
  "planification": "0 * * * *",          // cron — toutes les heures
  "derniereSynchro": "2026-06-12T09:00:00Z",
  "lignes24h": 12400
}`,
  docSecretsTitle: "Gestion des secrets",
  secret1a:
    "Les jetons, mots de passe et clés SSH sont stockés dans un coffre (Vault, AWS Secrets Manager…) et référencés par ",
  secret1b: " ; jamais en base ni dans les journaux.",
  secret2:
    "Utilisez des comptes de service dédiés en lecture seule, un par connecteur, pour pouvoir révoquer sans effet de bord.",
  secret3a: "Une authentification refusée passe le connecteur en statut ",
  secret3b:
    " : la correction de l'identifiant suivie d'un test de connexion (flux « Corriger » puis « Tester » du simulateur) rétablit le statut ",
  secret3c: ".",
  docSchedTitle: "Planification des synchros",
  sched1:
    "Chaque connecteur porte une expression cron exécutée par un worker : toutes les heures pour un ERP, quotidien à 06:00 pour des relevés bancaires, toutes les 6 h pour un datawarehouse. Une synchronisation manuelle (« Synchroniser ») reste possible à tout moment sans modifier la planification. Chaque exécution — réussie ou non — est journalisée avec sa volumétrie : c'est l'équivalent du panneau « Journal de synchronisation » du simulateur. Un connecteur ",
  sched2: " conserve sa planification mais n'est plus déclenché.",

  // ----- Simulateur : métriques, panneaux, tableau -----
  metricActive: "Connecteurs actifs",
  metricSyncs: "Synchros 24 h",
  metricRows: "Lignes importées (24 h)",
  panelConnectors: "Connecteurs de données",
  panelAdd: "Ajouter un connecteur",
  panelJournal: "Journal de synchronisation",
  colConnector: "Connecteur",
  colType: "Type",
  colStatus: "Statut",
  colLastSync: "Dernière synchro",
  colVolume: "Volumétrie (24 h)",
  colActions: "Actions",
  rowsCell: (n: number) => `${n.toLocaleString("fr-FR")} lignes`,
  statusConnected: "Connecté",
  statusError: "Erreur",
  statusPaused: "En pause",

  // ----- Simulateur : boutons -----
  btnTest: "Tester",
  btnTesting: "Test…",
  btnSync: "Synchroniser",
  btnFix: "Corriger",
  btnDelete: "Supprimer",
  btnCancel: "Annuler",
  btnSaveId: "Enregistrer l'identifiant",
  btnCreate: "Créer et tester",
  btnCreating: "Test de connexion…",

  // ----- Simulateur : panneau « Corriger » -----
  fixTitle: (nom: string) => `Corriger l'identifiant — ${nom}`,
  fixIntro: (identifiant: string) =>
    `La dernière tentative a été refusée avec l'identifiant « ${identifiant} ». Saisissez un identifiant valide puis relancez « Tester ».`,
  fixLabel: "Identifiant de connexion",
  fixPlaceholder: "ex. bpm_reader_v2",
  errFixEmpty: "L'identifiant ne peut pas être vide.",
  errFixSame: "Saisissez un identifiant différent de l'identifiant refusé.",

  // ----- Simulateur : formulaire d'ajout -----
  formNameLabel: "Nom",
  formNamePlaceholder: "ex. Paie Silae — API REST",
  formTypeLabel: "Type",
  formTypePlaceholder: "Choisir un type",
  formHostLabel: "Hôte / URL",
  formHostPlaceholder: "https://api.exemple.fr/v1 ou db.exemple.fr:5432/base",
  formIdLabel: "Identifiant",
  formIdPlaceholder: "compte de service, ex. svc-bpm-paie",
  errName: "Indiquez un nom de connecteur.",
  errType: "Choisissez un type de connecteur.",
  errHost: "Indiquez l'hôte ou l'URL de la source.",
  errHostInvalid:
    "Hôte/URL invalide. Exemples : https://api.exemple.fr/v1, sftp.exemple.fr:22, db.exemple.fr:5432/base",
  errId: "Indiquez l'identifiant de connexion (compte de service).",

  // ----- Simulateur : toasts -----
  toastTestFailTitle: "Test échoué",
  toastTestFail: (nom: string, identifiant: string) =>
    `Connexion à « ${nom} » refusée : authentification refusée (identifiant « ${identifiant} » invalide). Corrigez l'identifiant puis relancez le test.`,
  toastTestOkTitle: "Test réussi",
  toastTestOk: (nom: string) =>
    `Connexion à « ${nom} » établie en 0,6 s. Statut : Connecté.`,
  toastSyncFailTitle: "Synchronisation échouée",
  toastSyncFail: (nom: string) =>
    `Synchronisation de « ${nom} » impossible : authentification refusée. Corrigez l'identifiant via « Corriger ».`,
  toastSyncOkTitle: "Synchronisation terminée",
  toastSyncOk: (nom: string, n: number) =>
    `« ${nom} » synchronisé : ${n.toLocaleString("fr-FR")} lignes importées.`,
  toastFixTitle: "Identifiant corrigé",
  toastFix: (nom: string) =>
    `Identifiant de « ${nom} » mis à jour. Lancez « Tester » pour rétablir la connexion.`,
  toastDeleteTitle: "Connecteur supprimé",
  toastDelete: (nom: string) => `Connecteur « ${nom} » supprimé.`,
  toastCreateTitle: "Connecteur créé",
  toastCreate: (nom: string) =>
    `Connecteur « ${nom} » créé. Test de connexion réussi : statut Connecté.`,

  // ----- Simulateur : modale de suppression -----
  confirmDeleteTitle: "Supprimer le connecteur",
  confirmDeleteMessage: (nom: string, type: string) =>
    `« ${nom} » (${type}) ne sera plus synchronisé. Les données déjà importées sont conservées. Cette action est immédiate.`,

  // ----- Journal d'activité : acteurs et actions -----
  actorScheduler: "Planificateur",
  actorAdmin: "Admin",
  actSynced: "a synchronisé",
  actSyncedManual: "a synchronisé (manuel)",
  actFailedOn: "a échoué sur",
  actPausedConnector: "a mis en pause",
  actTestedOk: "a testé avec succès",
  actTestedFail: "a testé (échec)",
  actFixedId: "a corrigé l'identifiant de",
  actDeleted: "a supprimé le connecteur",
  actCreated: "a créé et testé",

  // ----- Journal d'activité : fragments de cibles -----
  linesImported: (n: number) => `${n.toLocaleString("fr-FR")} lignes importées`,
  authRefused: "authentification refusée",
  syncRefused: "synchronisation refusée (authentification refusée)",
  newUsername: (value: string) => `nouvel identifiant : ${value}`,
  crmMigration: "migration en cours côté CRM",

  // ----- Seeds : descripteurs, planifications, libellés relatifs -----
  seedNameBnp: "Banque BNP — SFTP relevés",
  schedHourly: "Toutes les heures",
  schedDaily6: "Quotidien à 06:00",
  schedEvery6h: "Toutes les 6 h",
  schedEvery4hPaused: "Toutes les 4 h (suspendu)",
  schedManual: "Manuelle (à planifier)",
  last25min: "il y a 25 min",
  lastMorning6: "ce matin 06:00",
  last3days: "il y a 3 j",
  last5days: "il y a 5 j",
  justNow: "à l'instant",
  never: "jamais",
};

export type ConnecteursStrings = typeof fr;

const en: ConnecteursStrings = {
  // ----- Common -----
  pageTitle: "Connectors",
  openSimulator: "Open the simulator",
  num: (n: number) => n.toLocaleString("en-US"),

  // ----- Module page (page.tsx) -----
  pageDescription:
    "Inbound integrations hub: API REST, SFTP, PostgreSQL, MySQL. Test connections, run syncs, track volumes — everything is visible in the Simulator.",
  badgeCategory: "Integrations & technical",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",
  aboutTitle: "About",
  aboutText:
    "The Connectors module centralizes your inbound data integrations: the ERP exposes its entries through a REST API, the bank drops its statements on an SFTP server, the data warehouse is read over PostgreSQL. Each connector declares a source (type + host + username), a sync schedule, and reports its health: status, last sync, imported volume. Everything can be driven by hand — test the connection, run a sync, fix a refused username, delete.",
  componentsTitle: "Components used",
  compBadge: "type and status rendered by",
  compButton: "actions by",
  compInput: "host/URL validation",
  compFeed: "sync log",
  and: "and",
  setupTitle: "Configuration",
  setupText1:
    "The simulator runs entirely locally (seeded data, no API required). In production, wire the connection test and the syncs to your workers, and store secrets in a dedicated vault. See the",
  setupLinkLabel: "documentation",
  setupText2: "for the data model, secret management and sync scheduling.",

  // ----- Simulator page (simulateur/page.tsx) -----
  simBreadcrumb: "Simulator",
  simTitle: "Simulator — Connectors",
  simDescription:
    "Four connectors already configured (ERP, bank, data warehouse, CRM). Test a connection, run a sync, fix the data warehouse's refused username, add a connector or delete one: every action updates the table, the metrics and the log.",

  // ----- Documentation page (documentation/page.tsx) -----
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Connectors",
  docDescription:
    "Inbound data integrations: connector types, data model, secret management and sync scheduling.",
  docTypesTitle: "Connector types",
  typeApiRest:
    "— paginated HTTP(S) querying of a business API (ERP, CRM). Authentication via token or service account; ideal for frequent (hourly), incremental syncs.",
  typeSftp:
    "— retrieval of files dropped by a third party (bank statements, payroll exports). The connector lists a directory, imports new files and archives them; typically a daily cadence.",
  typePostgres:
    "— direct reads from a database (data warehouse, analytics replica) through a read-only account, with an incremental cursor on an update column.",
  typeMysql:
    "— same principle as PostgreSQL, for legacy applications backed by MySQL/MariaDB.",
  docModelTitle: "Data model",
  docModelText:
    "A connector ties a source (type + host/URL + username) to a schedule and an observable health state: status, last sync, volume imported over 24 h. The secret is never stored in this record — only a pointer to the vault appears here.",
  docJsonExample: `{
  "nom": "ERP Sage — API REST",
  "type": "API REST",                    // API REST | SFTP | PostgreSQL | MySQL
  "hote": "https://api.sage.acme.fr/v3",
  "identifiant": "svc-bpm-sage",         // service account (read-only)
  "secretRef": "vault://connecteurs/sage-api-token",
  "statut": "connected",                 // connected | error | paused
  "planification": "0 * * * *",          // cron — every hour
  "derniereSynchro": "2026-06-12T09:00:00Z",
  "lignes24h": 12400
}`,
  docSecretsTitle: "Secret management",
  secret1a:
    "Tokens, passwords and SSH keys are stored in a vault (Vault, AWS Secrets Manager…) and referenced via ",
  secret1b: "; never in the database nor in the logs.",
  secret2:
    "Use dedicated read-only service accounts, one per connector, so you can revoke without side effects.",
  secret3a: "A refused authentication switches the connector to the ",
  secret3b:
    " status: fixing the username then running a connection test (the simulator's “Fix” then “Test” flow) restores the ",
  secret3c: " status.",
  docSchedTitle: "Sync scheduling",
  sched1:
    "Each connector carries a cron expression executed by a worker: every hour for an ERP, daily at 06:00 for bank statements, every 6 hours for a data warehouse. A manual sync (“Sync now”) remains possible at any time without changing the schedule. Every run — successful or not — is logged with its volume: this is the equivalent of the simulator's “Sync log” panel. A ",
  sched2: " connector keeps its schedule but is no longer triggered.",

  // ----- Simulator: metrics, panels, table -----
  metricActive: "Active connectors",
  metricSyncs: "Syncs (24 h)",
  metricRows: "Rows imported (24 h)",
  panelConnectors: "Data connectors",
  panelAdd: "Add a connector",
  panelJournal: "Sync log",
  colConnector: "Connector",
  colType: "Type",
  colStatus: "Status",
  colLastSync: "Last sync",
  colVolume: "Volume (24 h)",
  colActions: "Actions",
  rowsCell: (n: number) => `${n.toLocaleString("en-US")} rows`,
  statusConnected: "Connected",
  statusError: "Error",
  statusPaused: "Paused",

  // ----- Simulator: buttons -----
  btnTest: "Test",
  btnTesting: "Testing…",
  btnSync: "Sync now",
  btnFix: "Fix",
  btnDelete: "Delete",
  btnCancel: "Cancel",
  btnSaveId: "Save username",
  btnCreate: "Create and test",
  btnCreating: "Testing connection…",

  // ----- Simulator: "Fix" panel -----
  fixTitle: (nom: string) => `Fix username — ${nom}`,
  fixIntro: (identifiant: string) =>
    `The last attempt was refused with the username “${identifiant}”. Enter a valid username, then run “Test” again.`,
  fixLabel: "Connection username",
  fixPlaceholder: "e.g. bpm_reader_v2",
  errFixEmpty: "The username cannot be empty.",
  errFixSame: "Enter a username different from the refused one.",

  // ----- Simulator: add form -----
  formNameLabel: "Name",
  formNamePlaceholder: "e.g. Silae payroll — API REST",
  formTypeLabel: "Type",
  formTypePlaceholder: "Choose a type",
  formHostLabel: "Host / URL",
  formHostPlaceholder: "https://api.example.com/v1 or db.example.com:5432/db",
  formIdLabel: "Username",
  formIdPlaceholder: "service account, e.g. svc-bpm-payroll",
  errName: "Enter a connector name.",
  errType: "Choose a connector type.",
  errHost: "Enter the source host or URL.",
  errHostInvalid:
    "Invalid host/URL. Examples: https://api.example.com/v1, sftp.example.com:22, db.example.com:5432/db",
  errId: "Enter the connection username (service account).",

  // ----- Simulator: toasts -----
  toastTestFailTitle: "Test failed",
  toastTestFail: (nom: string, identifiant: string) =>
    `Connection to “${nom}” refused: authentication refused (username “${identifiant}” is invalid). Fix the username, then run the test again.`,
  toastTestOkTitle: "Test passed",
  toastTestOk: (nom: string) =>
    `Connection to “${nom}” established in 0.6 s. Status: Connected.`,
  toastSyncFailTitle: "Sync failed",
  toastSyncFail: (nom: string) =>
    `Cannot sync “${nom}”: authentication refused. Fix the username via “Fix”.`,
  toastSyncOkTitle: "Sync complete",
  toastSyncOk: (nom: string, n: number) =>
    `“${nom}” synced: ${n.toLocaleString("en-US")} rows imported.`,
  toastFixTitle: "Username updated",
  toastFix: (nom: string) =>
    `Username for “${nom}” updated. Run “Test” to restore the connection.`,
  toastDeleteTitle: "Connector deleted",
  toastDelete: (nom: string) => `Connector “${nom}” deleted.`,
  toastCreateTitle: "Connector created",
  toastCreate: (nom: string) =>
    `Connector “${nom}” created. Connection test passed: status Connected.`,

  // ----- Simulator: delete confirmation modal -----
  confirmDeleteTitle: "Delete connector",
  confirmDeleteMessage: (nom: string, type: string) =>
    `“${nom}” (${type}) will no longer be synced. Data already imported is kept. This action is immediate.`,

  // ----- Activity log: actors and actions -----
  actorScheduler: "Scheduler",
  actorAdmin: "Admin",
  actSynced: "synced",
  actSyncedManual: "manually synced",
  actFailedOn: "failed on",
  actPausedConnector: "paused",
  actTestedOk: "successfully tested",
  actTestedFail: "tested (failed)",
  actFixedId: "fixed the username of",
  actDeleted: "deleted connector",
  actCreated: "created and tested",

  // ----- Activity log: target fragments -----
  linesImported: (n: number) => `${n.toLocaleString("en-US")} rows imported`,
  authRefused: "authentication refused",
  syncRefused: "sync refused (authentication refused)",
  newUsername: (value: string) => `new username: ${value}`,
  crmMigration: "migration in progress on the CRM side",

  // ----- Seeds: descriptors, schedules, relative labels -----
  seedNameBnp: "Banque BNP — SFTP statements",
  schedHourly: "Every hour",
  schedDaily6: "Daily at 06:00",
  schedEvery6h: "Every 6 hours",
  schedEvery4hPaused: "Every 4 hours (suspended)",
  schedManual: "Manual (to be scheduled)",
  last25min: "25 min ago",
  lastMorning6: "this morning at 06:00",
  last3days: "3 days ago",
  last5days: "5 days ago",
  justNow: "just now",
  never: "never",
};

export const STR = { fr, en } as const;
