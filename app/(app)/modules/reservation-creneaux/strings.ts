/**
 * Chaînes bilingues du module Réservation / Créneaux.
 * Parité de clés FR/EN garantie à la compilation (en: ModuleStrings).
 */

export type LocalizedText = { fr: string; en: string };

const DAYS_FR = ["Lundi 15", "Mardi 16", "Mercredi 17", "Jeudi 18", "Vendredi 19"];
const DAYS_EN = ["Monday 15", "Tuesday 16", "Wednesday 17", "Thursday 18", "Friday 19"];
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const dayMonthEn = (d: number) => `${DAY_NAMES_EN[d]}, June ${15 + d}`;

const fr = {
  // Communs / navigation
  modules: "Modules",
  moduleName: "Réservation / Créneaux",
  documentation: "Documentation",
  simulator: "Simulateur",
  openSimulator: "Ouvrir le simulateur",

  // Page module (page.tsx)
  pageDescription:
    "Réservez vos salles de réunion sur un planning hebdomadaire : créneaux libres cliquables, contrôle de conflit (1 h / 2 h), annulation, taux d'occupation. Tout est manipulable dans le Simulateur.",
  categoryBadge: "Métier",
  aboutTitle: "À propos",
  aboutText:
    "Le module Réservation / Créneaux gère la réservation de ressources partagées — ici trois salles de réunion (Salle Hugo, Salle Colette, Box Rimbaud). Le planning hebdomadaire affiche en un coup d'œil les créneaux libres et occupés de la salle sélectionnée : un clic sur une case libre ouvre le formulaire de réservation (titre, organisateur, durée 1 h ou 2 h avec contrôle de conflit), un clic sur une case occupée affiche le détail en lecture seule. Vos propres réservations sont mises en évidence et annulables à tout moment.",
  componentsTitle: "Composants utilisés",
  compSegMetric: "(réservations, taux d'occupation, salle la plus demandée),",
  compSegSelect: "(choix de la ressource et de la durée),",
  compSegModal: "(réservation et détail),",
  compSegConfirm: "(annulation),",
  and: "et",
  compSegGrid:
    "La grille du planning est une grille CSS locale (Lun→Ven × créneaux 09:00–18:00).",
  settingsTitle: "Paramétrage",
  settingsText1:
    "Le simulateur fonctionne entièrement en local (réservations seedées, aucune API requise). En production, brancher les ressources et réservations sur votre backend et synchroniser avec l'agenda des collaborateurs. Voir la",
  settingsDocLink: "documentation",
  settingsText2:
    "pour le modèle ressource / créneau / réservation, les règles de conflit et l'intégration calendrier.",

  // Page simulateur (simulateur/page.tsx)
  simPageTitle: "Simulateur — Réservation / Créneaux",
  simPageDescription:
    "Trois salles, un planning Lun→Ven (09:00–18:00) et onze réservations déjà posées. Changez de salle, cliquez sur une case libre pour réserver (1 h ou 2 h, conflits contrôlés), consultez les réservations des autres, annulez les vôtres : métriques et planning se mettent à jour en direct.",

  // Page documentation (documentation/page.tsx)
  docPageTitle: "Documentation — Réservation / Créneaux",
  docPageDescription:
    "Réservation de ressources partagées (salles de réunion) : modèle de données, règles de conflit et intégration calendrier.",
  dataModelTitle: "Modèle de données",
  dm1: "Trois entités. Une ",
  dmResource: "ressource",
  dm2: " décrit ce qui se réserve (capacité, équipements). Un ",
  dmSlot: "créneau",
  dm3: " est une unité de temps réservable — ici un pas d'1 h entre 09:00 et 18:00, du lundi au vendredi, soit 45 créneaux par ressource et par semaine. Une ",
  dmBooking: "réservation",
  dm4: " pose un titre, un organisateur et une durée (1 ou 2 créneaux consécutifs) sur une ressource.",
  dataModelCode: `// Ressource
{
  "id": "hugo",
  "nom": "Salle Hugo",
  "capacite": 8,
  "equipements": ["Écran", "Visio"]
}

// Créneau (implicite : grille jour × heure)
{ "jour": "Lundi 15", "debut": "09:00", "fin": "10:00" }

// Réservation
{
  "id": "rsv-1",
  "ressourceId": "hugo",
  "jour": 0,                 // 0 = Lundi … 4 = Vendredi
  "heure": 9,                // créneau de départ (09:00)
  "duree": 2,                // en heures (1 ou 2)
  "titre": "Comité de direction",
  "organisateur": "Claire Morel",
  "participants": 7
}`,
  rulesTitle: "Règles de conflit",
  rule1Title: "Unicité du créneau",
  rule1Text:
    " — une case (ressource × jour × heure) ne peut porter qu'une seule réservation : seules les cases libres sont cliquables pour réserver.",
  rule2Title: "Durée de 2 h",
  rule2Text:
    " — la réservation occupe deux créneaux consécutifs ; elle est refusée (message d'erreur dans le modal) si le créneau suivant est déjà occupé ou s'il dépasse 18:00.",
  rule3Title: "Annulation",
  rule3TextA:
    " — seules vos propres réservations sont annulables, après confirmation explicite (",
  rule3TextB: ") ; tous les créneaux occupés sont alors libérés.",
  rule4Title: "Lecture seule",
  rule4Text:
    " — les réservations des autres collaborateurs sont consultables (titre, organisateur, participants) mais jamais modifiables.",
  indicatorsTitle: "Indicateurs",
  indicatorsText:
    "Le taux d'occupation rapporte le nombre d'heures réservées de la salle affichée aux 45 créneaux de la semaine. « Réservations cette semaine » et « Salle la plus demandée » agrègent l'ensemble des ressources. Les trois indicateurs sont recalculés à chaque réservation ou annulation.",
  calendarTitle: "Intégration calendrier",
  cal1: "Le simulateur fonctionne en local (état React seedé). En production : persister ressources et réservations (tables ",
  cal2: " avec contrainte d'exclusion sur l'intervalle ressource × plage horaire), publier chaque réservation comme événement dans l'agenda de l'organisateur (invitation aux participants, salle en tant que ressource invitée) et synchroniser les annulations dans les deux sens. Le module ",
  calLink: "Calendrier",
  cal3: " fournit la vue semaine correspondante côté agenda.",

  // Simulateur — métriques
  metricWeekBookings: "Réservations cette semaine",
  metricOccupancy: (room: string) => `Taux d'occupation — ${room}`,
  metricTopRoom: "Salle la plus demandée",
  percent: (n: number) => `${n} %`,

  // Simulateur — planning
  planningTitle: "Planning hebdomadaire — Semaine du 15 juin",
  resourceLabel: "Ressource",
  resourcePlaceholder: "Choisir une salle",
  seats: (n: number) => `${n} places`,
  days: DAYS_FR,
  dayMonth: (d: number) => `${DAYS_FR[d]} juin`,
  hourHeader: "Heure",
  bookCta: "+ Réserver",
  bookSlotTitle: (room: string, d: number, range: string) =>
    `Réserver ${room} — ${DAYS_FR[d]} juin, ${range}`,
  bookSlotAria: (d: number, range: string) =>
    `Réserver le créneau ${DAYS_FR[d]} ${range}`,
  occupiedTooltip: (title: string, organizer: string, participants?: number) =>
    `${title} — ${organizer}${participants ? ` (${participants} participants)` : ""}`,
  detailAria: (title: string) => `Détail de la réservation ${title}`,
  yours: "À vous",
  continued: "(suite)",
  legendFree: "Libre (cliquer pour réserver)",
  legendBusy: "Occupé",
  legendMine: "Vos réservations",

  // Simulateur — mes réservations
  myBookingsTitle: "Mes réservations",
  myBookingsEmpty:
    "Aucune réservation à votre nom cette semaine. Cliquez sur une case libre du planning pour en créer une.",
  cancel: "Annuler",

  // Simulateur — modal de réservation
  bookModalTitle: "Réserver un créneau",
  fromHour: (h: string) => `à partir de ${h}`,
  meetingTitleLabel: "Titre de la réunion",
  meetingTitlePlaceholder: "Ex. : Point projet hebdomadaire",
  organizerLabel: "Organisateur",
  you: "Vous",
  durationLabel: "Durée",
  durationPlaceholder: "Durée",
  duration1h: "1 heure",
  duration2h: "2 heures",
  twoHourHint: (range: string) =>
    `Créneau demandé : ${range} (le créneau suivant doit être libre).`,
  errTitleRequired: "Le titre de la réunion est requis.",
  errOutOfRange:
    "Impossible de réserver 2 h : le créneau suivant est en dehors du planning (09:00–18:00).",
  errConflict: (range: string) =>
    `Impossible de réserver 2 h : le créneau ${range} est déjà occupé. Choisissez 1 heure ou un autre créneau.`,
  confirmBooking: "Confirmer la réservation",

  // Simulateur — modal lecture seule
  roomLabel: "Salle :",
  slotLabel: "Créneau :",
  organizerLabelColon: "Organisateur :",
  participantsLabel: "Participants :",
  readOnlyNote: "Réservation faite par un autre collaborateur — consultation seule.",
  cancelBooking: "Annuler la réservation",
  close: "Fermer",
  roomFallback: "Salle",

  // Simulateur — annulation (ConfirmModal)
  confirmCancelTitle: "Annuler la réservation",
  confirmCancelMsg: (title: string, room: string, d: number, range: string) =>
    `« ${title} » (${room}, ${DAYS_FR[d]} juin, ${range}) sera annulée et le créneau redeviendra libre.`,
  keep: "Conserver",

  // Simulateur — toasts
  toastSource: "Réservation de créneaux",
  toastBookedTitle: "Réservation confirmée",
  toastBookedMsg: (room: string, d: number, range: string, title: string) =>
    `${room} réservée le ${DAYS_FR[d].toLowerCase()} juin, ${range} — « ${title} ».`,
  toastCancelledTitle: "Réservation annulée",
  toastCancelledMsg: (title: string, room: string, d: number, range: string) =>
    `« ${title} » (${room}, ${DAYS_FR[d].toLowerCase()} juin, ${range}) a été annulée. Le créneau est de nouveau libre.`,
};

export type ModuleStrings = typeof fr;

const en: ModuleStrings = {
  // Common / navigation
  modules: "Modules",
  moduleName: "Booking / Time Slots",
  documentation: "Documentation",
  simulator: "Simulator",
  openSimulator: "Open the simulator",

  // Module page (page.tsx)
  pageDescription:
    "Book your meeting rooms on a weekly schedule: clickable free slots, conflict checking (1 h / 2 h), cancellation, occupancy rate. Everything can be tried out in the Simulator.",
  categoryBadge: "Business",
  aboutTitle: "About",
  aboutText:
    "The Booking / Time Slots module manages the booking of shared resources — here three meeting rooms (Hugo Room, Colette Room, Rimbaud Booth). The weekly schedule shows at a glance the free and booked slots of the selected room: clicking a free cell opens the booking form (title, organizer, 1 h or 2 h duration with conflict checking), clicking a booked cell shows the details in read-only mode. Your own bookings are highlighted and can be cancelled at any time.",
  componentsTitle: "Components used",
  compSegMetric: "(bookings, occupancy rate, most requested room),",
  compSegSelect: "(resource and duration selection),",
  compSegModal: "(booking and details),",
  compSegConfirm: "(cancellation),",
  and: "and",
  compSegGrid: "The schedule grid is a local CSS grid (Mon→Fri × 09:00–18:00 slots).",
  settingsTitle: "Configuration",
  settingsText1:
    "The simulator runs entirely locally (seeded bookings, no API required). In production, wire resources and bookings to your backend and sync with your team's calendars. See the",
  settingsDocLink: "documentation",
  settingsText2:
    "for the resource / slot / booking model, conflict rules and calendar integration.",

  // Simulator page (simulateur/page.tsx)
  simPageTitle: "Simulator — Booking / Time Slots",
  simPageDescription:
    "Three rooms, a Mon→Fri schedule (09:00–18:00) and eleven bookings already in place. Switch rooms, click a free cell to book (1 or 2 hours, conflicts checked), view other people's bookings, cancel your own: metrics and schedule update live.",

  // Documentation page (documentation/page.tsx)
  docPageTitle: "Documentation — Booking / Time Slots",
  docPageDescription:
    "Booking of shared resources (meeting rooms): data model, conflict rules and calendar integration.",
  dataModelTitle: "Data model",
  dm1: "Three entities. A ",
  dmResource: "resource",
  dm2: " describes what can be booked (capacity, equipment). A ",
  dmSlot: "slot",
  dm3: " is a bookable unit of time — here a 1-hour step between 09:00 and 18:00, Monday to Friday, i.e. 45 slots per resource per week. A ",
  dmBooking: "booking",
  dm4: " places a title, an organizer and a duration (1 or 2 consecutive slots) on a resource.",
  dataModelCode: `// Resource
{
  "id": "hugo",
  "nom": "Hugo Room",
  "capacite": 8,
  "equipements": ["Screen", "Video"]
}

// Slot (implicit: day × hour grid)
{ "jour": "Monday 15", "debut": "09:00", "fin": "10:00" }

// Booking
{
  "id": "rsv-1",
  "ressourceId": "hugo",
  "jour": 0,                 // 0 = Monday … 4 = Friday
  "heure": 9,                // starting slot (09:00)
  "duree": 2,                // in hours (1 or 2)
  "titre": "Executive committee",
  "organisateur": "Claire Morel",
  "participants": 7
}`,
  rulesTitle: "Conflict rules",
  rule1Title: "Slot uniqueness",
  rule1Text:
    " — a cell (resource × day × hour) can hold only one booking: only free cells are clickable for booking.",
  rule2Title: "2-hour duration",
  rule2Text:
    " — the booking occupies two consecutive slots; it is rejected (error message in the modal) if the next slot is already booked or if it extends past 18:00.",
  rule3Title: "Cancellation",
  rule3TextA:
    " — only your own bookings can be cancelled, after explicit confirmation (",
  rule3TextB: "); all occupied slots are then freed.",
  rule4Title: "Read only",
  rule4Text:
    " — other colleagues' bookings can be viewed (title, organizer, participants) but never modified.",
  indicatorsTitle: "Indicators",
  indicatorsText:
    "The occupancy rate relates the number of booked hours of the displayed room to the 45 slots of the week. \"Bookings this week\" and \"Most requested room\" aggregate all resources. All three indicators are recalculated on every booking or cancellation.",
  calendarTitle: "Calendar integration",
  cal1: "The simulator runs locally (seeded React state). In production: persist resources and bookings (",
  cal2: " tables with an exclusion constraint on the resource × time-range interval), publish each booking as an event in the organizer's calendar (invitation sent to participants, room added as an invited resource) and sync cancellations both ways. The ",
  calLink: "Calendar",
  cal3: " module provides the matching week view on the calendar side.",

  // Simulator — metrics
  metricWeekBookings: "Bookings this week",
  metricOccupancy: (room: string) => `Occupancy rate — ${room}`,
  metricTopRoom: "Most requested room",
  percent: (n: number) => `${n}%`,

  // Simulator — schedule
  planningTitle: "Weekly schedule — Week of June 15",
  resourceLabel: "Resource",
  resourcePlaceholder: "Choose a room",
  seats: (n: number) => `${n} seats`,
  days: DAYS_EN,
  dayMonth: dayMonthEn,
  hourHeader: "Time",
  bookCta: "+ Book",
  bookSlotTitle: (room: string, d: number, range: string) =>
    `Book ${room} — ${dayMonthEn(d)}, ${range}`,
  bookSlotAria: (d: number, range: string) => `Book the ${DAYS_EN[d]} ${range} slot`,
  occupiedTooltip: (title: string, organizer: string, participants?: number) =>
    `${title} — ${organizer}${participants ? ` (${participants} participants)` : ""}`,
  detailAria: (title: string) => `Booking details for ${title}`,
  yours: "Yours",
  continued: "(cont.)",
  legendFree: "Free (click to book)",
  legendBusy: "Booked",
  legendMine: "Your bookings",

  // Simulator — my bookings
  myBookingsTitle: "My bookings",
  myBookingsEmpty:
    "No bookings under your name this week. Click a free cell in the schedule to create one.",
  cancel: "Cancel",

  // Simulator — booking modal
  bookModalTitle: "Book a time slot",
  fromHour: (h: string) => `from ${h}`,
  meetingTitleLabel: "Meeting title",
  meetingTitlePlaceholder: "e.g. Weekly project check-in",
  organizerLabel: "Organizer",
  you: "You",
  durationLabel: "Duration",
  durationPlaceholder: "Duration",
  duration1h: "1 hour",
  duration2h: "2 hours",
  twoHourHint: (range: string) =>
    `Requested slot: ${range} (the next slot must be free).`,
  errTitleRequired: "The meeting title is required.",
  errOutOfRange:
    "Cannot book 2 hours: the next slot falls outside the schedule (09:00–18:00).",
  errConflict: (range: string) =>
    `Cannot book 2 hours: the ${range} slot is already booked. Choose 1 hour or another slot.`,
  confirmBooking: "Confirm booking",

  // Simulator — read-only modal
  roomLabel: "Room:",
  slotLabel: "Slot:",
  organizerLabelColon: "Organizer:",
  participantsLabel: "Participants:",
  readOnlyNote: "Booked by another colleague — read only.",
  cancelBooking: "Cancel booking",
  close: "Close",
  roomFallback: "Room",

  // Simulator — cancellation (ConfirmModal)
  confirmCancelTitle: "Cancel booking",
  confirmCancelMsg: (title: string, room: string, d: number, range: string) =>
    `"${title}" (${room}, ${dayMonthEn(d)}, ${range}) will be cancelled and the slot will become free again.`,
  keep: "Keep",

  // Simulator — toasts
  toastSource: "Slot booking",
  toastBookedTitle: "Booking confirmed",
  toastBookedMsg: (room: string, d: number, range: string, title: string) =>
    `${room} booked on ${dayMonthEn(d)}, ${range} — "${title}".`,
  toastCancelledTitle: "Booking cancelled",
  toastCancelledMsg: (title: string, room: string, d: number, range: string) =>
    `"${title}" (${room}, ${dayMonthEn(d)}, ${range}) has been cancelled. The slot is free again.`,
};

export const STR = { fr, en } as const;
