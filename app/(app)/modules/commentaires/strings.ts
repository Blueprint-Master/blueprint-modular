/**
 * Chaînes bilingues du module Commentaires.
 * FR sert de source de vérité pour les types ; EN doit respecter la même forme
 * (parité garantie par `Strings` = typeof fr).
 *
 * Usage : import { STR } from "../strings"; const t = STR[locale];
 * Les valeurs techniques des types de commentaire ("commentaire", "annotation",
 * "décision", "blocage") sont inchangées : seul l'affichage est traduit.
 */

const fr = {
  // En-tête / breadcrumb / méta (page module)
  breadcrumbComments: "Commentaires",
  breadcrumbSimulator: "Simulateur",
  breadcrumbDocumentation: "Documentation",
  title: "Commentaires",
  description: "Commentaires et annotations sur une entité. Testez dans le Simulateur.",
  category: "Contenu & productivité",
  openSimulator: "Ouvrir le simulateur",

  // Onglets
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",

  // Doc courte (onglet de la page module)
  aboutHeading: "À propos",
  aboutBody: (
    "Le module Commentaires permet d’ajouter des commentaires et annotations sur une entité " +
    "(document, ligne, projet). Fil de discussion avec auteur, date, types " +
    "(commentaire / annotation / décision / blocage) et résolution."
  ),
  aboutCode:
    '# bpm — afficher les commentaires d\'un document\nbpm.title("Commentaires")\n# Conteneur : fil de commentaires + zone "Nouveau commentaire" (textarea + Envoyer)',

  // Aperçu (onglet Simulateur de la page module)
  previewIntro:
    "Aperçu du fil. Pour tester les avatars, types, résolution et actions, ouvrez le simulateur.",
  previewCount: (n: number) => `Commentaires (${n})`,
  previewDate1: "20 févr. à 09h00",
  previewDate2: "20 févr. à 10h15",
  previewNewComment: "Nouveau commentaire",
  previewNewHint: "Zone de saisie + bouton Envoyer (simulateur complet).",

  // Simulateur — en-tête
  simulatorTitle: "Simulateur — Commentaires",
  simulatorDescription:
    "Fil de commentaires avec avatars, types, résolution, actions au survol et zone de saisie multi-lignes.",
  entityContextLabel: "Document :",
  entityName: "Rapport Q4 — Synthèse",

  // Types de commentaire (affichage)
  typeComment: "Commentaire",
  typeAnnotation: "Annotation",
  typeDecision: "Décision",
  typeBlocker: "Blocage",

  // Compteur + filtre
  commentsCount: (n: number) => `Commentaires (${n})`,
  filterSummary: (label: string, n: number) => `— Filtre : ${label} (${n})`,
  filterLabel: "Filtrer :",
  filterAll: "Tous",

  // Pagination
  showOlder: (n: number) => `Voir les ${n} commentaires précédents`,

  // Fil — métadonnées
  ownSuffix: "(vous)",
  resolvedBadge: "Résolu",
  editedBadge: "(modifié)",

  // Édition en ligne
  save: "Enregistrer",
  cancel: "Annuler",

  // Actions au survol
  actionEdit: "Modifier",
  actionDelete: "Supprimer",
  actionResolve: "Marquer résolu",
  actionReply: "Répondre",

  // Zone de saisie
  newCommentHeading: "Nouveau commentaire",
  typeLabel: "Type :",
  inputPlaceholder: "Votre message… (Ctrl+Entrée pour envoyer)",
  send: "Envoyer",
  sending: "Envoi…",
  retry: "Réessayer",
  sendError: "Erreur d'envoi. Réessayez.",

  // Retour
  backToModule: "← Retour au module Commentaires",

  // Dates relatives
  justNow: "À l'instant",
  minutesAgo: (m: number) => `Il y a ${m} min`,
  hoursAgo: (h: number) => `Il y a ${h}h`,
  dateAt: (day: number, month: string, time: string) => `${day} ${month} à ${time}`,
  months: "janv.,févr.,mars,avr.,mai,juin,juil.,août,sept.,oct.,nov.,déc.",
  timeAt: (hh: string, mm: string) => `${hh}h${mm}`,

  // Documentation (page complète)
  docTitle: "Documentation — Commentaires",
  docDescription:
    "Fil de commentaires et annotations sur une entité (document, ligne, projet). Auteur, date et contenu.",
  docIntro: (
    "Les modules Blueprint Modular font partie de l’application Next.js. Il n’y a pas de package " +
    "séparé par module : on installe l’application une fois. Cette documentation décrit comment " +
    "fonctionne le module Commentaires (affichage, ajout, liaison à une entité), comment l’intégrer " +
    "(API ou store) et les données attendues."
  ),
  docHowHeading: "Comment fonctionne le module Commentaires",
  docHowBody: (
    "Le module affiche un fil de commentaires associé à une entité (document, ligne, projet). Un " +
    "contexte optionnel (nom + lien de l’entité) peut être affiché en en-tête pour rappeler sur quoi " +
    "portent les commentaires. Chaque commentaire comporte un auteur (format structuré pour avatars), " +
    "une date, un contenu, et optionnellement un type (commentaire / annotation / décision / blocage) " +
    "et un statut résolu. Zone de saisie multi-lignes (Ctrl+Entrée pour envoyer) et bouton Envoyer. " +
    "Les données sont persistées côté backend (API ou base) selon votre implémentation."
  ),
  docStructHeading: "Structure des commentaires",
  docStructIntro: "Champs de base et champs optionnels (pour threading, résolution, type) :",
  docStructAuthor:
    "— format structuré recommandé : { id, displayName, avatar? } pour cohérence et avatars",
  docStructParent: "— pour réponses imbriquées (optionnel)",
  docStructType: "— commentaire / annotation / décision / blocage (optionnel)",
  docStructResolved: "— clôture (optionnel)",
  docStructEdited: "— trace des modifications (optionnel)",
  docStructAttachments: "— pièces jointes (optionnel)",
  docConnHeading: "Connexions inter-modules",
  docConnIntro: "Le module Commentaires s’intègre avec :",
  docConnNotif: "Notifications ciblées",
  docConnNotifBody:
    "— notifier les participants ou les @mentionnés à chaque nouveau commentaire",
  docConnAudit: "Audit / Log",
  docConnAuditBody:
    "— tracer les créations, modifications et suppressions de commentaires dans le journal d’audit",
  docConnWorkflow: "Workflow",
  docConnWorkflowBody:
    "— un commentaire de type « blocage » peut conditionner une transition d’état (ex. blocage levé → passage à « En revue »)",
  docIntegHeading: "Intégration côté app",
  docIntegBody: (
    "La page du module est /modules/commentaires. Pour alimenter et enregistrer les commentaires, " +
    "exposez par exemple GET /api/comments?entityId=...&entityType=... et POST /api/comments. La " +
    "session utilisateur (NextAuth) fournit l’auteur du commentaire. Aucune variable " +
    "d’environnement spécifique n’est requise."
  ),
  docExampleLabel: "Exemple — afficher et ajouter un commentaire :",
  docExampleCode:
    'bpm.title("Commentaires")\n# Conteneur épuré (sans bpm.panel) : fil + zone "Nouveau commentaire" (textarea + Envoyer)\n# GET /api/comments?entityId=... & POST /api/comments',
  docSimHeading: "Simulateur",
  docSimBody: (
    "Le simulateur propose un fil long (20+ commentaires) avec types variés (commentaire, annotation, " +
    "décision, blocage), réponses imbriquées, commentaires résolus, contexte d’entité, avatars colorés, " +
    "actions au survol (modifier, supprimer, marquer résolu), zone multi-lignes (Ctrl+Entrée pour " +
    "envoyer), validation, chargement et pagination."
  ),
  docOpenSimulator: "Ouvrir le simulateur Commentaires",
  backToModuleArrow: "← Retour au module Commentaires",
};

type Strings = {
  readonly [K in keyof typeof fr]: (typeof fr)[K];
};

const en: Strings = {
  breadcrumbComments: "Comments",
  breadcrumbSimulator: "Simulator",
  breadcrumbDocumentation: "Documentation",
  title: "Comments",
  description: "Comments and annotations on an entity. Try it in the Simulator.",
  category: "Content & productivity",
  openSimulator: "Open the simulator",

  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",

  aboutHeading: "About",
  aboutBody: (
    "The Comments module lets you add comments and annotations on an entity " +
    "(document, line, project). A discussion thread with author, date, types " +
    "(comment / annotation / decision / blocker) and resolution."
  ),
  aboutCode:
    '# bpm — show the comments on a document\nbpm.title("Comments")\n# Container: comment thread + "New comment" area (textarea + Send)',

  previewIntro:
    "Thread preview. To try out avatars, types, resolution and actions, open the simulator.",
  previewCount: (n: number) => `Comments (${n})`,
  previewDate1: "Feb 20 at 9:00 AM",
  previewDate2: "Feb 20 at 10:15 AM",
  previewNewComment: "New comment",
  previewNewHint: "Input area + Send button (full simulator).",

  simulatorTitle: "Simulator — Comments",
  simulatorDescription:
    "Comment thread with avatars, types, resolution, hover actions and a multi-line input area.",
  entityContextLabel: "Document:",
  entityName: "Q4 Report — Summary",

  typeComment: "Comment",
  typeAnnotation: "Annotation",
  typeDecision: "Decision",
  typeBlocker: "Blocker",

  commentsCount: (n: number) => `Comments (${n})`,
  filterSummary: (label: string, n: number) => `— Filter: ${label} (${n})`,
  filterLabel: "Filter:",
  filterAll: "All",

  showOlder: (n: number) => `Show ${n} earlier comments`,

  ownSuffix: "(you)",
  resolvedBadge: "Resolved",
  editedBadge: "(edited)",

  save: "Save",
  cancel: "Cancel",

  actionEdit: "Edit",
  actionDelete: "Delete",
  actionResolve: "Mark resolved",
  actionReply: "Reply",

  newCommentHeading: "New comment",
  typeLabel: "Type:",
  inputPlaceholder: "Your message… (Ctrl+Enter to send)",
  send: "Send",
  sending: "Sending…",
  retry: "Retry",
  sendError: "Failed to send. Please try again.",

  backToModule: "← Back to the Comments module",

  justNow: "Just now",
  minutesAgo: (m: number) => `${m} min ago`,
  hoursAgo: (h: number) => `${h}h ago`,
  dateAt: (day: number, month: string, time: string) => `${month} ${day} at ${time}`,
  months: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
  timeAt: (hh: string, mm: string) => `${hh}:${mm}`,

  docTitle: "Documentation — Comments",
  docDescription:
    "Comment and annotation thread on an entity (document, line, project). Author, date and content.",
  docIntro: (
    "Blueprint Modular modules are part of the Next.js application. There is no separate package per " +
    "module: you install the application once. This documentation describes how the Comments module " +
    "works (display, adding, linking to an entity), how to integrate it (API or store) and the " +
    "expected data."
  ),
  docHowHeading: "How the Comments module works",
  docHowBody: (
    "The module displays a comment thread tied to an entity (document, line, project). An optional " +
    "context (entity name + link) can be shown in the header to recall what the comments relate to. " +
    "Each comment has an author (structured format for avatars), a date, content, and optionally a " +
    "type (comment / annotation / decision / blocker) and a resolved status. Multi-line input area " +
    "(Ctrl+Enter to send) and a Send button. Data is persisted on the backend (API or database) " +
    "depending on your implementation."
  ),
  docStructHeading: "Comment structure",
  docStructIntro: "Base fields and optional fields (for threading, resolution, type):",
  docStructAuthor:
    "— recommended structured format: { id, displayName, avatar? } for consistency and avatars",
  docStructParent: "— for nested replies (optional)",
  docStructType: "— comment / annotation / decision / blocker (optional)",
  docStructResolved: "— closing (optional)",
  docStructEdited: "— change tracking (optional)",
  docStructAttachments: "— attachments (optional)",
  docConnHeading: "Cross-module connections",
  docConnIntro: "The Comments module integrates with:",
  docConnNotif: "Targeted notifications",
  docConnNotifBody:
    "— notify participants or @mentioned users on each new comment",
  docConnAudit: "Audit / Log",
  docConnAuditBody:
    "— record comment creations, edits and deletions in the audit log",
  docConnWorkflow: "Workflow",
  docConnWorkflowBody:
    "— a comment of type “blocker” can gate a state transition (e.g. blocker cleared → move to “In review”)",
  docIntegHeading: "App-side integration",
  docIntegBody: (
    "The module page is /modules/commentaires. To feed and store comments, expose for example " +
    "GET /api/comments?entityId=...&entityType=... and POST /api/comments. The user session " +
    "(NextAuth) provides the comment author. No specific environment variable is required."
  ),
  docExampleLabel: "Example — show and add a comment:",
  docExampleCode:
    'bpm.title("Comments")\n# Clean container (no bpm.panel): thread + "New comment" area (textarea + Send)\n# GET /api/comments?entityId=... & POST /api/comments',
  docSimHeading: "Simulator",
  docSimBody: (
    "The simulator provides a long thread (20+ comments) with varied types (comment, annotation, " +
    "decision, blocker), nested replies, resolved comments, entity context, colored avatars, hover " +
    "actions (edit, delete, mark resolved), multi-line input area (Ctrl+Enter to send), validation, " +
    "loading and pagination."
  ),
  docOpenSimulator: "Open the Comments simulator",
  backToModuleArrow: "← Back to the Comments module",
};

export const STR = { fr, en } as const;
export type CommentairesStrings = Strings;
