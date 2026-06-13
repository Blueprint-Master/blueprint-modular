import type { Locale } from "@/lib/i18n";

/** Texte localisé : une valeur par locale. La parité FR/EN est garantie par le type. */
export type LText = Record<Locale, string>;

const fr = {
  // ---- Commun -------------------------------------------------------------
  /** Nom du module (titre, breadcrumb, source des toasts). */
  moduleName: "Référentiels",

  // ---- Page module (page.tsx) ----------------------------------------------
  moduleDescription:
    "Administrez les tables de codes partagées (devises, pays, taux de TVA, unités de " +
    "mesure) : ajout contrôlé, modification, activation/désactivation, suppression protégée " +
    "et export CSV. Tout est manipulable dans le Simulateur.",
  categoryBadge: "Données & reporting",
  openSimulator: "Ouvrir le simulateur",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",
  aboutTitle: "À propos",
  aboutBody:
    "Le module Référentiels est l'outil d'administration des tables de codes partagées " +
    "par toutes les applications : devises, pays, taux de TVA, unités de mesure. Chaque " +
    "référentiel a ses propres colonnes, mais le cycle de vie est commun : on ajoute une entrée " +
    "(code unique + format contrôlé), on la modifie, on la désactive quand elle ne doit plus être " +
    "proposée — et on ne la supprime que si aucun enregistrement ne la référence.",
  componentsTitle: "Composants utilisés",
  configTitle: "Paramétrage",

  // ---- Page simulateur -------------------------------------------------------
  simulatorPageTitle: "Simulateur — Référentiels",
  simulatorPageDescription:
    "Quatre tables de codes seedées (devises, pays, taux de TVA, unités de mesure). " +
    "Ajoutez une entrée, modifiez-la, désactivez-la, exportez le référentiel en CSV : " +
    "chaque action met à jour le tableau, les métriques et l'historique. La suppression " +
    "est refusée si l'entrée est encore utilisée (ex. EUR).",

  // ---- Page documentation ----------------------------------------------------
  docPageTitle: "Documentation — Référentiels",
  docPageDescription:
    "Tables de codes partagées (devises, pays, taux de TVA, unités de mesure) : modèle de " +
    "données, gouvernance, versionnage et diffusion aux applications.",
  docModelTitle: "Modèle d'une entrée de référentiel",
  docGovernanceTitle: "Gouvernance — qui modifie quoi",
  docVersioningTitle: "Versionnage",
  docVersioningBody:
    "Chaque référentiel porte un numéro de version incrémenté à chaque modification (ajout, " +
    "édition, bascule actif/inactif, suppression). L'historique conserve l'auteur, l'action, " +
    "l'entrée touchée et l'horodatage — c'est l'équivalent du flux « Historique des " +
    "modifications » du simulateur. Les anciennes valeurs ne sont jamais écrasées " +
    "physiquement : une entrée obsolète (ex. l'ancien taux normal de TVA à 19,6 %) reste " +
    "consultable à l'état inactif pour relire les documents historiques.",
  docDistributionTitle: "Diffusion aux applications",
  docProductionTitle: "Intégration en production",

  // ---- Métriques --------------------------------------------------------------
  metricReferentiels: "Référentiels",
  metricTotalEntries: "Entrées totales",
  metricInactiveEntries: "Entrées inactives",

  // ---- Panneau référentiel ------------------------------------------------------
  refPanelTitle: (name: string, count: number) =>
    `Référentiel « ${name} » — ${count} entrée(s)`,
  selectorLabel: "Référentiel",
  selectorPlaceholder: "Choisir un référentiel",
  searchLabel: "Recherche (code ou libellé)",
  searchPlaceholder: "ex. EUR, Euro…",
  exportCsv: "Exporter en CSV",
  noSearchMatch: (q: string) => `Aucune entrée ne correspond à « ${q} ».`,

  // ---- Colonnes du tableau --------------------------------------------------------
  colCode: "Code",
  colLabel: "Libellé",
  colUses: "Utilisations",
  colStatus: "Statut",
  colActions: "Actions",
  badgeActive: "Actif",
  badgeInactive: "Inactif",
  actionEdit: "Modifier",
  actionEnable: "Activer",
  actionDisable: "Désactiver",
  actionDelete: "Supprimer",

  // ---- Formulaires (ajout / édition) ----------------------------------------------
  addPanelTitle: (name: string) => `Ajouter une entrée à « ${name} »`,
  codeFieldLabel: (hint: string) => `Code — ${hint}`,
  labelFieldLabel: "Libellé",
  labelFieldPlaceholder: "Libellé affiché dans les formulaires",
  choosePlaceholder: "Choisir",
  addEntryButton: "Ajouter l'entrée",
  editModalTitle: (code: string, name: string) => `Modifier ${code} — ${name}`,
  cancel: "Annuler",
  save: "Enregistrer",

  // ---- Validations -------------------------------------------------------------------
  errCodeRequired: "Le code est requis.",
  errCodeFormat: (hint: string) => `Format de code invalide — attendu : ${hint}.`,
  errCodeExists: (code: string, name: string) =>
    `Le code ${code} existe déjà dans « ${name} ».`,
  errLabelRequired: "Le libellé est requis.",
  errFieldRequired: (field: string) => `Le champ « ${field} » est requis.`,
  errFieldPositiveNumber: (field: string) => `« ${field} » doit être un nombre positif.`,

  // ---- Toasts ---------------------------------------------------------------------------
  toastAddedTitle: "Entrée ajoutée",
  toastAdded: (code: string, label: string, name: string) =>
    `${code} — ${label} ajouté au référentiel « ${name} ».`,
  toastEditedTitle: "Entrée modifiée",
  toastEdited: (code: string, label: string, name: string) =>
    `${code} — ${label} mis à jour dans « ${name} ».`,
  toastEnabledTitle: "Entrée activée",
  toastEnabled: (code: string) => `${code} est de nouveau proposé dans les formulaires.`,
  toastDisabledTitle: "Entrée désactivée",
  toastDisabled: (code: string) =>
    `${code} n'est plus proposé dans les formulaires (les données existantes sont conservées).`,
  toastDeleteRefusedTitle: "Suppression refusée",
  toastDeleteRefused: (code: string, uses: number) =>
    `${code} est référencé par ${uses} enregistrement(s). Désactivez l'entrée plutôt que de la supprimer.`,
  toastDeletedTitle: "Entrée supprimée",
  toastDeleted: (code: string, label: string, name: string) =>
    `${code} — ${label} supprimé du référentiel « ${name} ».`,
  toastExportTitle: "Export CSV",
  toastExport: (file: string, count: number) => `${file} téléchargé (${count} entrées).`,

  // ---- Suppression (ConfirmModal) ---------------------------------------------------------
  deleteModalTitle: "Supprimer l'entrée",
  deleteModalMessage: (code: string, label: string, name: string) =>
    `${code} — ${label} sera retiré du référentiel « ${name} ». Cette entrée n'est utilisée par aucun enregistrement.`,

  // ---- Export CSV ----------------------------------------------------------------------------
  csvHeaderCode: "code",
  csvHeaderLabel: "libelle",
  csvHeaderActive: "actif",
  csvHeaderUses: "utilisations",
  csvYes: "oui",
  csvNo: "non",
  csvFileName: (slug: string) => `referentiel-${slug}.csv`,

  // ---- Historique (ActivityFeed) ---------------------------------------------------------------
  historyTitle: "Historique des modifications",
  you: "Vous",
  actAdded: "a ajouté",
  actEdited: "a modifié",
  actEnabled: "a activé",
  actDisabled: "a désactivé",
  actDeleted: "a supprimé",
  actExported: "a exporté",
  targetAdded: (code: string, name: string) => `${code} à ${name}`,
  targetIn: (code: string, name: string) => `${code} dans ${name}`,
  targetEditedLabel: (code: string, name: string) => `${code} dans ${name} (libellé)`,
  targetDeleted: (code: string, name: string) => `${code} de ${name}`,
  targetExported: (name: string, count: number) => `${name} (${count} entrées, CSV)`,
};

/** La contrainte `typeof fr` garantit la parité FR/EN clé par clé. */
const en: typeof fr = {
  // ---- Commun -------------------------------------------------------------
  moduleName: "Reference data",

  // ---- Page module (page.tsx) ----------------------------------------------
  moduleDescription:
    "Manage the shared code tables (currencies, countries, VAT rates, units of measure): " +
    "controlled creation, editing, enabling/disabling, protected deletion and CSV export. " +
    "Everything can be handled in the Simulator.",
  categoryBadge: "Data & reporting",
  openSimulator: "Open the simulator",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",
  aboutTitle: "About",
  aboutBody:
    "The Reference data module is the administration tool for the code tables shared by " +
    "every application: currencies, countries, VAT rates, units of measure. Each reference " +
    "table has its own columns, but the life cycle is the same: you add an entry (unique " +
    "code + enforced format), edit it, disable it when it should no longer be offered — and " +
    "you only delete it if no record references it.",
  componentsTitle: "Components used",
  configTitle: "Configuration",

  // ---- Page simulateur -------------------------------------------------------
  simulatorPageTitle: "Simulator — Reference data",
  simulatorPageDescription:
    "Four seeded code tables (currencies, countries, VAT rates, units of measure). " +
    "Add an entry, edit it, disable it, export the reference table to CSV: every action " +
    "updates the table, the metrics and the history. Deletion is refused if the entry is " +
    "still in use (e.g. EUR).",

  // ---- Page documentation ----------------------------------------------------
  docPageTitle: "Documentation — Reference data",
  docPageDescription:
    "Shared code tables (currencies, countries, VAT rates, units of measure): data model, " +
    "governance, versioning and distribution to applications.",
  docModelTitle: "Model of a reference entry",
  docGovernanceTitle: "Governance — who changes what",
  docVersioningTitle: "Versioning",
  docVersioningBody:
    "Each reference table carries a version number, incremented on every change (addition, " +
    "edit, active/inactive toggle, deletion). The history keeps the author, the action, the " +
    "affected entry and the timestamp — the equivalent of the simulator's \"Change history\" " +
    "feed. Old values are never physically overwritten: an obsolete entry (e.g. the former " +
    "standard VAT rate of 19.6%) remains available in the inactive state so historical " +
    "documents can still be read.",
  docDistributionTitle: "Distribution to applications",
  docProductionTitle: "Production integration",

  // ---- Métriques --------------------------------------------------------------
  metricReferentiels: "Reference tables",
  metricTotalEntries: "Total entries",
  metricInactiveEntries: "Inactive entries",

  // ---- Panneau référentiel ------------------------------------------------------
  refPanelTitle: (name: string, count: number) =>
    `"${name}" reference table — ${count} ${count === 1 ? "entry" : "entries"}`,
  selectorLabel: "Reference table",
  selectorPlaceholder: "Choose a reference table",
  searchLabel: "Search (code or label)",
  searchPlaceholder: "e.g. EUR, Euro…",
  exportCsv: "Export to CSV",
  noSearchMatch: (q: string) => `No entries match "${q}".`,

  // ---- Colonnes du tableau --------------------------------------------------------
  colCode: "Code",
  colLabel: "Label",
  colUses: "Uses",
  colStatus: "Status",
  colActions: "Actions",
  badgeActive: "Active",
  badgeInactive: "Inactive",
  actionEdit: "Edit",
  actionEnable: "Enable",
  actionDisable: "Disable",
  actionDelete: "Delete",

  // ---- Formulaires (ajout / édition) ----------------------------------------------
  addPanelTitle: (name: string) => `Add an entry to "${name}"`,
  codeFieldLabel: (hint: string) => `Code — ${hint}`,
  labelFieldLabel: "Label",
  labelFieldPlaceholder: "Label shown in forms",
  choosePlaceholder: "Choose",
  addEntryButton: "Add entry",
  editModalTitle: (code: string, name: string) => `Edit ${code} — ${name}`,
  cancel: "Cancel",
  save: "Save",

  // ---- Validations -------------------------------------------------------------------
  errCodeRequired: "The code is required.",
  errCodeFormat: (hint: string) => `Invalid code format — expected: ${hint}.`,
  errCodeExists: (code: string, name: string) =>
    `The code ${code} already exists in "${name}".`,
  errLabelRequired: "The label is required.",
  errFieldRequired: (field: string) => `The "${field}" field is required.`,
  errFieldPositiveNumber: (field: string) => `"${field}" must be a positive number.`,

  // ---- Toasts ---------------------------------------------------------------------------
  toastAddedTitle: "Entry added",
  toastAdded: (code: string, label: string, name: string) =>
    `${code} — ${label} added to the "${name}" reference table.`,
  toastEditedTitle: "Entry updated",
  toastEdited: (code: string, label: string, name: string) =>
    `${code} — ${label} updated in "${name}".`,
  toastEnabledTitle: "Entry enabled",
  toastEnabled: (code: string) => `${code} is offered in forms again.`,
  toastDisabledTitle: "Entry disabled",
  toastDisabled: (code: string) =>
    `${code} is no longer offered in forms (existing data is kept).`,
  toastDeleteRefusedTitle: "Deletion refused",
  toastDeleteRefused: (code: string, uses: number) =>
    `${code} is referenced by ${uses} record${uses === 1 ? "" : "s"}. Disable the entry instead of deleting it.`,
  toastDeletedTitle: "Entry deleted",
  toastDeleted: (code: string, label: string, name: string) =>
    `${code} — ${label} deleted from the "${name}" reference table.`,
  toastExportTitle: "CSV export",
  toastExport: (file: string, count: number) =>
    `${file} downloaded (${count} ${count === 1 ? "entry" : "entries"}).`,

  // ---- Suppression (ConfirmModal) ---------------------------------------------------------
  deleteModalTitle: "Delete entry",
  deleteModalMessage: (code: string, label: string, name: string) =>
    `${code} — ${label} will be removed from the "${name}" reference table. This entry is not used by any record.`,

  // ---- Export CSV ----------------------------------------------------------------------------
  csvHeaderCode: "code",
  csvHeaderLabel: "label",
  csvHeaderActive: "active",
  csvHeaderUses: "uses",
  csvYes: "yes",
  csvNo: "no",
  csvFileName: (slug: string) => `reference-${slug}.csv`,

  // ---- Historique (ActivityFeed) ---------------------------------------------------------------
  historyTitle: "Change history",
  you: "You",
  actAdded: "added",
  actEdited: "edited",
  actEnabled: "enabled",
  actDisabled: "disabled",
  actDeleted: "deleted",
  actExported: "exported",
  targetAdded: (code: string, name: string) => `${code} to ${name}`,
  targetIn: (code: string, name: string) => `${code} in ${name}`,
  targetEditedLabel: (code: string, name: string) => `${code} in ${name} (label)`,
  targetDeleted: (code: string, name: string) => `${code} from ${name}`,
  targetExported: (name: string, count: number) =>
    `${name} (${count} ${count === 1 ? "entry" : "entries"}, CSV)`,
};

export type Strings = typeof fr;

export const STR: Record<Locale, Strings> = { fr, en };
