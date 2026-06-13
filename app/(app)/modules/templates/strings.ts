import type { Locale } from "@/lib/i18n";

export type TemplateField = {
  key: string;
  label: string;
  placeholder: string;
};

export type TemplateFieldDetailed = TemplateField & {
  type: string;
};

export type TemplateOption = {
  value: string;
  label: string;
};

type TemplatesStrings = {
  // Shared
  moduleName: string;
  breadcrumbModules: string;
  templateOptions: TemplateOption[];
  /** Fields shown in the embedded simulator tab (page.tsx). */
  overviewFields: Record<string, TemplateField[]>;
  /** Fields shown on the standalone simulator page (with input type). */
  simulatorFields: Record<string, TemplateFieldDetailed[]>;
  selectboxLabel: string;
  selectboxPlaceholder: string;
  documentNameLabel: string;
  documentNamePlaceholder: string;
  validationError: string;
  createButton: string;
  toastTitle: string;
  toastCreated: (documentName: string, templateLabel: string) => string;

  // Module page (page.tsx)
  moduleDescription: string;
  categoryBadge: string;
  openSimulator: string;
  tabDocumentation: string;
  tabSimulator: string;
  aboutHeading: string;
  aboutBefore: string;
  aboutStrong: string;
  aboutAfter: string;
  simuHeading: string;
  emptyStateShort: string;

  // Simulator page (simulateur/page.tsx)
  breadcrumbSimulator: string;
  simulatorTitle: string;
  simulatorDescription: string;
  step1: string;
  step2: string;
  emptyStateLong: string;
  backToModule: string;

  // Documentation page (documentation/page.tsx)
  breadcrumbDocumentation: string;
  documentationTitle: string;
  documentationDescription: string;
  docAbout: string;
  structHeading: string;
  structIntro: string;
  structOutputNote: string;
  structFieldsNote: string;
  structBodyPrefix: string;
  structBodySuffix: string;
  structSeeAudit: string;
};

export const STR: Record<Locale, TemplatesStrings> = {
  fr: {
    moduleName: "Templates",
    breadcrumbModules: "Modules",
    templateOptions: [
      { value: "rapport", label: "Rapport mensuel" },
      { value: "fiche", label: "Fiche projet" },
      { value: "email", label: "Email type" },
    ],
    overviewFields: {
      rapport: [
        { key: "periode", label: "Période", placeholder: "Ex. Mars 2025" },
        { key: "responsable", label: "Responsable", placeholder: "Nom" },
        { key: "ca_realise", label: "CA réalisé (€)", placeholder: "0" },
      ],
      fiche: [
        { key: "projet", label: "Nom du projet", placeholder: "Ex. Refonte site" },
        { key: "chef", label: "Chef de projet", placeholder: "Nom" },
        { key: "date_limite", label: "Date limite", placeholder: "JJ/MM/AAAA" },
      ],
      email: [
        { key: "destinataire", label: "Destinataire", placeholder: "email@exemple.com" },
        { key: "objet", label: "Objet", placeholder: "Objet" },
        { key: "corps", label: "Message", placeholder: "Contenu..." },
      ],
    },
    simulatorFields: {
      rapport: [
        { key: "periode", label: "Période", type: "text", placeholder: "Ex. Mars 2025" },
        { key: "responsable", label: "Responsable", type: "text", placeholder: "Nom du responsable" },
        { key: "ca_realise", label: "CA réalisé (€)", type: "number", placeholder: "0" },
      ],
      fiche: [
        { key: "projet", label: "Nom du projet", type: "text", placeholder: "Ex. Refonte site" },
        { key: "chef", label: "Chef de projet", type: "text", placeholder: "Nom" },
        { key: "date_limite", label: "Date limite", type: "text", placeholder: "JJ/MM/AAAA" },
      ],
      email: [
        { key: "destinataire", label: "Destinataire", type: "text", placeholder: "email@exemple.com" },
        { key: "objet", label: "Objet", type: "text", placeholder: "Objet du message" },
        { key: "corps", label: "Message", type: "text", placeholder: "Contenu..." },
      ],
    },
    selectboxLabel: "Modèle",
    selectboxPlaceholder: "Choisir un modèle...",
    documentNameLabel: "Nom du document",
    documentNamePlaceholder: "Ex. Rapport mars 2025",
    validationError: "Veuillez sélectionner un modèle et saisir un nom de document.",
    createButton: "Créer à partir du modèle",
    toastTitle: "Création réussie",
    toastCreated: (documentName, templateLabel) =>
      `Document « ${documentName} » créé à partir du modèle « ${templateLabel} ».`,

    moduleDescription: "Bibliothèque de modèles (rapports, fiches, emails) avec champs à remplir.",
    categoryBadge: "Contenu & productivité",
    openSimulator: "Ouvrir le simulateur",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulateur",
    aboutHeading: "À propos",
    aboutBefore: "Le module",
    aboutStrong: "Templates",
    aboutAfter:
      "propose une bibliothèque de modèles (rapports, fiches, emails) avec champs à remplir. Création de documents à partir d'un modèle.",
    simuHeading: "Choisir un modèle (démo)",
    emptyStateShort: "Sélectionnez un modèle pour afficher les champs.",

    breadcrumbSimulator: "Simulateur",
    simulatorTitle: "Simulateur — Templates",
    simulatorDescription: "Choisir un modèle et remplir les champs (démo).",
    step1: "Étape 1 — Choisir un modèle",
    step2: "Étape 2 — Remplir les champs",
    emptyStateLong: "Sélectionnez un modèle pour afficher les champs à remplir et créer un document.",
    backToModule: "← Retour au module Templates",

    breadcrumbDocumentation: "Documentation",
    documentationTitle: "Documentation — Templates",
    documentationDescription: "Bibliothèque de modèles avec champs à remplir.",
    docAbout:
      "Modèles prédéfinis (rapports, fiches, emails). L'utilisateur choisit un modèle puis remplit les champs ; le document est généré (PDF, HTML ou enregistré en base).",
    structHeading: "Structure d'un modèle (à documenter)",
    structIntro: "Un modèle peut exposer :",
    structOutputNote: "(pdf | html | base)",
    structFieldsNote: "(liste de champs avec key, label, type, required)",
    structBodyPrefix: "(contenu avec placeholders ",
    structBodySuffix: ")",
    structSeeAudit: "Voir l'audit du module pour la structure complète proposée.",
  },
  en: {
    moduleName: "Templates",
    breadcrumbModules: "Modules",
    templateOptions: [
      { value: "rapport", label: "Monthly report" },
      { value: "fiche", label: "Project sheet" },
      { value: "email", label: "Email template" },
    ],
    overviewFields: {
      rapport: [
        { key: "periode", label: "Period", placeholder: "e.g. March 2025" },
        { key: "responsable", label: "Owner", placeholder: "Name" },
        { key: "ca_realise", label: "Actual revenue (€)", placeholder: "0" },
      ],
      fiche: [
        { key: "projet", label: "Project name", placeholder: "e.g. Website redesign" },
        { key: "chef", label: "Project lead", placeholder: "Name" },
        { key: "date_limite", label: "Deadline", placeholder: "DD/MM/YYYY" },
      ],
      email: [
        { key: "destinataire", label: "Recipient", placeholder: "email@example.com" },
        { key: "objet", label: "Subject", placeholder: "Subject" },
        { key: "corps", label: "Message", placeholder: "Content..." },
      ],
    },
    simulatorFields: {
      rapport: [
        { key: "periode", label: "Period", type: "text", placeholder: "e.g. March 2025" },
        { key: "responsable", label: "Owner", type: "text", placeholder: "Owner name" },
        { key: "ca_realise", label: "Actual revenue (€)", type: "number", placeholder: "0" },
      ],
      fiche: [
        { key: "projet", label: "Project name", type: "text", placeholder: "e.g. Website redesign" },
        { key: "chef", label: "Project lead", type: "text", placeholder: "Name" },
        { key: "date_limite", label: "Deadline", type: "text", placeholder: "DD/MM/YYYY" },
      ],
      email: [
        { key: "destinataire", label: "Recipient", type: "text", placeholder: "email@example.com" },
        { key: "objet", label: "Subject", type: "text", placeholder: "Message subject" },
        { key: "corps", label: "Message", type: "text", placeholder: "Content..." },
      ],
    },
    selectboxLabel: "Template",
    selectboxPlaceholder: "Choose a template...",
    documentNameLabel: "Document name",
    documentNamePlaceholder: "e.g. March 2025 report",
    validationError: "Please select a template and enter a document name.",
    createButton: "Create from template",
    toastTitle: "Created successfully",
    toastCreated: (documentName, templateLabel) =>
      `Document “${documentName}” created from template “${templateLabel}”.`,

    moduleDescription: "A library of templates (reports, sheets, emails) with fields to fill in.",
    categoryBadge: "Content & productivity",
    openSimulator: "Open the simulator",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulator",
    aboutHeading: "About",
    aboutBefore: "The",
    aboutStrong: "Templates",
    aboutAfter:
      "module provides a library of templates (reports, sheets, emails) with fields to fill in. Create documents from a template.",
    simuHeading: "Choose a template (demo)",
    emptyStateShort: "Select a template to display its fields.",

    breadcrumbSimulator: "Simulator",
    simulatorTitle: "Simulator — Templates",
    simulatorDescription: "Choose a template and fill in the fields (demo).",
    step1: "Step 1 — Choose a template",
    step2: "Step 2 — Fill in the fields",
    emptyStateLong: "Select a template to display the fields to fill in and create a document.",
    backToModule: "← Back to the Templates module",

    breadcrumbDocumentation: "Documentation",
    documentationTitle: "Documentation — Templates",
    documentationDescription: "A library of templates with fields to fill in.",
    docAbout:
      "Predefined templates (reports, sheets, emails). The user picks a template and fills in the fields; the document is generated (PDF, HTML, or saved to the database).",
    structHeading: "Template structure (to be documented)",
    structIntro: "A template can expose:",
    structOutputNote: "(pdf | html | base)",
    structFieldsNote: "(list of fields with key, label, type, required)",
    structBodyPrefix: "(content with ",
    structBodySuffix: " placeholders)",
    structSeeAudit: "See the module audit for the full proposed structure.",
  },
};
