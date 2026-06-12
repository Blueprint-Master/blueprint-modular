import type { Locale } from "@/lib/i18n";

export type ColumnId = "bien" | "ameliorer" | "action";

/** Contenu bilingue résolu au render (les auteurs ne changent pas). */
export type SeedContent = { fr: string; en: string };

export type SeedPostIt = {
  id: string;
  content: SeedContent;
  column: ColumnId;
  authorId: string;
  authorName: string;
  createdAt: string; // ISO
  order: number;
};

/** Post-it de démo du simulateur (contenu {fr, en}, auteurs inchangés). */
export const SEED_POSTITS: SeedPostIt[] = [
  { id: "1", content: { fr: "Livraison à l'heure", en: "Delivered on time" }, column: "bien", authorId: "a", authorName: "Alice", createdAt: "2025-02-23T09:00:00", order: 0 },
  { id: "2", content: { fr: "Bonne communication équipe", en: "Good team communication" }, column: "bien", authorId: "b", authorName: "Bob", createdAt: "2025-02-23T09:05:00", order: 1 },
  { id: "3", content: { fr: "Tests à renforcer", en: "Tests need strengthening" }, column: "ameliorer", authorId: "a", authorName: "Alice", createdAt: "2025-02-23T09:10:00", order: 0 },
  { id: "4", content: { fr: "Dette technique sur le module X", en: "Technical debt in module X" }, column: "ameliorer", authorId: "b", authorName: "Bob", createdAt: "2025-02-23T09:15:00", order: 1 },
  { id: "5", content: { fr: "Rédiger la doc API", en: "Write the API docs" }, column: "action", authorId: "a", authorName: "Alice", createdAt: "2025-02-23T09:20:00", order: 0 },
  { id: "6", content: { fr: "Mettre en place les E2E", en: "Set up the E2E tests" }, column: "action", authorId: "current", authorName: "Marie Dupont", createdAt: "2025-02-23T09:25:00", order: 1 },
];

/** Échantillons de l'aperçu (onglet Simulateur de page.tsx). */
export const SAMPLE_POSTITS: { content: SeedContent; column: ColumnId }[] = [
  { content: { fr: "Livraison à l'heure", en: "Delivered on time" }, column: "bien" },
  { content: { fr: "Tests à renforcer", en: "Tests need strengthening" }, column: "ameliorer" },
  { content: { fr: "Doc API", en: "API docs" }, column: "action" },
];

type TableauBlancStrings = {
  // Partagé
  moduleName: string;
  columnLabels: Record<ColumnId, string>;
  formatDate: (iso: string) => string;

  // Page module (page.tsx)
  moduleDescription: string;
  categoryBadge: string;
  openSimulator: string;
  tabDocumentation: string;
  tabSimulator: string;
  aboutHeading: string;
  aboutBefore: string;
  aboutStrong: string;
  aboutAfter: string;
  simuIntro: string;
  previewHeading: string;
  previewFooter: string;

  // Page simulateur (simulateur/page.tsx)
  breadcrumbSimulator: string;
  simulatorTitle: string;
  simulatorDescription: string;
  boardHeading: (count: number) => string;
  newPostItLabel: string;
  inputPlaceholder: string;
  columnSelectLabel: string;
  addButton: string;
  saveButton: string;
  cancelButton: string;
  editAction: string;
  deleteAction: string;
  moveTo: (columnLabel: string) => string;
  emptyColumn: string;
  backToModule: string;

  // Page documentation (documentation/page.tsx)
  breadcrumbDocumentation: string;
  documentationTitle: string;
  documentationDescription: string;
  docIntro: string;
  howHeading: string;
  howBody: string;
  dataHeading: string;
  dataIntro: string;
  fieldIdContent: string;
  fieldColumn: string;
  fieldAuthorMid: string;
  fieldAuthorEnd: string;
  fieldCreatedAt: string;
  fieldOrder: string;
  fieldBoardId: string;
  connectionsHeading: string;
  connectionsIntro: string;
  connectionItems: { name: string; description: string }[];
  integrationHeading: string;
  integrationPage: string;
  integrationExpose: string;
  integrationEnv: string;
  simulatorHeading: string;
  simulatorBody: string;
  openSimulatorDoc: string;
};

export const STR: Record<Locale, TableauBlancStrings> = {
  fr: {
    moduleName: "Tableau blanc",
    columnLabels: { bien: "Bien", ameliorer: "À améliorer", action: "Action" },
    formatDate: (iso) => {
      const d = new Date(iso);
      return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, "0")} ${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`;
    },

    moduleDescription: "Post-it et zones de texte pour rétros ou ateliers. Testez dans le Simulateur.",
    categoryBadge: "Contenu & productivité",
    openSimulator: "Ouvrir le simulateur",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulateur",
    aboutHeading: "À propos",
    aboutBefore: "Le module ",
    aboutStrong: "Tableau blanc",
    aboutAfter:
      " fournit des post-it par colonnes (Bien / À améliorer / Action) pour rétrospectives ou ateliers. Auteur, date, actions (éditer, supprimer, déplacer). Contenu en local ou via API.",
    simuIntro: "Aperçu des 3 colonnes. Pour éditer, supprimer, déplacer et ajouter des post-it, ouvrez le simulateur.",
    previewHeading: "Zone idées (3 post-it)",
    previewFooter: "Nouveau post-it : zone de saisie + sélecteur de colonne + bouton Ajouter (simulateur complet).",

    breadcrumbSimulator: "Simulateur",
    simulatorTitle: "Simulateur — Tableau blanc",
    simulatorDescription:
      "Post-it par colonnes (Bien / À améliorer / Action), avec auteur, date et actions (éditer, supprimer, déplacer).",
    boardHeading: (count) => `Zone idées (${count} post-it)`,
    newPostItLabel: "Nouveau post-it",
    inputPlaceholder: "Saisir une idée… (Ctrl+Entrée pour ajouter)",
    columnSelectLabel: "Colonne :",
    addButton: "Ajouter",
    saveButton: "Enregistrer",
    cancelButton: "Annuler",
    editAction: "Modifier",
    deleteAction: "Supprimer",
    moveTo: (columnLabel) => `Déplacer vers ${columnLabel}`,
    emptyColumn: "Aucun post-it",
    backToModule: "← Retour au module Tableau blanc",

    breadcrumbDocumentation: "Documentation",
    documentationTitle: "Documentation — Tableau blanc",
    documentationDescription: "Post-it et zones de texte pour rétrospectives ou ateliers.",
    docIntro:
      "Les modules Blueprint Modular font partie de l'application Next.js. Cette documentation décrit comment fonctionne le module Tableau blanc (post-it, zones de texte), comment l'intégrer (API ou store) et les données attendues.",
    howHeading: "Comment fonctionne le module Tableau blanc",
    howBody:
      "Le module fournit un tableau blanc avec des post-it répartis en colonnes (Bien / À améliorer / Action par défaut). Chaque carte a un auteur et une date. Zone de saisie séparée avec sélecteur de colonne ; Ctrl+Entrée pour ajouter. Actions sur les cartes : modifier, supprimer, déplacer vers une autre colonne. Pas de bpm.panel : conteneur épuré pour occuper l'espace atelier.",
    dataHeading: "Structure des données",
    dataIntro: "Champs de base et optionnels (pour traçabilité et ateliers) :",
    fieldIdContent: "— identifiant et texte du post-it",
    fieldColumn: "— colonne (bien, ameliorer, action ou valeurs paramétrables selon le type d'atelier)",
    fieldAuthorMid: "— objet structuré",
    fieldAuthorEnd: "pour traçabilité",
    fieldCreatedAt: "— date de création (ISO)",
    fieldOrder: "— ordre d'affichage dans la colonne (optionnel)",
    fieldBoardId: "— pour plusieurs tableaux ou sessions (optionnel)",
    connectionsHeading: "Connexions (inter-modules)",
    connectionsIntro: "Le tableau blanc s'intègre avec :",
    connectionItems: [
      { name: "Tâches", description: 'une carte "Action" peut être convertie en tâche (échéance, assignation).' },
      { name: "Workflow", description: "une action du tableau peut déclencher une transition d'état ou une assignation." },
      { name: "Notifications ciblées", description: "notifier les participants lorsqu'un post-it est ajouté ou déplacé." },
    ],
    integrationHeading: "Intégration",
    integrationPage: "Page",
    integrationExpose: ". Exposez GET/POST pour les post-it (ex.",
    integrationEnv: "). Aucune variable d'environnement spécifique.",
    simulatorHeading: "Simulateur",
    simulatorBody:
      "Le simulateur propose 3 colonnes visuelles (Bien, À améliorer, Action) avec post-it de démo (auteur, date), sélecteur de colonne à l'ajout, Ctrl+Entrée pour soumettre, actions au survol (modifier, supprimer, déplacer) et surbrillance du post-it nouvellement ajouté.",
    openSimulatorDoc: "Ouvrir le simulateur Tableau blanc",
  },
  en: {
    moduleName: "Whiteboard",
    columnLabels: { bien: "What went well", ameliorer: "To improve", action: "Action" },
    formatDate: (iso) => {
      const d = new Date(iso);
      const hours = d.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 === 0 ? 12 : hours % 12;
      return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")} ${h12}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
    },

    moduleDescription: "Sticky notes and text areas for retros or workshops. Try it in the Simulator.",
    categoryBadge: "Content & productivity",
    openSimulator: "Open the simulator",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulator",
    aboutHeading: "About",
    aboutBefore: "The ",
    aboutStrong: "Whiteboard",
    aboutAfter:
      " module provides column-based sticky notes (What went well / To improve / Action) for retrospectives or workshops. Author, date, actions (edit, delete, move). Content stored locally or via API.",
    simuIntro: "Preview of the 3 columns. To edit, delete, move and add sticky notes, open the simulator.",
    previewHeading: "Idea zone (3 sticky notes)",
    previewFooter: "New sticky note: input area + column selector + Add button (full simulator).",

    breadcrumbSimulator: "Simulator",
    simulatorTitle: "Simulator — Whiteboard",
    simulatorDescription:
      "Column-based sticky notes (What went well / To improve / Action), with author, date and actions (edit, delete, move).",
    boardHeading: (count) => `Idea zone (${count} sticky ${count === 1 ? "note" : "notes"})`,
    newPostItLabel: "New sticky note",
    inputPlaceholder: "Type an idea… (Ctrl+Enter to add)",
    columnSelectLabel: "Column:",
    addButton: "Add",
    saveButton: "Save",
    cancelButton: "Cancel",
    editAction: "Edit",
    deleteAction: "Delete",
    moveTo: (columnLabel) => `Move to ${columnLabel}`,
    emptyColumn: "No sticky notes",
    backToModule: "← Back to the Whiteboard module",

    breadcrumbDocumentation: "Documentation",
    documentationTitle: "Documentation — Whiteboard",
    documentationDescription: "Sticky notes and text areas for retrospectives or workshops.",
    docIntro:
      "Blueprint Modular modules are part of the Next.js application. This documentation describes how the Whiteboard module works (sticky notes, text areas), how to integrate it (API or store) and the expected data.",
    howHeading: "How the Whiteboard module works",
    howBody:
      "The module provides a whiteboard with sticky notes organized into columns (What went well / To improve / Action by default). Each card has an author and a date. Separate input area with a column selector; Ctrl+Enter to add. Card actions: edit, delete, move to another column. No bpm.panel: a clean container that fills the workshop space.",
    dataHeading: "Data structure",
    dataIntro: "Base and optional fields (for traceability and workshops):",
    fieldIdContent: "— sticky note identifier and text",
    fieldColumn: "— column (bien, ameliorer, action, or configurable values depending on the workshop type)",
    fieldAuthorMid: "— structured object",
    fieldAuthorEnd: "for traceability",
    fieldCreatedAt: "— creation date (ISO)",
    fieldOrder: "— display order within the column (optional)",
    fieldBoardId: "— for multiple boards or sessions (optional)",
    connectionsHeading: "Connections (cross-module)",
    connectionsIntro: "The whiteboard integrates with:",
    connectionItems: [
      { name: "Tasks", description: 'an "Action" card can be converted into a task (due date, assignment).' },
      { name: "Workflow", description: "a board action can trigger a state transition or an assignment." },
      { name: "Targeted notifications", description: "notify participants when a sticky note is added or moved." },
    ],
    integrationHeading: "Integration",
    integrationPage: "Page",
    integrationExpose: ". Expose GET/POST endpoints for sticky notes (e.g.",
    integrationEnv: "). No specific environment variables.",
    simulatorHeading: "Simulator",
    simulatorBody:
      "The simulator offers 3 visual columns (What went well, To improve, Action) with demo sticky notes (author, date), a column selector when adding, Ctrl+Enter to submit, hover actions (edit, delete, move) and a highlight on the newly added sticky note.",
    openSimulatorDoc: "Open the Whiteboard simulator",
  },
};
