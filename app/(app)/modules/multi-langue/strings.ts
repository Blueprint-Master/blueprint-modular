/**
 * Chaînes bilingues du CHROME du module Multi-langue (titres, onglets,
 * panneaux, toasts, documentation), pilotées par la locale globale
 * (`useI18n()` de `@/lib/i18n/LocaleProvider`).
 *
 * NE CONCERNE PAS la mini-application de démonstration : celle-ci possède
 * son propre sélecteur FR/EN/ES et ses propres dictionnaires (voir
 * `simulateur-content.tsx`), indépendants de la locale globale.
 */

const fr = {
  // ----- Chrome commun -----
  breadcrumbModules: "Modules",
  moduleTitle: "Multi-langue",
  openSimulator: "Ouvrir le simulateur",

  // ----- Page module (page.tsx) -----
  pageDescription:
    "Dictionnaires FR/EN/ES, interpolation, pluriels, formats par locale et repli sur la langue de référence. Basculez la langue d'une mini-application et complétez les traductions manquantes dans le Simulateur.",
  categoryBadge: "Intégrations & technique",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",

  // Onglet Documentation
  aboutTitle: "À propos",
  about1:
    "Le module Multi-langue fournit un système i18n complet : dictionnaires de traduction par langue (FR, EN, ES), interpolation de variables ({prenom}), pluriels via ",
  about2: ", formats de dates et de montants par locale (",
  about3:
    ") et repli automatique sur la langue de référence quand une clé manque. Le Simulateur applique tout cela à une mini-application de suivi des commandes : on bascule la langue et chaque texte, montant et date se retraduit instantanément.",
  componentsTitle: "Composants utilisés",
  comp1: " (langues, clés, couverture ES), ",
  comp2: " (couverture par langue), ",
  comp3: " (commandes traduites avec ",
  comp4: ", dictionnaire des clés), ",
  comp5: " (clés manquantes), ",
  comp6: " (éditeur de traduction) et ",
  settingsTitle: "Paramétrage",
  settings1:
    "Le simulateur fonctionne entièrement en local : dictionnaires seedés, traductions ajoutées en état React, choix de langue persisté en localStorage. En production, charger les dictionnaires depuis votre backend ou des fichiers JSON par locale. Voir la ",
  settingsDocLink: "documentation",
  settings2:
    " pour la structure des dictionnaires, l'interpolation, les pluriels et le repli.",

  // ----- Page simulateur (simulateur/page.tsx) -----
  breadcrumbSimulator: "Simulateur",
  simPageTitle: "Simulateur — Multi-langue",
  simPageDescription:
    "Une mini-application « Suivi des commandes » traduite en FR/EN/ES : basculez la langue (titres, navigation, statuts, montants et dates se reformatent par locale), observez le repli sur le français pour les 3 clés espagnoles manquantes, puis complétez-les avec l'éditeur de traduction — la couverture et l'aperçu se mettent à jour en direct. Le choix de langue est mémorisé en local.",

  // ----- Chrome du simulateur (simulateur-content.tsx) -----
  metricLanguages: "Langues",
  metricKeys: "Clés de traduction",
  metricEsCoverage: "Couverture ES",

  panelDemoLanguage: "Langue de la démo",
  demoHelp:
    "La démo ci-dessous a son propre sélecteur de langue, indépendant de la langue de l'interface.",
  panelDemoLanguageBody:
    "Basculez la langue : tous les textes, montants et dates de l'aperçu ci-dessous sont retraduits et reformatés. Le choix est mémorisé en local (localStorage).",
  missingEsPreview: (n: number) =>
    `${n} clé${n > 1 ? "s" : ""} manquante${n > 1 ? "s" : ""} en espagnol — repli sur le français (langue de référence). Les textes repliés sont soulignés en pointillé dans l'aperçu.`,

  panelPreview: "Aperçu — Suivi des commandes",

  panelCoverage: "Couverture des traductions",
  coverageWarning: (n: number) =>
    `${n} clé${n > 1 ? "s" : ""} manquante${n > 1 ? "s" : ""} en espagnol — repli sur le français. Complétez les traductions ci-dessous : l'aperçu se met à jour immédiatement.`,
  coverageSuccess:
    "Toutes les clés sont traduites dans les trois langues — plus aucun repli nécessaire.",
  progressFr: "Français (référence)",
  progressEn: "English",
  progressEs: "Español",
  missingKeysHeading: "Clés manquantes en espagnol",

  panelDictionary: "Dictionnaire complet (clé, FR, EN, ES)",
  dict1: "Les valeurs utilisent ",
  dict2: " pour l'interpolation et ",
  dict3:
    " pour le pluriel. Cliquez sur « Traduire » pour compléter une clé espagnole manquante.",

  colKey: "Clé",
  colFrReference: "FR (référence)",
  colEn: "EN",
  colEs: "ES",
  badgeMissing: "Manquante",
  btnTranslate: "Traduire",

  toastSource: "Multi-langue",
  toastLocaleChangedTitle: "Langue changée",
  toastLocaleChanged: (label: string) =>
    `Aperçu basculé en ${label} — choix mémorisé pour vos prochaines visites.`,
  toastTranslationAddedTitle: "Traduction ajoutée",
  toastTranslationAdded: (key: string, value: string, pct: number) =>
    `« ${key} » traduite en espagnol (« ${value} »). Couverture ES : ${pct} %.`,
  toastDemoActionTitle: "Action de démonstration",
  toastDemoAction: (action: string, intl: string) =>
    `La mini-application a exécuté « ${action} » (locale ${intl}).`,

  editorEmptyError: "Saisissez la traduction espagnole avant de valider.",
  modalTitle: (key: string) => `Traduire « ${key} » en espagnol`,
  inputLabel: "Traduction espagnole",
  inputPlaceholder: "Saisir la traduction…",
  editorHint:
    "Conservez les variables telles quelles ({prenom}, {count}) et le séparateur de pluriel « | » si la clé en contient.",
  btnCancel: "Annuler",
  btnAddTranslation: "Ajouter la traduction",

  fallbackTooltip: (key: string, langName: string) =>
    `Clé « ${key} » manquante en ${langName} — valeur de repli (français)`,
  demoLocaleNames: { fr: "français", en: "anglais", es: "espagnol" } as Record<
    "fr" | "en" | "es",
    string
  >,

  // ----- Page documentation (documentation/page.tsx) -----
  breadcrumbDocumentation: "Documentation",
  docPageTitle: "Documentation — Multi-langue",
  docPageDescription:
    "Structure des dictionnaires, interpolation de variables, pluriels, formats de dates et de nombres par locale, et stratégie de repli sur la langue de référence.",

  structureTitle: "Structure des dictionnaires",
  structure1: "Un dictionnaire par langue, à clés plates et hiérarchiques (",
  structure2: "). Le français est la ",
  structureRefLang: "langue de référence",
  structure3:
    " : il doit être complet ; les autres langues peuvent être partielles, le repli comble les trous. Les clés couvrent l'UI (titres, navigation, colonnes), les statuts métier, les actions et les messages.",

  interpolationTitle: "Interpolation",
  interp1:
    "Les valeurs peuvent contenir des variables entre accolades, remplacées au rendu : ",
  interp2:
    " donne « Bonjour, Camille » en FR et « Welcome, Camille » en EN. Les variables doivent être conservées telles quelles dans chaque langue (l'ordre des mots peut changer, pas le nom de la variable).",

  pluralsTitle: "Pluriels",
  plural1: "Les clés plurielles stockent les formes ",
  plural2: " séparées par « | ». La forme est choisie par ",
  plural3:
    " — ce qui gère correctement les règles de chaque langue (en français, 0 et 1 sont au singulier ; en anglais et en espagnol, seul 1 l'est). ",
  plural4: " est ensuite formaté avec ",

  formatsTitle: "Formats de dates et de nombres par locale",
  formats1: "Les montants et les dates ne sont jamais traduits : ils sont ",
  formatsStrong: "formatés",
  formats2: " par les API ",
  formats3:
    " avec la locale active. Le même montant 1234.56 € et la même date ISO donnent :",

  fallbackSectionTitle: "Repli (fallback) sur la langue de référence",
  fallbackItems: [
    {
      term: "Résolution",
      text: " — la clé est cherchée dans la langue active ; si absente, la valeur française est utilisée ; si la clé n'existe nulle part, la clé brute est affichée (jamais de texte vide).",
    },
    {
      term: "Signalement",
      text: " — les valeurs repliées sont soulignées en pointillé dans l'aperçu et listées dans le panneau « Couverture des traductions » avec une barre de progression par langue.",
    },
    {
      term: "Correction",
      text: " — chaque clé manquante propose un bouton « Traduire » qui ouvre l'éditeur ; la traduction ajoutée est immédiatement visible dans l'aperçu et fait monter la couverture.",
    },
    {
      term: "Persistance",
      text: " — le choix de langue est mémorisé en localStorage et relu au montage (rendu initial en français pour rester compatible SSR).",
    },
  ] as { term: string; text: string }[],

  productionTitle: "Intégration en production",
  prod1:
    "Le simulateur fonctionne en local (dictionnaires seedés, état React). En production : stocker les dictionnaires en base ou en fichiers JSON par locale, exposer la couverture par langue dans un back-office de traduction, et négocier la langue initiale via ",
  prod2:
    " ou le profil utilisateur — en conservant la même résolution clé → langue active → langue de référence.",
};

const en: typeof fr = {
  // ----- Shared chrome -----
  breadcrumbModules: "Modules",
  moduleTitle: "Multi-language",
  openSimulator: "Open the simulator",

  // ----- Module page (page.tsx) -----
  pageDescription:
    "FR/EN/ES dictionaries, interpolation, plurals, locale-aware formatting and fallback to the reference language. Switch a mini-app's language and fill in the missing translations in the Simulator.",
  categoryBadge: "Integrations & engineering",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",

  // Documentation tab
  aboutTitle: "About",
  about1:
    "The Multi-language module provides a complete i18n system: per-language translation dictionaries (FR, EN, ES), variable interpolation ({prenom}), plurals via ",
  about2: ", locale-aware date and amount formats (",
  about3:
    ") and automatic fallback to the reference language when a key is missing. The Simulator applies all of this to a small order-tracking app: switch the language and every text, amount and date is instantly retranslated.",
  componentsTitle: "Components used",
  comp1: " (languages, keys, ES coverage), ",
  comp2: " (coverage per language), ",
  comp3: " (translated orders with ",
  comp4: ", key dictionary), ",
  comp5: " (missing keys), ",
  comp6: " (translation editor) and ",
  settingsTitle: "Configuration",
  settings1:
    "The simulator runs entirely locally: seeded dictionaries, translations added to React state, language choice persisted in localStorage. In production, load the dictionaries from your backend or from per-locale JSON files. See the ",
  settingsDocLink: "documentation",
  settings2:
    " for the dictionary structure, interpolation, plurals and fallback.",

  // ----- Simulator page (simulateur/page.tsx) -----
  breadcrumbSimulator: "Simulator",
  simPageTitle: "Simulator — Multi-language",
  simPageDescription:
    "A small “Order tracking” app translated into FR/EN/ES: switch the language (titles, navigation, statuses, amounts and dates are reformatted per locale), watch the French fallback kick in for the 3 missing Spanish keys, then fill them in with the translation editor — coverage and the preview update live. The language choice is saved locally.",

  // ----- Simulator chrome (simulateur-content.tsx) -----
  metricLanguages: "Languages",
  metricKeys: "Translation keys",
  metricEsCoverage: "ES coverage",

  panelDemoLanguage: "Demo language",
  demoHelp:
    "The demo below has its own language selector, independent of the UI language.",
  panelDemoLanguageBody:
    "Switch the language: every text, amount and date in the preview below is retranslated and reformatted. The choice is saved locally (localStorage).",
  missingEsPreview: (n: number) =>
    `${n} key${n > 1 ? "s" : ""} missing in Spanish — falling back to French (the reference language). Fallback text is shown with a dotted underline in the preview.`,

  panelPreview: "Preview — Order tracking",

  panelCoverage: "Translation coverage",
  coverageWarning: (n: number) =>
    `${n} key${n > 1 ? "s" : ""} missing in Spanish — falling back to French. Fill in the translations below: the preview updates immediately.`,
  coverageSuccess:
    "Every key is translated in all three languages — no fallback needed anymore.",
  progressFr: "French (reference)",
  progressEn: "English",
  progressEs: "Spanish",
  missingKeysHeading: "Keys missing in Spanish",

  panelDictionary: "Full dictionary (key, FR, EN, ES)",
  dict1: "Values use ",
  dict2: " for interpolation and ",
  dict3:
    " for plurals. Click “Translate” to fill in a missing Spanish key.",

  colKey: "Key",
  colFrReference: "FR (reference)",
  colEn: "EN",
  colEs: "ES",
  badgeMissing: "Missing",
  btnTranslate: "Translate",

  toastSource: "Multi-language",
  toastLocaleChangedTitle: "Language changed",
  toastLocaleChanged: (label: string) =>
    `Preview switched to ${label} — your choice is saved for future visits.`,
  toastTranslationAddedTitle: "Translation added",
  toastTranslationAdded: (key: string, value: string, pct: number) =>
    `“${key}” translated into Spanish (“${value}”). ES coverage: ${pct}%.`,
  toastDemoActionTitle: "Demo action",
  toastDemoAction: (action: string, intl: string) =>
    `The mini-app ran “${action}” (locale ${intl}).`,

  editorEmptyError: "Enter the Spanish translation before saving.",
  modalTitle: (key: string) => `Translate “${key}” into Spanish`,
  inputLabel: "Spanish translation",
  inputPlaceholder: "Enter the translation…",
  editorHint:
    "Keep variables exactly as they are ({prenom}, {count}) and the plural separator “|” if the key contains them.",
  btnCancel: "Cancel",
  btnAddTranslation: "Add translation",

  fallbackTooltip: (key: string, langName: string) =>
    `Key “${key}” missing in ${langName} — fallback value (French)`,
  demoLocaleNames: { fr: "French", en: "English", es: "Spanish" } as Record<
    "fr" | "en" | "es",
    string
  >,

  // ----- Documentation page (documentation/page.tsx) -----
  breadcrumbDocumentation: "Documentation",
  docPageTitle: "Documentation — Multi-language",
  docPageDescription:
    "Dictionary structure, variable interpolation, plurals, locale-aware date and number formats, and the fallback strategy to the reference language.",

  structureTitle: "Dictionary structure",
  structure1: "One dictionary per language, with flat hierarchical keys (",
  structure2: "). French is the ",
  structureRefLang: "reference language",
  structure3:
    ": it must be complete; the other languages may be partial, fallback fills the gaps. The keys cover the UI (titles, navigation, columns), business statuses, actions and messages.",

  interpolationTitle: "Interpolation",
  interp1:
    "Values can contain variables in curly braces, replaced at render time: ",
  interp2:
    " yields “Bonjour, Camille” in FR and “Welcome, Camille” in EN. Variables must be kept exactly as they are in every language (word order may change, the variable name may not).",

  pluralsTitle: "Plurals",
  plural1: "Plural keys store the ",
  plural2: " forms separated by “|”. The form is picked by ",
  plural3:
    " — which correctly handles each language's rules (in French, 0 and 1 are singular; in English and Spanish, only 1 is). ",
  plural4: " is then formatted with ",

  formatsTitle: "Locale-aware date and number formats",
  formats1: "Amounts and dates are never translated: they are ",
  formatsStrong: "formatted",
  formats2: " by the ",
  formats3:
    " APIs using the active locale. The same €1234.56 amount and the same ISO date give:",

  fallbackSectionTitle: "Fallback to the reference language",
  fallbackItems: [
    {
      term: "Resolution",
      text: " — the key is looked up in the active language; if absent, the French value is used; if the key exists nowhere, the raw key is displayed (never empty text).",
    },
    {
      term: "Highlighting",
      text: " — fallback values are shown with a dotted underline in the preview and listed in the “Translation coverage” panel with a progress bar per language.",
    },
    {
      term: "Fixing",
      text: " — every missing key offers a “Translate” button that opens the editor; the added translation is immediately visible in the preview and raises the coverage.",
    },
    {
      term: "Persistence",
      text: " — the language choice is saved in localStorage and read back on mount (initial render in French to stay SSR-compatible).",
    },
  ] as { term: string; text: string }[],

  productionTitle: "Production integration",
  prod1:
    "The simulator runs locally (seeded dictionaries, React state). In production: store the dictionaries in a database or in per-locale JSON files, expose per-language coverage in a translation back office, and negotiate the initial language via ",
  prod2:
    " or the user profile — while keeping the same key → active language → reference language resolution.",
};

export const STR = { fr, en } as const;
