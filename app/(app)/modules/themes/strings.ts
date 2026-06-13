/**
 * Chaînes bilingues du module Thèmes / White-label.
 * Parité de clés garantie par le type : `en` est contraint par `typeof fr`.
 */

/** Segment de texte, rendu dans <code> lorsque `code` est vrai. */
type Seg = { t: string; code?: boolean };

const fr = {
  /* ---------- Page module (page.tsx) ---------- */
  breadcrumbThemes: "Thèmes",
  moduleTitle: "Thèmes / White-label",
  moduleDescription:
    "Studio de thème par instance ou client : nom d'app, couleurs, rayon de bordure. Personnalisez avec un aperçu en direct, enregistrez, définissez par défaut, exportez en JSON — tout est testable dans le Simulateur.",
  categoryBadge: "Intégrations & technique",
  openSimulator: "Ouvrir le simulateur",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",

  aboutTitle: "À propos",
  aboutText:
    "Le module Thèmes / White-label fait porter le branding par l'instance, pas par le code : chaque client (ou environnement) reçoit son thème — nom d'application, couleur d'accent, fond, surface, texte et rayon de bordure. Le studio permet de partir d'un thème existant, de le personnaliser en direct dans un aperçu scopé, puis de l'enregistrer, de le définir par défaut ou de l'exporter en JSON pour le déployer.",
  coverageTitle: "Ce que couvre le simulateur",
  coverageItems: [
    "Quatre thèmes seedés : Blueprint (défaut), ACME Corp, Nordis Énergie, Contraste élevé.",
    "Aperçu live : barre d'app (logo + nom), cartes KPI, bouton primaire, champ, badge — entièrement stylés par le thème sélectionné, sans toucher aux variables globales.",
    "Personnalisation : accent, fond, nom de l'app, rayon de bordure (0–16 px).",
    "Actions réelles : enregistrer comme nouveau thème, définir par défaut, supprimer (avec confirmation), exporter en JSON (téléchargement).",
  ],
  componentsTitle: "Composants utilisés",
  componentsJoin: "et",
  configTitle: "Paramétrage",
  configTextBeforeLink:
    "Le simulateur fonctionne entièrement en local (thèmes seedés, aucune API requise). L'aperçu est scopé à son conteneur : il n'écrit jamais dans les variables CSS globales du document, qui restent pilotées par le ThemeProvider de l'application. Voir la",
  configLinkLabel: "documentation",
  configTextAfterLink:
    "pour les variables exposées, le modèle JSON et la résolution multi-tenant.",

  /* ---------- Page simulateur (simulateur/page.tsx) ---------- */
  breadcrumbSimulator: "Simulateur",
  simPageTitle: "Simulateur — Thèmes / White-label",
  simPageDescription:
    "Quatre thèmes seedés (Blueprint, ACME Corp, Nordis Énergie, Contraste élevé). Sélectionnez-en un, personnalisez accent, fond, nom d'app et rayon de bordure : l'aperçu scopé se met à jour en direct. Enregistrez, définissez par défaut, supprimez ou exportez en JSON.",

  /* ---------- Simulateur (simulateur-content.tsx) ---------- */
  /** Noms localisés des thèmes seedés (ACME Corp et Nordis Énergie sont des noms propres). */
  seedNames: {
    "theme-blueprint": "Blueprint (défaut)",
    "theme-contraste": "Contraste élevé",
  } as Record<string, string>,

  metricAvailable: "Thèmes disponibles",
  metricDefault: "Thème par défaut",
  metricLastModified: "Dernière modification",
  timeThreeDaysAgo: "il y a 3 jours",
  timeJustNow: "à l'instant",

  panelThemes: "Thèmes",
  panelCustomize: "Personnaliser",
  panelPreview: "Aperçu",
  badgeDefault: "Par défaut",
  themeMeta: (couleurApp: string, accent: string, rayon: number) =>
    `${couleurApp} · accent ${accent} · rayon ${rayon}px`,

  btnSetDefault: "Définir par défaut",
  btnExportJson: "Exporter JSON",
  btnDelete: "Supprimer",
  btnSaveAsNew: "Enregistrer comme nouveau thème",
  cannotDeleteDefault:
    "Le thème par défaut ne peut pas être supprimé : définissez d'abord un autre thème par défaut.",

  customizeBasePrefix: "Base : ",
  customizeBaseSuffix: ". Chaque changement se reflète immédiatement dans l'aperçu.",
  labelAppName: "Nom de l'app (affiché dans la barre)",
  placeholderAppName: "Blueprint Modular",
  labelAccentColor: "Couleur d'accent",
  labelBackgroundColor: "Couleur de fond",
  labelBorderRadius: "Rayon de bordure (px)",
  unsavedChanges:
    "Modifications non enregistrées — visibles dans l'aperçu. Enregistrez-les comme nouveau thème pour les conserver.",
  labelNewThemeName: "Nom du nouveau thème",
  placeholderNewThemeName: "ACME Corp — sombre",
  errNameRequired: "Indiquez un nom pour le nouveau thème.",
  errNameExists: (nom: string) => `Un thème nommé « ${nom} » existe déjà.`,

  toastSource: "Thèmes",
  toastSavedTitle: "Thème enregistré",
  toastSavedMsg: (nom: string, total: number) =>
    `Thème « ${nom} » enregistré (${total} thèmes disponibles).`,
  toastNoChangeTitle: "Aucun changement",
  toastNoChangeMsg: (nom: string) => `« ${nom} » est déjà le thème par défaut.`,
  toastDefaultTitle: "Thème par défaut",
  toastDefaultMsg: (nom: string) =>
    `« ${nom} » est désormais appliqué par défaut aux nouvelles instances.`,
  toastDeletedTitle: "Thème supprimé",
  toastDeletedMsg: (nom: string, repli: string) =>
    `Thème « ${nom} » supprimé. Les instances qui l'utilisaient repassent sur « ${repli} ».`,
  toastExportTitle: "Export JSON",
  toastExportMsg: (nom: string, fichier: string) => `« ${nom} » exporté dans ${fichier}.`,
  toastPreviewTitle: "Aperçu",
  toastPreviewMsg: (nom: string) => `Action de démonstration dans l'aperçu « ${nom} ».`,

  previewIntro:
    "Rendu scopé au conteneur ci-dessous : les variables du thème ne touchent jamais le reste de l'application.",
  previewEnvBadge: "Production",
  previewUntitled: "Sans nom",
  kpiOrdersLabel: "Commandes du mois",
  kpiOrdersValue: "1 284",
  kpiOrdersDelta: "+12 % vs mai",
  kpiServiceLabel: "Taux de service",
  kpiServiceValue: "98,2 %",
  kpiServiceDelta: "objectif atteint",
  previewSearchPlaceholder: "Rechercher une commande…",
  previewPrimaryAction: "Nouvelle commande",

  modalDeleteTitle: "Supprimer le thème",
  modalDeleteMsg: (nom: string, repli: string) =>
    `Le thème « ${nom} » sera retiré de la bibliothèque. Les instances qui l'utilisent repasseront sur le thème par défaut (« ${repli} »).`,
  modalConfirm: "Supprimer",
  modalCancel: "Annuler",

  /* ---------- Page documentation (documentation/page.tsx) ---------- */
  breadcrumbDocumentation: "Documentation",
  docTitle: "Documentation — Thèmes / White-label",
  docDescription:
    "Branding par instance ou client : variables exposées, modèle JSON d'un thème, application au DOM et résolution multi-tenant.",
  varsTitle: "Variables exposées",
  varsIntro:
    "Un thème expose un petit jeu de variables, volontairement réduit pour rester maintenable. Tout le reste (états hover, ombres, contrastes) est dérivé de ces valeurs.",
  varItems: [
    {
      code: "couleurApp",
      desc: "nom d'application affiché dans la barre (les initiales servent de logo de repli).",
    },
    {
      code: "accent",
      desc: "couleur primaire (boutons, badges, liens) ; la couleur du texte posé dessus est dérivée par luminance.",
    },
    { code: "fond", desc: "arrière-plan général de l'interface." },
    { code: "surface", desc: "fond des cartes, panneaux et champs." },
    {
      code: "texte",
      desc: "couleur de texte principale ; les bordures sont dérivées (texte à ~15 % d'opacité).",
    },
    { code: "rayon", desc: "rayon de bordure en px (0–16), appliqué uniformément." },
  ],
  jsonTitle: "Modèle JSON d'un thème",
  jsonIntro:
    "C'est exactement le format produit par « Exporter JSON » dans le simulateur, et celui attendu côté serveur pour provisionner une instance.",
  domTitle: "Application au DOM",
  domTextBeforeStrong:
    "En production, le thème résolu est appliqué une seule fois, en injectant les variables CSS sur un conteneur racine — jamais champ par champ dans les composants. Dans le simulateur, l'aperçu est ",
  domStrong: "scopé",
  domTextAfterStrong:
    " : les valeurs sont posées en style inline sur le conteneur de prévisualisation, sans jamais muter les variables globales du document (elles restent la propriété du ThemeProvider de l'application).",
  domCodeComment:
    "// Application scopée (aperçu ou app embarquée) — pas de document.documentElement",
  mtTitle: "Multi-tenant",
  mtIntro:
    "La résolution du thème suit l'ordre : thème explicitement assigné à l'instance → thème du client (tenant) → thème par défaut de la plateforme. Recommandations :",
  mtItems: [
    [
      { t: "Persister les thèmes dans une table " },
      { t: "themes", code: true },
      { t: " et référencer " },
      { t: "theme_id", code: true },
      { t: " sur chaque tenant ; ne jamais dupliquer les valeurs." },
    ],
    [
      {
        t: "Résoudre le tenant côté serveur (sous-domaine ou en-tête d'instance) et servir les variables dès le premier rendu pour éviter tout flash de thème.",
      },
    ],
    [
      {
        t: "Conserver un thème par défaut non supprimable : c'est le repli de toute instance dont le thème a été retiré (comportement reproduit dans le simulateur).",
      },
    ],
    [
      { t: "Tracer les déploiements de branding via le champ " },
      { t: "exporteLe", code: true },
      { t: " ajouté à chaque export JSON." },
    ],
  ] as Seg[][],
};

const en: typeof fr = {
  /* ---------- Module page (page.tsx) ---------- */
  breadcrumbThemes: "Themes",
  moduleTitle: "Themes / White-label",
  moduleDescription:
    "Per-instance or per-client theme studio: app name, colors, border radius. Customize with a live preview, save, set as default, export to JSON — everything can be tried out in the Simulator.",
  categoryBadge: "Integrations & engineering",
  openSimulator: "Open the simulator",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",

  aboutTitle: "About",
  aboutText:
    "The Themes / White-label module moves branding into the instance, not the code: each client (or environment) gets its own theme — application name, accent color, background, surface, text and border radius. The studio lets you start from an existing theme, customize it live in a scoped preview, then save it, set it as the default or export it to JSON for deployment.",
  coverageTitle: "What the simulator covers",
  coverageItems: [
    "Four seeded themes: Blueprint (default), ACME Corp, Nordis Énergie, High contrast.",
    "Live preview: app bar (logo + name), KPI cards, primary button, input field, badge — fully styled by the selected theme, without touching the global variables.",
    "Customization: accent, background, app name, border radius (0–16 px).",
    "Real actions: save as a new theme, set as default, delete (with confirmation), export to JSON (download).",
  ],
  componentsTitle: "Components used",
  componentsJoin: "and",
  configTitle: "Configuration",
  configTextBeforeLink:
    "The simulator runs entirely locally (seeded themes, no API required). The preview is scoped to its container: it never writes to the document's global CSS variables, which remain controlled by the application's ThemeProvider. See the",
  configLinkLabel: "documentation",
  configTextAfterLink:
    "for the exposed variables, the JSON model and multi-tenant resolution.",

  /* ---------- Simulator page (simulateur/page.tsx) ---------- */
  breadcrumbSimulator: "Simulator",
  simPageTitle: "Simulator — Themes / White-label",
  simPageDescription:
    "Four seeded themes (Blueprint, ACME Corp, Nordis Énergie, High contrast). Pick one, customize the accent, background, app name and border radius: the scoped preview updates live. Save, set as default, delete or export to JSON.",

  /* ---------- Simulator (simulateur-content.tsx) ---------- */
  /** Localized names of seeded themes (ACME Corp and Nordis Énergie are proper nouns). */
  seedNames: {
    "theme-blueprint": "Blueprint (default)",
    "theme-contraste": "High contrast",
  } as Record<string, string>,

  metricAvailable: "Available themes",
  metricDefault: "Default theme",
  metricLastModified: "Last modified",
  timeThreeDaysAgo: "3 days ago",
  timeJustNow: "just now",

  panelThemes: "Themes",
  panelCustomize: "Customize",
  panelPreview: "Preview",
  badgeDefault: "Default",
  themeMeta: (couleurApp: string, accent: string, rayon: number) =>
    `${couleurApp} · accent ${accent} · radius ${rayon}px`,

  btnSetDefault: "Set as default",
  btnExportJson: "Export JSON",
  btnDelete: "Delete",
  btnSaveAsNew: "Save as new theme",
  cannotDeleteDefault:
    "The default theme cannot be deleted: set another theme as the default first.",

  customizeBasePrefix: "Base: ",
  customizeBaseSuffix: ". Every change is reflected immediately in the preview.",
  labelAppName: "App name (shown in the bar)",
  placeholderAppName: "Blueprint Modular",
  labelAccentColor: "Accent color",
  labelBackgroundColor: "Background color",
  labelBorderRadius: "Border radius (px)",
  unsavedChanges:
    "Unsaved changes — visible in the preview. Save them as a new theme to keep them.",
  labelNewThemeName: "New theme name",
  placeholderNewThemeName: "ACME Corp — dark",
  errNameRequired: "Enter a name for the new theme.",
  errNameExists: (nom: string) => `A theme named "${nom}" already exists.`,

  toastSource: "Themes",
  toastSavedTitle: "Theme saved",
  toastSavedMsg: (nom: string, total: number) =>
    `Theme "${nom}" saved (${total} themes available).`,
  toastNoChangeTitle: "No change",
  toastNoChangeMsg: (nom: string) => `"${nom}" is already the default theme.`,
  toastDefaultTitle: "Default theme",
  toastDefaultMsg: (nom: string) =>
    `"${nom}" is now applied by default to new instances.`,
  toastDeletedTitle: "Theme deleted",
  toastDeletedMsg: (nom: string, repli: string) =>
    `Theme "${nom}" deleted. Instances that used it fall back to "${repli}".`,
  toastExportTitle: "JSON export",
  toastExportMsg: (nom: string, fichier: string) => `"${nom}" exported to ${fichier}.`,
  toastPreviewTitle: "Preview",
  toastPreviewMsg: (nom: string) => `Demo action in the "${nom}" preview.`,

  previewIntro:
    "Rendering is scoped to the container below: the theme variables never affect the rest of the application.",
  previewEnvBadge: "Production",
  previewUntitled: "Untitled",
  kpiOrdersLabel: "Orders this month",
  kpiOrdersValue: "1,284",
  kpiOrdersDelta: "+12% vs May",
  kpiServiceLabel: "Service level",
  kpiServiceValue: "98.2%",
  kpiServiceDelta: "target met",
  previewSearchPlaceholder: "Search orders…",
  previewPrimaryAction: "New order",

  modalDeleteTitle: "Delete theme",
  modalDeleteMsg: (nom: string, repli: string) =>
    `The theme "${nom}" will be removed from the library. Instances using it will fall back to the default theme ("${repli}").`,
  modalConfirm: "Delete",
  modalCancel: "Cancel",

  /* ---------- Documentation page (documentation/page.tsx) ---------- */
  breadcrumbDocumentation: "Documentation",
  docTitle: "Documentation — Themes / White-label",
  docDescription:
    "Per-instance or per-client branding: exposed variables, the JSON model of a theme, applying it to the DOM and multi-tenant resolution.",
  varsTitle: "Exposed variables",
  varsIntro:
    "A theme exposes a small set of variables, deliberately kept minimal to stay maintainable. Everything else (hover states, shadows, contrasts) is derived from these values.",
  varItems: [
    {
      code: "couleurApp",
      desc: "application name shown in the bar (its initials serve as the fallback logo).",
    },
    {
      code: "accent",
      desc: "primary color (buttons, badges, links); the color of text placed on it is derived from luminance.",
    },
    { code: "fond", desc: "overall background of the interface." },
    { code: "surface", desc: "background of cards, panels and fields." },
    {
      code: "texte",
      desc: "main text color; borders are derived from it (text at ~15% opacity).",
    },
    { code: "rayon", desc: "border radius in px (0–16), applied uniformly." },
  ],
  jsonTitle: "JSON model of a theme",
  jsonIntro:
    "This is exactly the format produced by \"Export JSON\" in the simulator, and the one expected server-side to provision an instance.",
  domTitle: "Applying to the DOM",
  domTextBeforeStrong:
    "In production, the resolved theme is applied once, by injecting the CSS variables on a root container — never field by field inside components. In the simulator, the preview is ",
  domStrong: "scoped",
  domTextAfterStrong:
    ": the values are set as inline styles on the preview container, without ever mutating the document's global variables (those remain owned by the application's ThemeProvider).",
  domCodeComment:
    "// Scoped application (preview or embedded app) — no document.documentElement",
  mtTitle: "Multi-tenant",
  mtIntro:
    "Theme resolution follows this order: theme explicitly assigned to the instance → client (tenant) theme → platform default theme. Recommendations:",
  mtItems: [
    [
      { t: "Persist themes in a " },
      { t: "themes", code: true },
      { t: " table and reference " },
      { t: "theme_id", code: true },
      { t: " on each tenant; never duplicate the values." },
    ],
    [
      {
        t: "Resolve the tenant server-side (subdomain or instance header) and serve the variables on the very first render to avoid any theme flash.",
      },
    ],
    [
      {
        t: "Keep a non-deletable default theme: it is the fallback for any instance whose theme has been removed (behavior reproduced in the simulator).",
      },
    ],
    [
      { t: "Track branding deployments via the " },
      { t: "exporteLe", code: true },
      { t: " field added to every JSON export." },
    ],
  ] as Seg[][],
};

export const STR = { fr, en } as const;
