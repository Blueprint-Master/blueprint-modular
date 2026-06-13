import { createElement, Fragment, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* Texte localisé : utilisé par le schéma de formulaire pour que les   */
/* labels affichés soient bilingues sans toucher aux ids/valeurs       */
/* techniques (visibleIf opère sur les valeurs, jamais sur les labels).*/
/* ------------------------------------------------------------------ */

export interface LocalizedText {
  fr: string;
  en: string;
}

/** Raccourci pour déclarer un texte bilingue dans le schéma. */
export function L(fr: string, en: string): LocalizedText {
  return { fr, en };
}

/** Résout un texte bilingue selon la locale active. */
export function lt(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

/**
 * Rend une chaîne de dictionnaire dont les segments entre accents
 * graves (`...`) deviennent des éléments <code>.
 */
export function rich(text: string): ReactNode {
  const parts = text.split("`");
  return createElement(
    Fragment,
    null,
    ...parts.map((part, i) => (i % 2 === 1 ? createElement("code", { key: i }, part) : part))
  );
}

/* ------------------------------------------------------------------ */
/* Dictionnaires FR / EN du module (parité de clés garantie par type). */
/* ------------------------------------------------------------------ */

const fr = {
  /* --- Commun --- */
  moduleName: "Formulaire dynamique",
  openSimulator: "Ouvrir le simulateur",

  /* --- Page module --- */
  module: {
    title: "Formulaire dynamique",
    description:
      "Moteur de formulaires conditionnels piloté par un schéma JSON : les champs, les règles de visibilité et la validation changent selon le type de demande. Testez les trois formulaires du guichet interne dans le Simulateur.",
    badgeCategory: "Métier",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulateur",
    aboutHeading: "À propos",
    aboutBody:
      "Le module Formulaire dynamique est un moteur de formulaires conditionnels piloté par un schéma JSON. Le cas métier : un guichet de demandes internes (congés, achat de matériel, accès applicatif) où les champs affichés dépendent du type de demande et des réponses déjà saisies. Le formulaire n'est pas codé en dur : un renderer générique parcourt le schéma, mappe chaque `fieldType` vers un composant bpm et applique les règles `visibleIf` en direct — un congé « sans solde » fait apparaître une justification requise, un achat de plus de 1 000 € exige une validation directeur, un profil admin impose un motif et une durée limitée.",
    componentsHeading: "Composants utilisés",
    componentsBody:
      "`bpm.selectbox`, `bpm.input`, `bpm.textarea`, `bpm.checkbox`, `bpm.radioGroup` et `bpm.dateInput` pour les champs ; `bpm.message` pour les avertissements conditionnels ; `bpm.panel` + `bpm.labelValue` pour le récapitulatif ; `bpm.table` + `bpm.badge` pour les demandes soumises ; `bpm.jsonViewer` pour le schéma ; `bpm.metricRow` et `bpm.toast` pour le suivi.",
    settingsHeading: "Paramétrage",
    settingsBodyBefore:
      "Le simulateur fonctionne entièrement en local : trois schémas seedés, validation par champ et tableau des demandes en état React. En production, les schémas sont servis par une API et versionnés ; le renderer reste identique. Voir la ",
    settingsDocLink: "documentation",
    settingsBodyAfter:
      " pour la spécification complète du schéma (types de champs, conditions, validation).",
  },

  /* --- Page simulateur --- */
  simulatorPage: {
    breadcrumbCurrent: "Simulateur",
    title: "Simulateur — Formulaire dynamique",
    description:
      "Guichet de demandes internes : choisissez un type (congés, achat de matériel, accès applicatif), les champs sont générés depuis le schéma JSON affiché à droite. Les règles conditionnelles s'appliquent en direct — congé sans solde, achat > 1 000 € ou profil admin font apparaître des champs requis supplémentaires. Soumettez : validation par champ, récapitulatif et ajout au tableau des demandes.",
  },

  /* --- Page documentation --- */
  doc: {
    breadcrumbCurrent: "Documentation",
    title: "Documentation — Formulaire dynamique",
    description:
      "Spécification du schéma de formulaire : types de champs, conditions de visibilité `visibleIf` et règles de validation appliquées par le renderer générique.",
    principleHeading: "Principe",
    principleBody:
      "Un formulaire n'est jamais codé en dur : il est décrit par un schéma JSON. Le renderer parcourt `fields`, mappe chaque `type` vers le composant bpm correspondant, évalue les conditions `visibleIf` à chaque saisie et n'exige un champ requis que s'il est visible. Ajouter un champ ou une règle métier revient à modifier le schéma — pas le code.",
    fieldTypesHeading: "Types de champs",
    fieldTypes: [
      "`text` — saisie libre (`bpm.input`).",
      "`number` — valeur numérique, ex. montant estimé (`bpm.input type=\"number\"`).",
      "`date` — sélecteur de date au format FR (`bpm.dateInput`).",
      "`select` — liste déroulante avec `options` (`bpm.selectbox`).",
      "`radio` — choix exclusif court, ex. profil lecture/écriture/admin (`bpm.radioGroup`).",
      "`checkbox` — choix binaire, ex. demi-journée (`bpm.checkbox`).",
      "`textarea` — texte long : commentaire, justification, motif (`bpm.textarea`).",
    ],
    conditionsHeading: "Conditions",
    conditionsIntro:
      "Une condition observe un autre champ du même formulaire et se réévalue à chaque saisie. Deux opérateurs sont supportés :",
    conditionEquals:
      "`equals` — égalité stricte. Ex. la justification n'apparaît que si `type_conge = \"sans_solde\"` ; motif et durée que si `profil = \"admin\"`.",
    conditionGreaterThan:
      "`greaterThan` — comparaison numérique. Ex. la validation directeur apparaît si `montant > 1000`.",
    conditionsMessages:
      "Les mêmes conditions pilotent les `messages` : des bandeaux `bpm.message` (info, warning) affichés en contexte, par exemple l'avertissement de seuil d'achat.",
    validationHeading: "Validation",
    validationRules: [
      {
        lead: "Requis conditionnel",
        text: "`required: true` ne s'applique que si le champ est visible : un champ masqué n'est jamais bloquant.",
      },
      {
        lead: "Format numérique",
        text: "un champ `number` doit contenir un nombre positif.",
      },
      {
        lead: "Contrôle croisé",
        text: "`dateRange` vérifie que la date de fin suit la date de début.",
      },
      {
        lead: "Restitution",
        text: "chaque erreur s'affiche sous le champ concerné ; la soumission n'aboutit qu'à zéro erreur, puis produit un récapitulatif et une entrée dans « Demandes soumises ».",
      },
    ],
    exampleHeading: "Exemple complet — schéma « Achat de matériel »",
    exampleJson: `{
  "id": "achat-materiel",
  "title": "Achat de matériel",
  "fields": [
    {
      "id": "categorie",
      "label": "Catégorie",
      "type": "select",
      "required": true,
      "options": [
        { "value": "informatique", "label": "Informatique" },
        { "value": "mobilier", "label": "Mobilier" },
        { "value": "logiciel", "label": "Logiciel" }
      ]
    },
    {
      "id": "montant",
      "label": "Montant estimé (€ HT)",
      "type": "number",
      "required": true
    },
    {
      "id": "description",
      "label": "Description du besoin",
      "type": "textarea",
      "required": true
    },
    {
      "id": "validation_directeur",
      "label": "Validation directeur (montant > 1 000 €)",
      "type": "select",
      "required": true,
      "options": [
        { "value": "c.moreau", "label": "C. Moreau — Directeur des opérations" },
        { "value": "a.petit", "label": "A. Petit — Directrice financière" }
      ],
      "visibleIf": { "field": "montant", "operator": "greaterThan", "value": 1000 }
    }
  ],
  "messages": [
    {
      "id": "msg-seuil",
      "type": "warning",
      "text": "Montant supérieur à 1 000 € HT : validation directeur obligatoire.",
      "visibleIf": { "field": "montant", "operator": "greaterThan", "value": 1000 }
    }
  ]
}`,
    productionHeading: "Intégration en production",
    productionBody:
      "Le simulateur embarque trois schémas seedés en état local. En production, servir les schémas depuis une API (table `form_schemas` versionnée), conserver le même renderer côté client, et persister chaque soumission validée (l'équivalent du tableau « Demandes soumises ») avec son statut de circuit d'approbation.",
  },

  /* --- Simulateur --- */
  sim: {
    metricFormTypes: "Types de formulaires",
    metricSubmitted: "Demandes soumises",
    metricConditionalFields: "Champs conditionnels",
    newRequestPanel: "Nouvelle demande interne",
    requestTypeLabel: "Type de demande",
    requestTypePlaceholder: "Choisir le type de demande",
    selectTypeHint:
      "Sélectionnez un type de demande : les champs du formulaire sont générés à partir du schéma JSON correspondant (visible dans le panneau de droite).",
    requiredNote: "* champs requis — la liste des champs requis évolue selon vos réponses.",
    submitButton: "Soumettre la demande",
    selectPlaceholderDefault: "Sélectionner…",
    recapPanelTitle: (formTitle: string) => `Récapitulatif — ${formTitle}`,
    recapSaved: "Demande enregistrée et ajoutée au tableau « Demandes soumises ».",
    submittedPanel: "Demandes soumises",
    columnType: "Type de demande",
    columnRequester: "Demandeur",
    columnDate: "Date",
    columnStatus: "Statut",
    status: {
      approved: "Approuvée",
      in_review: "En cours d'examen",
      submitted: "Soumise",
    },
    you: "Vous",
    yes: "Oui",
    no: "Non",
    schemaPanel: "Schéma JSON",
    schemaIntro: (formTitle: string) =>
      `Définition pilotant le formulaire « ${formTitle} » : chaque champ déclare son type, son caractère requis et, le cas échéant, sa condition \`visibleIf\`.`,
    schemaEmpty: "Choisissez un type de demande pour afficher son schéma.",
    expanderTitle: "Comment lit-on ce schéma ?",
    expanderItems: [
      "`fields[].type` — mappe vers un composant bpm (select, radio, date, textarea…).",
      "`fields[].visibleIf` — le champ n'apparaît (et n'est validé) que si la condition est vraie.",
      "`messages[]` — bandeaux contextuels affichés selon les mêmes conditions.",
    ],
    toastSource: "Formulaire dynamique",
    toastValidationTitle: "Validation échouée",
    toastValidationBody: (count: number) =>
      `${count} champ${count > 1 ? "s" : ""} à corriger avant soumission.`,
    toastSubmittedTitle: "Demande soumise",
    toastSubmittedBody: (formTitle: string) =>
      `Demande « ${formTitle} » soumise au guichet interne.`,
    errorRequired: "Ce champ est requis.",
    errorNumber: "Saisissez un montant valide (nombre positif).",
  },
};

export type ModuleStrings = typeof fr;

const en: ModuleStrings = {
  /* --- Common --- */
  moduleName: "Dynamic form",
  openSimulator: "Open the simulator",

  /* --- Module page --- */
  module: {
    title: "Dynamic form",
    description:
      "Conditional form engine driven by a JSON schema: fields, visibility rules and validation change with the request type. Try the three internal service-desk forms in the Simulator.",
    badgeCategory: "Business",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulator",
    aboutHeading: "About",
    aboutBody:
      "The Dynamic form module is a conditional form engine driven by a JSON schema. The business case: an internal request desk (leave, equipment purchase, application access) where the fields displayed depend on the request type and on the answers already entered. The form is never hard-coded: a generic renderer walks the schema, maps each `fieldType` to a bpm component and applies the `visibleIf` rules live — unpaid leave reveals a required justification, a purchase above €1,000 requires director approval, and an admin profile demands a reason and a limited duration.",
    componentsHeading: "Components used",
    componentsBody:
      "`bpm.selectbox`, `bpm.input`, `bpm.textarea`, `bpm.checkbox`, `bpm.radioGroup` and `bpm.dateInput` for the fields; `bpm.message` for conditional warnings; `bpm.panel` + `bpm.labelValue` for the summary; `bpm.table` + `bpm.badge` for submitted requests; `bpm.jsonViewer` for the schema; `bpm.metricRow` and `bpm.toast` for tracking.",
    settingsHeading: "Configuration",
    settingsBodyBefore:
      "The simulator runs entirely locally: three seeded schemas, per-field validation and a request table held in React state. In production, schemas are served by an API and versioned; the renderer stays the same. See the ",
    settingsDocLink: "documentation",
    settingsBodyAfter:
      " for the full schema specification (field types, conditions, validation).",
  },

  /* --- Simulator page --- */
  simulatorPage: {
    breadcrumbCurrent: "Simulator",
    title: "Simulator — Dynamic form",
    description:
      "Internal request desk: pick a type (leave, equipment purchase, application access) and the fields are generated from the JSON schema shown on the right. Conditional rules apply live — unpaid leave, a purchase above €1,000 or an admin profile reveal additional required fields. Submit to get per-field validation, a summary and a new row in the request table.",
  },

  /* --- Documentation page --- */
  doc: {
    breadcrumbCurrent: "Documentation",
    title: "Documentation — Dynamic form",
    description:
      "Form schema specification: field types, `visibleIf` visibility conditions and validation rules applied by the generic renderer.",
    principleHeading: "How it works",
    principleBody:
      "A form is never hard-coded: it is described by a JSON schema. The renderer walks `fields`, maps each `type` to the matching bpm component, re-evaluates the `visibleIf` conditions on every keystroke and only enforces a required field while it is visible. Adding a field or a business rule means editing the schema — not the code.",
    fieldTypesHeading: "Field types",
    fieldTypes: [
      "`text` — free text input (`bpm.input`).",
      "`number` — numeric value, e.g. estimated amount (`bpm.input type=\"number\"`).",
      "`date` — locale-formatted date picker (`bpm.dateInput`).",
      "`select` — dropdown list with `options` (`bpm.selectbox`).",
      "`radio` — short exclusive choice, e.g. read/write/admin profile (`bpm.radioGroup`).",
      "`checkbox` — binary choice, e.g. half-day (`bpm.checkbox`).",
      "`textarea` — long text: comment, justification, reason (`bpm.textarea`).",
    ],
    conditionsHeading: "Conditions",
    conditionsIntro:
      "A condition watches another field of the same form and is re-evaluated on every change. Two operators are supported:",
    conditionEquals:
      "`equals` — strict equality. E.g. the justification only appears when `type_conge = \"sans_solde\"`; reason and duration only when `profil = \"admin\"`.",
    conditionGreaterThan:
      "`greaterThan` — numeric comparison. E.g. director approval appears when `montant > 1000`.",
    conditionsMessages:
      "The same conditions drive the `messages`: contextual `bpm.message` banners (info, warning) shown in place, such as the purchase threshold warning.",
    validationHeading: "Validation",
    validationRules: [
      {
        lead: "Conditional required",
        text: "`required: true` only applies while the field is visible: a hidden field never blocks submission.",
      },
      {
        lead: "Numeric format",
        text: "a `number` field must contain a positive number.",
      },
      {
        lead: "Cross-field check",
        text: "`dateRange` ensures the end date follows the start date.",
      },
      {
        lead: "Feedback",
        text: "each error is shown under the field concerned; submission only succeeds with zero errors, then produces a summary and a new row in “Submitted requests”.",
      },
    ],
    exampleHeading: "Full example — “Equipment purchase” schema",
    exampleJson: `{
  "id": "achat-materiel",
  "title": "Equipment purchase",
  "fields": [
    {
      "id": "categorie",
      "label": "Category",
      "type": "select",
      "required": true,
      "options": [
        { "value": "informatique", "label": "IT hardware" },
        { "value": "mobilier", "label": "Furniture" },
        { "value": "logiciel", "label": "Software" }
      ]
    },
    {
      "id": "montant",
      "label": "Estimated amount (€ excl. VAT)",
      "type": "number",
      "required": true
    },
    {
      "id": "description",
      "label": "Description of the need",
      "type": "textarea",
      "required": true
    },
    {
      "id": "validation_directeur",
      "label": "Director approval (amount > €1,000)",
      "type": "select",
      "required": true,
      "options": [
        { "value": "c.moreau", "label": "C. Moreau — Director of Operations" },
        { "value": "a.petit", "label": "A. Petit — Chief Financial Officer" }
      ],
      "visibleIf": { "field": "montant", "operator": "greaterThan", "value": 1000 }
    }
  ],
  "messages": [
    {
      "id": "msg-seuil",
      "type": "warning",
      "text": "Amount above €1,000 excl. VAT: director approval is mandatory.",
      "visibleIf": { "field": "montant", "operator": "greaterThan", "value": 1000 }
    }
  ]
}`,
    productionHeading: "Production integration",
    productionBody:
      "The simulator ships three seeded schemas in local state. In production, serve the schemas from an API (a versioned `form_schemas` table), keep the same client-side renderer, and persist every validated submission (the equivalent of the “Submitted requests” table) along with its approval-workflow status.",
  },

  /* --- Simulator --- */
  sim: {
    metricFormTypes: "Form types",
    metricSubmitted: "Submitted requests",
    metricConditionalFields: "Conditional fields",
    newRequestPanel: "New internal request",
    requestTypeLabel: "Request type",
    requestTypePlaceholder: "Choose a request type",
    selectTypeHint:
      "Select a request type: the form fields are generated from the matching JSON schema (shown in the right-hand panel).",
    requiredNote: "* required fields — the list of required fields changes with your answers.",
    submitButton: "Submit request",
    selectPlaceholderDefault: "Select…",
    recapPanelTitle: (formTitle: string) => `Summary — ${formTitle}`,
    recapSaved: "Request saved and added to the “Submitted requests” table.",
    submittedPanel: "Submitted requests",
    columnType: "Request type",
    columnRequester: "Requester",
    columnDate: "Date",
    columnStatus: "Status",
    status: {
      approved: "Approved",
      in_review: "Under review",
      submitted: "Submitted",
    },
    you: "You",
    yes: "Yes",
    no: "No",
    schemaPanel: "JSON schema",
    schemaIntro: (formTitle: string) =>
      `Definition driving the “${formTitle}” form: each field declares its type, whether it is required and, where relevant, its \`visibleIf\` condition.`,
    schemaEmpty: "Choose a request type to display its schema.",
    expanderTitle: "How to read this schema",
    expanderItems: [
      "`fields[].type` — maps to a bpm component (select, radio, date, textarea…).",
      "`fields[].visibleIf` — the field is only rendered (and validated) when the condition holds.",
      "`messages[]` — contextual banners displayed under the same conditions.",
    ],
    toastSource: "Dynamic form",
    toastValidationTitle: "Validation failed",
    toastValidationBody: (count: number) =>
      `${count} field${count > 1 ? "s" : ""} to fix before submitting.`,
    toastSubmittedTitle: "Request submitted",
    toastSubmittedBody: (formTitle: string) =>
      `“${formTitle}” request submitted to the internal desk.`,
    errorRequired: "This field is required.",
    errorNumber: "Enter a valid amount (positive number).",
  },
};

export const STRINGS: Record<Locale, ModuleStrings> = { fr, en };

export function getStrings(locale: Locale): ModuleStrings {
  return STRINGS[locale];
}
