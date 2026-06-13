import type { Locale } from "@/lib/i18n";

/**
 * Chaînes du module Calendrier (FR/EN).
 * Parité de clés garantie à la compilation : `en` est typé `ModuleStrings`.
 */

const fr = {
  // Breadcrumb / en-têtes communs
  breadcrumbModules: "Modules",
  breadcrumbDocumentation: "Documentation",
  moduleName: "Calendrier",

  // Simulateur — en-tête
  simuTitle: "Simulateur — Calendrier",
  simuDescription:
    "Vues Jour (timeline), Semaine (grille), Mois. Navigation, filtres, détail et création d'événements.",

  // Navigation
  prev: "Précédent",
  next: "Suivant",
  today: "Aujourd'hui",
  prevAria: "Période précédente",
  nextAria: "Période suivante",
  newEvent: "+ Nouvel événement",

  // Filtres
  filterLabel: "Filtrer :",
  filterAll: "Tous",
  colorFallback: "Couleur",

  // Vues
  viewDay: "Jour",
  viewWeek: "Semaine",
  viewMonth: "Mois",

  // États vides
  emptyDay: "Aucun événement ce jour.",
  emptyWeek: "Aucun événement cette semaine.",

  // Vue mois
  monthHint: "Cliquez sur un jour pour afficher la vue Jour. Le jour en surbrillance est aujourd'hui.",

  // Modale détail
  detailDate: "Date",
  detailTime: "Heure",
  detailRecurrence: "Récurrence",
  detailLocation: "Lieu",
  detailCategory: "Catégorie",
  detailStatus: "Statut",
  detailDescription: "Description",
  detailParticipants: "Participants",
  delete: "Supprimer",
  close: "Fermer",

  // Statuts
  statusConfirmed: "Confirmé",
  statusCancelled: "Annulé",
  statusTentative: "Tentative",

  // Récurrence
  recurNone: "Aucune",
  recurDaily: "Tous les jours",
  recurWeekly: "Toutes les semaines",
  recurMonthly: "Tous les mois",

  // Formulaire
  formTitle: "Nouvel événement",
  fieldTitle: "Titre",
  fieldTitlePlaceholder: "Titre de l'événement",
  fieldFrom: "Du",
  fieldTo: "Au (optionnel)",
  fieldToTitle: "Laisser vide pour un événement sur un seul jour",
  fieldTime: "Heure",
  fieldDuration: "Durée (min)",
  fieldDurationPlaceholder: "60",
  fieldRecurrence: "Récurrence",
  fieldLocation: "Lieu",
  fieldLocationPlaceholder: "Salle, Visio...",
  fieldDescription: "Description",
  fieldDescriptionPlaceholder: "Optionnel",
  fieldColor: "Couleur",
  create: "Créer",
  cancel: "Annuler",

  // Couleurs
  colorCyan: "Cyan",
  colorOrange: "Orange",
  colorGreen: "Vert",
  colorPurple: "Violet",
  colorRed: "Rouge",

  // Retour
  backToModules: "← Retour aux modules",

  // Page de redirection
  redirecting: "Redirection vers le calendrier…",

  // Documentation
  docTitle: "Documentation — Calendrier",
  docDescription:
    "Agenda avec vues jour, semaine et mois. Événements et rappels, optionnellement synchronisables avec un backend ou un calendrier externe.",
  docIntro:
    "Cette documentation décrit comment utiliser le module Calendrier, comment il fonctionne (vues jour / semaine / mois, données événements), comment l'intégrer (API ou store local) et comment le paramétrer. Les modules Blueprint Modular font partie de l'application Next.js : on installe l'application une fois, puis on configure les variables d'environnement selon les modules utilisés.",
  docHowTitle: "Comment fonctionne le module Calendrier",
  docHowBody:
    "Le module Calendrier affiche des événements avec date, heure, titre et durée. Trois vues sont disponibles : Jour (agenda du jour), Semaine (liste ou grille de la semaine), Mois (grille du mois avec indicateurs par jour). Les données peuvent provenir d'un état local (React), d'une API REST ou d'un service de calendrier (Google Calendar, etc.) selon votre implémentation.",
  docStructTitle: "Structure des événements",
  docStructIntro:
    "Chaque événement est un objet avec les champs suivants (tous optionnels sauf date, heure, titre) :",
  docFieldId: "identifiant unique",
  docFieldDate: "date au format YYYY-MM-DD",
  docFieldHeure: "heure de début (ex. 09h, 14h30)",
  docFieldTitre: "libellé de l'événement",
  docFieldDuree: "durée en minutes (optionnel)",
  docFieldCouleur: "couleur d'affichage (optionnel)",
  docFieldDescription: "notes ou description (optionnel)",
  docFieldLieu: "lieu (salle, Visio) (optionnel)",
  docFieldCategorie: "catégorie ou tag (optionnel)",
  docFieldStatut: "confirmé / annulé / tentative (optionnel)",
  docFieldParticipants: "liste d'identifiants ou noms (optionnel)",
  docCompatTitle: "Compatible avec",
  docCompatIntro: "Le Calendrier s'intègre naturellement avec d'autres modules Blueprint Modular :",
  docCompatTasks: "Tâches",
  docCompatTasksBody: "une tâche avec échéance peut être affichée comme événement dans l'agenda.",
  docCompatWorkflow: "Workflow",
  docCompatWorkflowBody:
    "les transitions de statut peuvent déclencher des créneaux ou rappels dans le calendrier.",
  docCompatNotif: "Notifications ciblées",
  docCompatNotifBody:
    "rappels (ex. J-1 avant un événement) ou alertes selon le profil utilisateur.",
  docCompatBooking: "Réservation / Créneaux",
  docCompatBookingBody: "partage de la notion de plage horaire et de disponibilité.",
  docIntegTitle: "Intégration côté app",
  docIntegBody:
    "Le module est une page Next.js (/modules/calendrier). Pour alimenter les événements depuis votre backend, exposez une API (ex. GET /api/calendar/events) et appelez-la depuis la page ou un hook. Aucune variable d'environnement spécifique n'est requise pour le module Calendrier.",
  docExampleLabel: "Exemple — récupérer les événements :",
  docSimuTitle: "Simulateur",
  docSimuBody:
    "Le simulateur propose la vue Jour (timeline verticale avec créneaux 8h–20h et événements positionnés, gestion des chevauchements), la vue Semaine (grille temporelle : colonnes Lun–Dim, lignes par demi-heure), la vue Mois (grille avec jour courant mis en évidence, clic pour ouvrir le jour). S'y ajoutent la navigation temporelle (← / →, Aujourd'hui), les filtres par couleur, le clic sur un événement (modale détail) et le bouton + Nouvel événement (formulaire de création). Aucune icône ambiguë dans l'en-tête : libellés clairs uniquement.",
  docOpenSimu: "Ouvrir le simulateur Calendrier",
  docBackToCalendar: "← Retour au Calendrier",
};

type ModuleStrings = typeof fr;

const en: ModuleStrings = {
  breadcrumbModules: "Modules",
  breadcrumbDocumentation: "Documentation",
  moduleName: "Calendar",

  simuTitle: "Simulator — Calendar",
  simuDescription:
    "Day (timeline), Week (grid) and Month views. Navigation, filters, event details and creation.",

  prev: "Previous",
  next: "Next",
  today: "Today",
  prevAria: "Previous period",
  nextAria: "Next period",
  newEvent: "+ New event",

  filterLabel: "Filter:",
  filterAll: "All",
  colorFallback: "Color",

  viewDay: "Day",
  viewWeek: "Week",
  viewMonth: "Month",

  emptyDay: "No events on this day.",
  emptyWeek: "No events this week.",

  monthHint: "Click a day to open the Day view. The highlighted day is today.",

  detailDate: "Date",
  detailTime: "Time",
  detailRecurrence: "Recurrence",
  detailLocation: "Location",
  detailCategory: "Category",
  detailStatus: "Status",
  detailDescription: "Description",
  detailParticipants: "Participants",
  delete: "Delete",
  close: "Close",

  statusConfirmed: "Confirmed",
  statusCancelled: "Cancelled",
  statusTentative: "Tentative",

  recurNone: "None",
  recurDaily: "Every day",
  recurWeekly: "Every week",
  recurMonthly: "Every month",

  formTitle: "New event",
  fieldTitle: "Title",
  fieldTitlePlaceholder: "Event title",
  fieldFrom: "From",
  fieldTo: "To (optional)",
  fieldToTitle: "Leave empty for a single-day event",
  fieldTime: "Time",
  fieldDuration: "Duration (min)",
  fieldDurationPlaceholder: "60",
  fieldRecurrence: "Recurrence",
  fieldLocation: "Location",
  fieldLocationPlaceholder: "Room, video call...",
  fieldDescription: "Description",
  fieldDescriptionPlaceholder: "Optional",
  fieldColor: "Color",
  create: "Create",
  cancel: "Cancel",

  colorCyan: "Cyan",
  colorOrange: "Orange",
  colorGreen: "Green",
  colorPurple: "Purple",
  colorRed: "Red",

  backToModules: "← Back to modules",

  redirecting: "Redirecting to the calendar…",

  docTitle: "Documentation — Calendar",
  docDescription:
    "Agenda with day, week and month views. Events and reminders, optionally synced with a backend or an external calendar.",
  docIntro:
    "This documentation describes how to use the Calendar module, how it works (day / week / month views, event data), how to integrate it (API or local store) and how to configure it. Blueprint Modular modules are part of the Next.js application: you install the application once, then configure environment variables according to the modules you use.",
  docHowTitle: "How the Calendar module works",
  docHowBody:
    "The Calendar module displays events with a date, time, title and duration. Three views are available: Day (the day's agenda), Week (list or grid for the week), Month (a month grid with per-day indicators). Data can come from local state (React), a REST API or a calendar service (Google Calendar, etc.) depending on your implementation.",
  docStructTitle: "Event structure",
  docStructIntro:
    "Each event is an object with the following fields (all optional except date, time, title):",
  docFieldId: "unique identifier",
  docFieldDate: "date in YYYY-MM-DD format",
  docFieldHeure: "start time (e.g. 09h, 14h30)",
  docFieldTitre: "event label",
  docFieldDuree: "duration in minutes (optional)",
  docFieldCouleur: "display color (optional)",
  docFieldDescription: "notes or description (optional)",
  docFieldLieu: "location (room, video call) (optional)",
  docFieldCategorie: "category or tag (optional)",
  docFieldStatut: "confirmed / cancelled / tentative (optional)",
  docFieldParticipants: "list of identifiers or names (optional)",
  docCompatTitle: "Compatible with",
  docCompatIntro: "The Calendar integrates naturally with other Blueprint Modular modules:",
  docCompatTasks: "Tasks",
  docCompatTasksBody: "a task with a due date can be shown as an event in the agenda.",
  docCompatWorkflow: "Workflow",
  docCompatWorkflowBody: "status transitions can trigger time slots or reminders in the calendar.",
  docCompatNotif: "Targeted notifications",
  docCompatNotifBody: "reminders (e.g. one day before an event) or alerts based on the user profile.",
  docCompatBooking: "Booking / Time slots",
  docCompatBookingBody: "shares the notion of time range and availability.",
  docIntegTitle: "Integration in the app",
  docIntegBody:
    "The module is a Next.js page (/modules/calendrier). To feed events from your backend, expose an API (e.g. GET /api/calendar/events) and call it from the page or a hook. No specific environment variable is required for the Calendar module.",
  docExampleLabel: "Example — fetch the events:",
  docSimuTitle: "Simulator",
  docSimuBody:
    "The simulator offers the Day view (vertical timeline with 8am–8pm slots and positioned events, overlap handling), the Week view (time grid: Mon–Sun columns, half-hour rows), the Month view (grid with the current day highlighted, click to open the day). It also includes time navigation (← / →, Today), color filters, clicking an event (detail modal) and the + New event button (creation form). No ambiguous icons in the header: clear labels only.",
  docOpenSimu: "Open the Calendar simulator",
  docBackToCalendar: "← Back to the Calendar",
} as const;

export const STR = { fr, en } as const;

export function str(locale: Locale): ModuleStrings {
  return locale === "en" ? en : fr;
}

// --- Données bilingues pour les seeds de démo ---

export type BiText = { fr: string; en: string };

export function resolveBi(value: BiText | string, locale: Locale): string {
  if (typeof value === "string") return value;
  return value[locale];
}

/** Titres d'événements de démo (bilingues). */
export const DEMO_TITLES: BiText[] = [
  { fr: "Réunion équipe", en: "Team meeting" },
  { fr: "Revue livrables", en: "Deliverables review" },
  { fr: "Point client", en: "Client check-in" },
  { fr: "Rétro sprint", en: "Sprint retrospective" },
  { fr: "Formation", en: "Training" },
  { fr: "Stand-up", en: "Stand-up" },
  { fr: "Prépa démo", en: "Demo prep" },
  { fr: "Audit technique", en: "Technical audit" },
  { fr: "Planification", en: "Planning" },
  { fr: "Validation budget", en: "Budget sign-off" },
];

export const DEMO_TITLE_SHORT: BiText = { fr: "Réunion courte", en: "Short meeting" };

/** Lieux de démo (bilingues). La chaîne vide reste vide. */
export const DEMO_LIEUX: (BiText | "")[] = [
  { fr: "Salle A", en: "Room A" },
  { fr: "Visio", en: "Video call" },
  { fr: "Open space", en: "Open space" },
  { fr: "Salle de conférence", en: "Conference room" },
  "",
];

export const DEMO_LIEU_VISIO: BiText = { fr: "Visio", en: "Video call" };

/** Catégories de démo (bilingues). */
export const DEMO_CATEGORIES: BiText[] = [
  { fr: "Réunion", en: "Meeting" },
  { fr: "Formation", en: "Training" },
  { fr: "Client", en: "Client" },
  { fr: "Interne", en: "Internal" },
  { fr: "Planification", en: "Planning" },
];

export const DEMO_CATEGORY_CLIENT: BiText = { fr: "Client", en: "Client" };
export const DEMO_CATEGORY_INTERNE: BiText = { fr: "Interne", en: "Internal" };

export const DEMO_DESCRIPTION: BiText = {
  fr: "Points à l'ordre du jour : suivi des actions, prochaines étapes.",
  en: "Agenda items: action follow-ups, next steps.",
};

// Statuts (clés internes inchangées -> libellés)
export function statusLabel(
  statut: "confirmé" | "annulé" | "tentative",
  locale: Locale
): string {
  const s = str(locale);
  if (statut === "confirmé") return s.statusConfirmed;
  if (statut === "annulé") return s.statusCancelled;
  return s.statusTentative;
}

// Mois / jours bilingues
const MONTHS_FR =
  "janvier,février,mars,avril,mai,juin,juillet,août,septembre,octobre,novembre,décembre".split(",");
const MONTHS_EN =
  "January,February,March,April,May,June,July,August,September,October,November,December".split(",");

const WEEKDAYS_SHORT_FR = "dim.,lun.,mar.,mer.,jeu.,ven.,sam.".split(",");
const WEEKDAYS_SHORT_EN = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");

const WEEKDAYS_LABELS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const WEEKDAYS_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WEEKDAYS_FULL_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const WEEKDAYS_FULL_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function months(locale: Locale): string[] {
  return locale === "en" ? MONTHS_EN : MONTHS_FR;
}
export function weekdaysShort(locale: Locale): string[] {
  return locale === "en" ? WEEKDAYS_SHORT_EN : WEEKDAYS_SHORT_FR;
}
/** Libellés Lun..Dim (en-têtes de grille). */
export function weekdaysLabels(locale: Locale): string[] {
  return locale === "en" ? WEEKDAYS_LABELS_EN : WEEKDAYS_LABELS_FR;
}
/** Noms complets, ordre Lundi..Dimanche. */
export function weekdaysFull(locale: Locale): string[] {
  return locale === "en" ? WEEKDAYS_FULL_EN : WEEKDAYS_FULL_FR;
}

/** Libellé "Semaine N - du X au Y" / "Week N - from X to Y". */
export function weekTitle(
  locale: Locale,
  weekNum: number,
  startStr: string,
  endStr: string
): string {
  return locale === "en"
    ? `Week ${weekNum} - from ${startStr} to ${endStr}`
    : `Semaine ${weekNum} - du ${startStr} au ${endStr}`;
}
