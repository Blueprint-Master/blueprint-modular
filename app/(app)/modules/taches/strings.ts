/**
 * Chaînes bilingues du module Tâches.
 *
 * - La parité fr/en est garantie à la compilation par `const en: typeof fr`.
 * - Les valeurs internes (statuts « À faire | En cours | Terminé », priorités
 *   « haute | normale | basse », dates ISO) ne changent jamais : seul
 *   l'affichage est localisé.
 * - Les dates ISO sont formatées par découpage de chaîne (déterministe,
 *   pas de new Date() au render) : fr « 25/06/2026 », en « 25 Jun 2026 ».
 */

export type Statut = "À faire" | "En cours" | "Terminé";
export type Priorite = "haute" | "normale" | "basse";

const STATUT_LABELS_FR: Record<Statut, string> = {
  "À faire": "À faire",
  "En cours": "En cours",
  "Terminé": "Terminé",
};

const STATUT_LABELS_EN: Record<Statut, string> = {
  "À faire": "To do",
  "En cours": "In progress",
  "Terminé": "Done",
};

const PRIORITE_LABELS_FR: Record<Priorite, string> = {
  haute: "Haute",
  normale: "Normale",
  basse: "Basse",
};

const PRIORITE_LABELS_EN: Record<Priorite, string> = {
  haute: "High",
  normale: "Normal",
  basse: "Low",
};

const MOIS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fr = {
  /** "2026-06-25" → "25/06/2026" (purement textuel, donc déterministe). */
  formatDate: (iso: string): string => {
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
  },

  statut: STATUT_LABELS_FR,
  priorite: PRIORITE_LABELS_FR,
  overdue: "En retard",

  breadcrumb: {
    tasks: "Tâches",
    simulator: "Simulateur",
    documentation: "Documentation",
  },

  // ——— Page module (page.tsx) ———
  page: {
    title: "Tâches",
    description:
      "Gestionnaire de tâches d'équipe : création, assignation, échéances avec détection du retard, priorités et avancement des statuts. Testez tout dans le Simulateur.",
    category: "Processus & workflow",
    openSimulator: "Ouvrir le simulateur",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulateur",
  },

  // ——— Onglet « À propos » (page.tsx) ———
  doc: {
    aboutTitle: "À propos",
    aboutBefore: "Le module ",
    aboutModule: "Tâches",
    aboutAfter:
      " est un gestionnaire de tâches d'équipe complet : création, assignation à un membre, échéance avec détection automatique du retard, priorité et cycle de statuts (À faire → En cours → Terminé). Il peut être utilisé en standalone ou relié à un autre module (projet, livrable, ticket).",
    conceptsTitle: "Concepts",
    concepts: [
      {
        term: "Tâche",
        text: " : titre, description courte, assigné, échéance (date), priorité (haute / normale / basse), statut.",
      },
      {
        term: "Statuts",
        text: " : À faire, En cours, Terminé — avancement en un clic (« Démarrer », « Terminer »).",
      },
      {
        term: "Retard",
        text: " : échéance antérieure à la date du jour et statut différent de Terminé → badge rouge « En retard ».",
      },
      {
        term: "Filtres combinés",
        text: " : statut (avec compteurs), assigné et recherche plein texte se cumulent.",
      },
    ],
    componentsTitle: "Composants utilisés",
    compTable: "échéance, priorité et statut rendus par",
    compActions: ", actions par",
    compInput: "recherche et date",
    compModal: "création / édition",
    compConfirm: "suppression",
    compAnd: "et",
    configTitle: "Paramétrage",
    configBefore:
      "Le simulateur fonctionne entièrement en local (8 tâches seedées, aucune API requise). En production, brancher les actions (création, avancement, suppression) sur votre API CRUD et persister les tâches en base. Voir la ",
    configLink: "documentation",
    configAfter: " pour le modèle de données, les transitions d'état et les règles de retard.",
  },

  // ——— Page simulateur (simulateur/page.tsx) ———
  simPage: {
    title: "Simulateur — Tâches",
    description:
      "Huit tâches du sprint en cours (équipe produit, référence au 12/06/2026). Créez une tâche, faites-la avancer (« Démarrer », « Terminer »), modifiez l'assigné ou l'échéance, supprimez : métriques, compteurs et badges « En retard » se mettent à jour en direct. Les filtres statut, assigné et recherche se combinent.",
  },

  // ——— Simulateur (simulateur-content.tsx) ———
  sim: {
    panelTitle: (date: string) => `Tâches de l'équipe — référence : ${date}`,
    filterAll: "Toutes",
    assigneeLabel: "Assigné",
    assigneeAll: "Tous",
    searchLabel: "Recherche",
    searchPlaceholder: "Titre ou description…",
    newTask: "Nouvelle tâche",
    emptyState: "Aucune tâche ne correspond à ces filtres.",

    colTask: "Tâche",
    colAssignee: "Assigné",
    colDue: "Échéance",
    colPriority: "Priorité",
    colStatus: "Statut",
    colActions: "Actions",

    actionStart: "Démarrer",
    actionComplete: "Terminer",
    actionEdit: "Modifier",
    actionDelete: "Supprimer",

    modalEditTitle: "Modifier la tâche",
    modalCreateTitle: "Nouvelle tâche",
    fieldTitle: "Titre *",
    fieldTitlePlaceholder: "Ex. Rédiger les notes de version",
    fieldAssignee: "Assigné *",
    fieldAssigneePlaceholder: "Choisir une personne",
    fieldDue: "Échéance *",
    fieldPriority: "Priorité",
    fieldPriorityPlaceholder: "Priorité",
    errorTitleRequired: "Le titre est requis.",
    errorAssigneeRequired: "Choisissez un assigné.",
    errorDueRequired: "Indiquez une date d'échéance.",
    cancel: "Annuler",
    save: "Enregistrer",
    create: "Créer la tâche",

    toastSource: "Tâches",
    toastUpdatedTitle: "Tâche modifiée",
    toastUpdated: (titre: string, assigne: string, date: string) =>
      `« ${titre} » mise à jour (${assigne}, échéance ${date}).`,
    toastCreatedTitle: "Tâche créée",
    toastCreated: (titre: string, assigne: string, date: string) =>
      `« ${titre} » assignée à ${assigne} pour le ${date}.`,
    toastStartedTitle: "Tâche démarrée",
    toastStarted: (titre: string, assigne: string) =>
      `« ${titre} » est passée en cours (${assigne}).`,
    toastCompletedTitle: "Tâche terminée",
    toastCompleted: (titre: string, assigne: string) =>
      `« ${titre} » est terminée. Bravo ${assigne} !`,
    toastDeletedTitle: "Tâche supprimée",
    toastDeleted: (titre: string) => `« ${titre} » supprimée de la liste.`,

    confirmTitle: "Supprimer la tâche",
    confirmMessage: (titre: string, assigne: string, date: string) =>
      `« ${titre} » (${assigne}, échéance ${date}) sera retirée de la liste. Cette action est immédiate.`,
    confirmLabel: "Supprimer",
  },

  // ——— Page documentation (documentation/page.tsx) ———
  docPage: {
    title: "Documentation — Tâches",
    description:
      "Gestionnaire de tâches d'équipe : modèle de données, états et transitions, règles de retard et points d'intégration.",
    modelTitle: "Modèle de données",
    modelBefore:
      "Une tâche associe un titre (requis) à un assigné, une échéance, une priorité et un statut. La description est optionnelle ; les dates sont stockées au format ISO ",
    modelIso: "AAAA-MM-JJ",
    modelAfter: ", ce qui permet de comparer les échéances par simple ordre lexicographique.",
    statesTitle: "États et transitions",
    statesIntro:
      "Le cycle de vie est linéaire et avance en un clic via le bouton contextuel de la colonne Actions :",
    stateStartTerm: "À faire → En cours",
    stateStartText: " — bouton « Démarrer » (statut initial de toute nouvelle tâche).",
    stateCompleteTerm: "En cours → Terminé",
    stateCompleteText:
      " — bouton « Terminer » ; la ligne est ensuite atténuée et le bouton d'avancement disparaît.",
    stateEditTerm: "Modifier",
    stateEditText:
      " — titre, assigné, échéance et priorité restent éditables à tout moment (modale pré-remplie).",
    stateDeleteTerm: "Supprimer",
    stateDeleteBefore: " — confirmation explicite (",
    stateDeleteAfter: ") avant retrait définitif.",
    overdueTitle: "Règles de retard",
    overdueBefore: "Une tâche est ",
    overdueStrong: "en retard",
    overdueMiddle: " si son échéance est strictement antérieure à la date de référence ",
    overdueEm: "et",
    overdueAfter: " que son statut n'est pas Terminé :",
    overdueRules: [
      "Badge rouge « En retard » et échéance colorée dans le tableau.",
      "La métrique « En retard » est recalculée à chaque action.",
      "Une tâche terminée n'est jamais en retard, même si son échéance est passée ; terminer une tâche en retard la sort donc immédiatement du compteur.",
      "En production, remplacer la constante par la date du jour côté serveur ou client.",
    ],
    filtersTitle: "Filtres",
    filtersText:
      "Trois filtres se combinent : statut (boutons avec compteurs), assigné (selectbox « Tous » + membres de l'équipe) et recherche plein texte sur le titre et la description. Les compteurs de statut sont calculés sur la liste déjà filtrée par assigné et recherche.",
    integrationTitle: "Intégration en production",
    integrationBefore:
      "Le simulateur fonctionne en local (état React seedé, 8 tâches). Pour brancher un vrai backend : exposer une API CRUD (table ",
    integrationAfter:
      "), valider la transition de statut côté serveur, et notifier l'assigné lors d'une création ou d'une réassignation (l'équivalent des toasts du simulateur).",
    trySimulator: "Tester dans le simulateur",
  },
};

const en: typeof fr = {
  /** "2026-06-25" → "25 Jun 2026" (string slicing only, fully deterministic). */
  formatDate: (iso: string): string => {
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    const month = MOIS_EN[Number(m) - 1] ?? m;
    return `${String(Number(d))} ${month} ${y}`;
  },

  statut: STATUT_LABELS_EN,
  priorite: PRIORITE_LABELS_EN,
  overdue: "Overdue",

  breadcrumb: {
    tasks: "Tasks",
    simulator: "Simulator",
    documentation: "Documentation",
  },

  page: {
    title: "Tasks",
    description:
      "Team task manager: creation, assignment, due dates with overdue detection, priorities and status progression. Try everything in the Simulator.",
    category: "Process & workflow",
    openSimulator: "Open the simulator",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulator",
  },

  doc: {
    aboutTitle: "About",
    aboutBefore: "The ",
    aboutModule: "Tasks",
    aboutAfter:
      " module is a complete team task manager: creation, assignment to a team member, due dates with automatic overdue detection, priority and a status cycle (To do → In progress → Done). It can be used standalone or linked to another module (project, deliverable, ticket).",
    conceptsTitle: "Concepts",
    concepts: [
      {
        term: "Task",
        text: ": title, short description, assignee, due date, priority (high / normal / low), status.",
      },
      {
        term: "Statuses",
        text: ": To do, In progress, Done — move tasks forward in one click (“Start”, “Complete”).",
      },
      {
        term: "Overdue",
        text: ": due date earlier than today and status other than Done → red “Overdue” badge.",
      },
      {
        term: "Combined filters",
        text: ": status (with counters), assignee and full-text search stack together.",
      },
    ],
    componentsTitle: "Components used",
    compTable: "due date, priority and status rendered by",
    compActions: ", actions by",
    compInput: "search and date",
    compModal: "create / edit",
    compConfirm: "delete",
    compAnd: "and",
    configTitle: "Setup",
    configBefore:
      "The simulator runs entirely locally (8 seeded tasks, no API required). In production, wire the actions (create, progress, delete) to your CRUD API and persist tasks in a database. See the ",
    configLink: "documentation",
    configAfter: " for the data model, state transitions and overdue rules.",
  },

  simPage: {
    title: "Simulator — Tasks",
    description:
      "Eight tasks from the current sprint (product team, reference date 12 Jun 2026). Create a task, move it forward (“Start”, “Complete”), change the assignee or the due date, delete it: metrics, counters and “Overdue” badges update live. The status, assignee and search filters combine.",
  },

  sim: {
    panelTitle: (date: string) => `Team tasks — reference: ${date}`,
    filterAll: "All",
    assigneeLabel: "Assignee",
    assigneeAll: "All",
    searchLabel: "Search",
    searchPlaceholder: "Title or description…",
    newTask: "New task",
    emptyState: "No tasks match these filters.",

    colTask: "Task",
    colAssignee: "Assignee",
    colDue: "Due date",
    colPriority: "Priority",
    colStatus: "Status",
    colActions: "Actions",

    actionStart: "Start",
    actionComplete: "Complete",
    actionEdit: "Edit",
    actionDelete: "Delete",

    modalEditTitle: "Edit task",
    modalCreateTitle: "New task",
    fieldTitle: "Title *",
    fieldTitlePlaceholder: "e.g. Write the release notes",
    fieldAssignee: "Assignee *",
    fieldAssigneePlaceholder: "Pick a person",
    fieldDue: "Due date *",
    fieldPriority: "Priority",
    fieldPriorityPlaceholder: "Priority",
    errorTitleRequired: "Title is required.",
    errorAssigneeRequired: "Choose an assignee.",
    errorDueRequired: "Enter a due date.",
    cancel: "Cancel",
    save: "Save",
    create: "Create task",

    toastSource: "Tasks",
    toastUpdatedTitle: "Task updated",
    toastUpdated: (titre: string, assigne: string, date: string) =>
      `“${titre}” updated (${assigne}, due ${date}).`,
    toastCreatedTitle: "Task created",
    toastCreated: (titre: string, assigne: string, date: string) =>
      `“${titre}” assigned to ${assigne}, due ${date}.`,
    toastStartedTitle: "Task started",
    toastStarted: (titre: string, assigne: string) =>
      `“${titre}” is now in progress (${assigne}).`,
    toastCompletedTitle: "Task completed",
    toastCompleted: (titre: string, assigne: string) =>
      `“${titre}” is done. Nice work, ${assigne}!`,
    toastDeletedTitle: "Task deleted",
    toastDeleted: (titre: string) => `“${titre}” removed from the list.`,

    confirmTitle: "Delete task",
    confirmMessage: (titre: string, assigne: string, date: string) =>
      `“${titre}” (${assigne}, due ${date}) will be removed from the list. This action is immediate.`,
    confirmLabel: "Delete",
  },

  docPage: {
    title: "Documentation — Tasks",
    description:
      "Team task manager: data model, states and transitions, overdue rules and integration points.",
    modelTitle: "Data model",
    modelBefore:
      "A task ties a title (required) to an assignee, a due date, a priority and a status. The description is optional; dates are stored in the ISO ",
    modelIso: "YYYY-MM-DD",
    modelAfter: " format, which makes due dates comparable by simple lexicographic order.",
    statesTitle: "States and transitions",
    statesIntro:
      "The lifecycle is linear and moves forward in one click via the contextual button in the Actions column:",
    stateStartTerm: "To do → In progress",
    stateStartText: " — “Start” button (initial status of every new task).",
    stateCompleteTerm: "In progress → Done",
    stateCompleteText:
      " — “Complete” button; the row is then dimmed and the progress button disappears.",
    stateEditTerm: "Edit",
    stateEditText:
      " — title, assignee, due date and priority stay editable at any time (pre-filled modal).",
    stateDeleteTerm: "Delete",
    stateDeleteBefore: " — explicit confirmation (",
    stateDeleteAfter: ") before permanent removal.",
    overdueTitle: "Overdue rules",
    overdueBefore: "A task is ",
    overdueStrong: "overdue",
    overdueMiddle: " if its due date is strictly earlier than the reference date ",
    overdueEm: "and",
    overdueAfter: " its status is not Done:",
    overdueRules: [
      "Red “Overdue” badge and highlighted due date in the table.",
      "The “Overdue” metric is recalculated after every action.",
      "A completed task is never overdue, even if its due date has passed; completing an overdue task therefore removes it from the counter immediately.",
      "In production, replace the constant with today's date on the server or client.",
    ],
    filtersTitle: "Filters",
    filtersText:
      "Three filters combine: status (buttons with counters), assignee (“All” selectbox + team members) and full-text search across the title and description. Status counters are computed on the list already filtered by assignee and search.",
    integrationTitle: "Production integration",
    integrationBefore:
      "The simulator runs locally (seeded React state, 8 tasks). To plug in a real backend: expose a CRUD API (a ",
    integrationAfter:
      " table), validate status transitions server-side, and notify the assignee on creation or reassignment (the equivalent of the simulator's toasts).",
    trySimulator: "Try it in the simulator",
  },
};

export const STR = { fr, en };
