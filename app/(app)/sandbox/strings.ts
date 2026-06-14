/**
 * Dictionnaire bilingue local à la surface /sandbox.
 * `en: typeof fr` garantit qu'une clé EN manquante casse le build TypeScript.
 */

const fr = {
  // Wrappers (boutons d'ouverture)
  openModal: "Ouvrir le modal",
  openDrawer: "Ouvrir le tiroir",
  drawerPreviewTitle: "Détails",
  drawerPreviewContent: "Contenu du tiroir latéral.",

  // ToastPreview
  toastDemoMessage: "Message de démo",
  toastSuccessMessage: "Succès enregistré",
  toastWarningMessage: "Attention requise",
  toastInfoBtn: "Toast info",
  toastSuccessBtn: "Toast success",
  toastWarningBtn: "Toast warning",

  // Composant non reconnu
  unknownComponentPrefix: "Composant",
  unknownComponentSuffix: "non reconnu dans la Sandbox",

  // Modules de l'app (descriptions)
  modAuthDesc: "Authentification (Google, e-mail), session et whitelist.",
  modWikiDesc: "Wiki interne et pages documentées.",
  modIaDesc: "Assistant et chat IA.",
  modDocumentsLabel: "Analyse de documents",
  modDocumentsDesc: "Analyse et gestion de documents.",
  modContractsLabel: "Base contractuelle",
  modContractsDesc: "Contrats fournisseurs et CGV : upload, analyse IA.",
  modVeilleDesc: "Veille et flux d'information.",
  modNotificationDesc: "Historique des notifications, niveaux 1–3.",

  // === Démos de composants (content) ===
  panelTitle: "Panneau {variant}",
  panelBody: "Contenu du panneau. Variante :",
  messageBody: "Contenu du message.",
  metricCa: "CA",
  metricRate: "Taux",
  metricTrend: "Tendance",
  tableColName: "Nom",
  tableColValue: "Valeur",
  tableRowClicked: "Ligne cliquée :",
  tab1: "Onglet 1",
  tab2: "Onglet 2",
  tab1Content: "Contenu onglet 1",
  tab2Content: "Contenu onglet 2",
  titleLevel1: "Titre niveau 1",
  titleLevel2: "Titre niveau 2",
  titleLevel3: "Titre niveau 3",
  textSimple: "Texte simple (bpm.text).",
  textMono: "Texte monospace (mono=True).",
  caption: "Légende ou sous-titre (bpm.caption).",
  spinnerLoading: "Chargement…",
  tooltipText: "Info-bulle au survol",
  tooltipTrigger: "Survolez-moi",
  cardTitle: "Carte exemple",
  cardSubtitle: "Sous-titre",
  cardBody: "Contenu de la carte. Actions et variantes disponibles.",
  inputLabel: "Champ texte",
  inputPlaceholder: "Saisissez…",
  textareaLabel: "Zone de texte",
  textareaPlaceholder: "Contenu…",
  checkboxA: "Option A",
  checkboxB: "Option B",
  toggleEnable: "Activer",
  toggleEnabled: "Activé",
  selectLabel: "Choix",
  selectOptionA: "Option A",
  selectOptionB: "Option B",
  selectOptionC: "Option C",
  accordionSection1Title: "Section 1",
  accordionSection2Title: "Section 2",
  accordionSection1Content: "Contenu de la section 1.",
  accordionSection2Content: "Contenu de la section 2.",
  expanderTitle: "Développer pour voir",
  expanderBody: "Contenu masqué par défaut.",
  sliderLabel: "Volume",
  progressLabel1: "Progression",
  progressLabel2: "Avancement",
  breadcrumbHome: "Accueil",
  dividerAbove: "Au-dessus",
  dividerBelow: "En dessous",
  emptyStateTitle: "Aucun élément",
  emptyStateDesc: "La liste est vide pour le moment.",
  chipDeletable: "Supprimable",
  modalTitle: "Modal exemple",
  modalBody: "Contenu du modal. Ouvrir via state pour tester.",
  modalNote: "Le modal est fermé ici ; à ouvrir via un bouton en contexte.",
  highlightLabel: "Exemple",
  highlightTitle: "Encadré important",
  step1: "Étape 1",
  step2: "Étape 2",
  step3: "Étape 3",
  markdownDemo: "## Titre\n\nParagraphe avec **gras** et *italique*.",
  jsonText: "texte",
  emptyNoData: "Aucune donnée",
  columnTitle: "Colonne",
  columnBody: "Contenu dans une colonne.",
  themeLabel: "Thème",
  themeNote: "Bascule clair / sombre.",
  containerTitle: "Contenu dans un container",
  containerBody: "Contenu.",
  statusSuccess: "Succès",
  statusRunning: "En cours",
  statusError: "Erreur",
  numberLabel: "Quantité",
  dateLabel: "Date",
  daterangeLabel: "Période",
  timeLabel: "Heure",
  radioOptionX: "Option X",
  radioOptionY: "Option Y",
  radioLabel: "Choix unique",
  fileLabel: "Fichier",
  colorLabel: "Couleur",
  monthFeb: "Fév",
  topnavHome: "Accueil",
  fabLabel: "Action",
  fabAlert: "FAB cliqué",
  treeRoot: "Racine",
  treeChild1: "Enfant 1",
  treeChild2: "Enfant 2",
  treeSubChild: "Sous-enfant",
  treeOtherNode: "Autre nœud",
  timelineDone: "Terminée",
  timelineCurrent: "En cours",
  timelineUpcoming: "À venir",
  imageAlt: "Exemple",
  autocompletePlaceholder: "Rechercher une ville…",
  nfcScannable: "Scannable",
  nfcActive: "Actif",
  nfcValidated: "Validé",
  paginationLabel: "Page 2 sur 5",
  popoverOpen: "Ouvrir",
  popoverBody: "Contenu du popover.",
  htmlDemo:
    '<p>Contenu <strong>HTML</strong> (bpm.html). Utiliser uniquement avec du contenu de confiance.</p>',
  defaultTitle: "Sandbox BPM",
  defaultComponentLine: "Composant :",
  defaultSelectHint: "Sélectionnez un composant dans la liste ou utilisez",

  // === En-tête de page ===
  pageHeading: "Sandbox",
  pageDescription:
    "Choisissez un composant ou écrivez du code pour composer une page en direct.",
  appModules: "Modules de l'app",

  // === Onglets de mode ===
  modeCode: "Par code",
  modeSelector: "Par composant",
  modeAi: "✦ Par IA",

  // === Mode code ===
  codeLabel: "Code (appels bpm.*)",
  codeHint:
    "Tapez bpm. pour l'autocomplétion. Exemples : bpm.title(...), bpm.metric(...), bpm.barchart(...).",
  livePreviewAria: "Aperçu en direct",
  livePreviewTitle: "Aperçu en direct",
  livePreviewEmpty: "Écrivez des appels bpm.* ci-dessus pour voir le rendu ici.",

  // === Mode sélecteur ===
  selectorComponent: "Composant",
  selectorVariant: "Variante",
  selectorTitle: "Titre",
  selectorTitlePlaceholder: "Optionnel",
  selectorTheme: "Thème",
  themeLight: "Clair",
  themeDark: "Sombre",

  // === Mode IA ===
  aiDescribeLabel: "Décrivez la page que vous voulez générer",
  aiOllamaHint:
    "Vérifiez qu'Ollama est démarré (ex. http://localhost:11434) ou définissez AI_MOCK=true dans .env pour le mode démo.",
  aiPlaceholder:
    "Exemples :\n" +
    "• Un dashboard avec le CA mensuel, le taux de marge et un graphique de tendance\n" +
    "• Une page de suivi de contrats avec statut et date d'échéance\n" +
    "• Un formulaire de saisie de commande fournisseur",
  aiGenerate: "Générer",
  aiGenerating: "Génération…",
  aiGeneratingFor: "génère votre page (~30-60s)…",
  aiHint: 'Cmd+Entrée pour lancer · Le résultat s\'ouvrira en mode "Par code"',
  aiGenerationInProgress: "Génération en cours…",

  // === Génération IA (messages d'état/erreur) ===
  genInProgressComment: "# Génération en cours…",
  genErrorStatus: "Erreur {status}",
  genOllamaError:
    "Vérifiez qu'Ollama est démarré (ex. http://localhost:11434). Sinon, définissez AI_MOCK=true dans .env pour le mode démo.",
  genUnknownError: "Erreur inconnue",
  genNetworkError: "Erreur réseau",

  // === Assistant ===
  assistantDefaultName: "Assistant",
  assistantProductionTitle: "Assistant Production",
  dashboardProductionLabel: "Dashboard Production",

  // === Suspense fallback ===
  loading: "Chargement…",
};

const en: typeof fr = {
  // Wrappers (open buttons)
  openModal: "Open modal",
  openDrawer: "Open drawer",
  drawerPreviewTitle: "Details",
  drawerPreviewContent: "Side drawer content.",

  // ToastPreview
  toastDemoMessage: "Demo message",
  toastSuccessMessage: "Successfully saved",
  toastWarningMessage: "Attention required",
  toastInfoBtn: "Toast info",
  toastSuccessBtn: "Toast success",
  toastWarningBtn: "Toast warning",

  // Unknown component
  unknownComponentPrefix: "Component",
  unknownComponentSuffix: "not recognized in the Sandbox",

  // App modules (descriptions)
  modAuthDesc: "Authentication (Google, e-mail), session and whitelist.",
  modWikiDesc: "Internal wiki and documented pages.",
  modIaDesc: "AI assistant and chat.",
  modDocumentsLabel: "Document analysis",
  modDocumentsDesc: "Document analysis and management.",
  modContractsLabel: "Contract database",
  modContractsDesc: "Supplier contracts and T&Cs: upload, AI analysis.",
  modVeilleDesc: "Monitoring and information feeds.",
  modNotificationDesc: "Notification history, levels 1–3.",

  // === Component demos (content) ===
  panelTitle: "{variant} panel",
  panelBody: "Panel content. Variant:",
  messageBody: "Message content.",
  metricCa: "Revenue",
  metricRate: "Rate",
  metricTrend: "Trend",
  tableColName: "Name",
  tableColValue: "Value",
  tableRowClicked: "Clicked row:",
  tab1: "Tab 1",
  tab2: "Tab 2",
  tab1Content: "Tab 1 content",
  tab2Content: "Tab 2 content",
  titleLevel1: "Level 1 title",
  titleLevel2: "Level 2 title",
  titleLevel3: "Level 3 title",
  textSimple: "Plain text (bpm.text).",
  textMono: "Monospace text (mono=True).",
  caption: "Caption or subtitle (bpm.caption).",
  spinnerLoading: "Loading…",
  tooltipText: "Tooltip on hover",
  tooltipTrigger: "Hover me",
  cardTitle: "Example card",
  cardSubtitle: "Subtitle",
  cardBody: "Card content. Actions and variants available.",
  inputLabel: "Text field",
  inputPlaceholder: "Type here…",
  textareaLabel: "Text area",
  textareaPlaceholder: "Content…",
  checkboxA: "Option A",
  checkboxB: "Option B",
  toggleEnable: "Enable",
  toggleEnabled: "Enabled",
  selectLabel: "Choice",
  selectOptionA: "Option A",
  selectOptionB: "Option B",
  selectOptionC: "Option C",
  accordionSection1Title: "Section 1",
  accordionSection2Title: "Section 2",
  accordionSection1Content: "Section 1 content.",
  accordionSection2Content: "Section 2 content.",
  expanderTitle: "Expand to see",
  expanderBody: "Content hidden by default.",
  sliderLabel: "Volume",
  progressLabel1: "Progress",
  progressLabel2: "Completion",
  breadcrumbHome: "Home",
  dividerAbove: "Above",
  dividerBelow: "Below",
  emptyStateTitle: "No items",
  emptyStateDesc: "The list is empty for now.",
  chipDeletable: "Deletable",
  modalTitle: "Example modal",
  modalBody: "Modal content. Open via state to test.",
  modalNote: "The modal is closed here; open it via a button in context.",
  highlightLabel: "Example",
  highlightTitle: "Important callout",
  step1: "Step 1",
  step2: "Step 2",
  step3: "Step 3",
  markdownDemo: "## Title\n\nParagraph with **bold** and *italic*.",
  jsonText: "text",
  emptyNoData: "No data",
  columnTitle: "Column",
  columnBody: "Content inside a column.",
  themeLabel: "Theme",
  themeNote: "Light / dark toggle.",
  containerTitle: "Content inside a container",
  containerBody: "Content.",
  statusSuccess: "Success",
  statusRunning: "Running",
  statusError: "Error",
  numberLabel: "Quantity",
  dateLabel: "Date",
  daterangeLabel: "Period",
  timeLabel: "Time",
  radioOptionX: "Option X",
  radioOptionY: "Option Y",
  radioLabel: "Single choice",
  fileLabel: "File",
  colorLabel: "Color",
  monthFeb: "Feb",
  topnavHome: "Home",
  fabLabel: "Action",
  fabAlert: "FAB clicked",
  treeRoot: "Root",
  treeChild1: "Child 1",
  treeChild2: "Child 2",
  treeSubChild: "Sub-child",
  treeOtherNode: "Other node",
  timelineDone: "Done",
  timelineCurrent: "In progress",
  timelineUpcoming: "Upcoming",
  imageAlt: "Example",
  autocompletePlaceholder: "Search for a city…",
  nfcScannable: "Scannable",
  nfcActive: "Active",
  nfcValidated: "Validated",
  paginationLabel: "Page 2 of 5",
  popoverOpen: "Open",
  popoverBody: "Popover content.",
  htmlDemo:
    "<p><strong>HTML</strong> content (bpm.html). Use only with trusted content.</p>",
  defaultTitle: "BPM Sandbox",
  defaultComponentLine: "Component:",
  defaultSelectHint: "Select a component from the list or use",

  // === Page header ===
  pageHeading: "Sandbox",
  pageDescription:
    "Pick a component or write code to compose a live page.",
  appModules: "App modules",

  // === Mode tabs ===
  modeCode: "By code",
  modeSelector: "By component",
  modeAi: "✦ By AI",

  // === Code mode ===
  codeLabel: "Code (bpm.* calls)",
  codeHint:
    "Type bpm. for autocompletion. Examples: bpm.title(...), bpm.metric(...), bpm.barchart(...).",
  livePreviewAria: "Live preview",
  livePreviewTitle: "Live preview",
  livePreviewEmpty: "Write bpm.* calls above to see the result rendered here.",

  // === Selector mode ===
  selectorComponent: "Component",
  selectorVariant: "Variant",
  selectorTitle: "Title",
  selectorTitlePlaceholder: "Optional",
  selectorTheme: "Theme",
  themeLight: "Light",
  themeDark: "Dark",

  // === AI mode ===
  aiDescribeLabel: "Describe the page you want to generate",
  aiOllamaHint:
    "Make sure Ollama is running (e.g. http://localhost:11434) or set AI_MOCK=true in .env for demo mode.",
  aiPlaceholder:
    "Examples:\n" +
    "• A dashboard with monthly revenue, margin rate and a trend chart\n" +
    "• A contract tracking page with status and due date\n" +
    "• A supplier order entry form",
  aiGenerate: "Generate",
  aiGenerating: "Generating…",
  aiGeneratingFor: "is generating your page (~30-60s)…",
  aiHint: 'Cmd+Enter to launch · The result will open in "By code" mode',
  aiGenerationInProgress: "Generation in progress…",

  // === AI generation (status/error messages) ===
  genInProgressComment: "# Generation in progress…",
  genErrorStatus: "Error {status}",
  genOllamaError:
    "Make sure Ollama is running (e.g. http://localhost:11434). Otherwise, set AI_MOCK=true in .env for demo mode.",
  genUnknownError: "Unknown error",
  genNetworkError: "Network error",

  // === Assistant ===
  assistantDefaultName: "Assistant",
  assistantProductionTitle: "Production Assistant",
  dashboardProductionLabel: "Production Dashboard",

  // === Suspense fallback ===
  loading: "Loading…",
};

export const STR = { fr, en } as const;
