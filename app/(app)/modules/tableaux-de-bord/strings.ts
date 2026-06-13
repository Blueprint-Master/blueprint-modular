/**
 * Chaînes bilingues du module Tableaux de bord.
 * La parité des clés est garantie par le type : `en` est typé `ModuleStrings = typeof STR.fr`.
 * Les identifiants de widgets (clés de `widgets`) sont stables : seuls les libellés
 * affichés sont résolus selon la locale (la disposition persistée référence les ids).
 */

const fr = {
  /* ----- Commun ----- */
  moduleTitle: "Tableaux de bord",
  breadcrumbModules: "Modules",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",
  openSimulator: "Ouvrir le simulateur",
  numberLocale: "fr-FR",

  /* ----- page.tsx ----- */
  pageDescription:
    "Tableau de bord à widgets réellement personnalisable : affichez, masquez, réordonnez et redimensionnez 8 widgets (métriques, graphiques, tableau, objectif, flux de commandes). La disposition est sauvegardée et restaurée automatiquement. Testez dans le Simulateur.",
  categoryBadge: "Données & reporting",
  aboutTitle: "À propos",
  aboutBody:
    "Le module Tableaux de bord laisse chaque utilisateur composer sa propre vue : il choisit les widgets affichés depuis un catalogue (métriques, courbe des ventes, CA par région, top produits, objectif trimestre, flux de commandes), les réordonne, les redimensionne (1 ou 2 colonnes) et les masque. La disposition est sauvegardée localement et restaurée à la prochaine visite — chacun retrouve « son » tableau de bord.",
  componentsTitle: "Composants utilisés",
  componentsLibrary: "bibliothèque",
  componentsToolbar: "barre d'outils par widget",
  componentsReset: "réinitialisation",
  and: "et",
  customizationTitle: "Personnalisation",
  customizationItems: [
    {
      strong: "Personnaliser",
      text: " — active le mode édition : bordures pointillées et barre d'outils sur chaque widget ; « Terminer » pour en sortir.",
    },
    { strong: "↑ / ↓", text: " — réordonne les widgets (boutons désactivés aux extrémités)." },
    { strong: "⤢", text: " — bascule la taille du widget entre 1 et 2 colonnes." },
    {
      strong: "Masquer / Ajouter",
      text: " — retire un widget vers la bibliothèque, ou l'en ressort dans la grille.",
    },
    {
      strong: "Réinitialiser la disposition",
      text: " — retour à la disposition par défaut, avec confirmation explicite.",
    },
  ],
  simNoteBeforeCode: "Le simulateur fonctionne entièrement en local (données seedées, persistance ",
  simNoteAfterCode:
    ", aucune API requise). En production, remplacer la persistance locale par un enregistrement par utilisateur côté serveur. Voir la ",
  simNoteLinkLabel: "documentation",
  simNoteEnd: " pour le catalogue de widgets et le modèle de configuration.",

  /* ----- Simulateur : catalogue de widgets ----- */
  months: ["Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.", "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin"],
  widgets: {
    "metric-ca": {
      title: "CA du mois",
      description: "Chiffre d'affaires du mois en cours, avec variation vs mois précédent.",
    },
    "metric-commandes": {
      title: "Commandes",
      description: "Nombre de commandes du mois, avec variation vs mois précédent.",
    },
    "metric-panier": {
      title: "Panier moyen",
      description: "Montant moyen d'une commande sur le mois en cours.",
    },
    "line-ventes": {
      title: "Ventes — 12 derniers mois",
      description: "Évolution mensuelle du chiffre d'affaires (k€) sur un an glissant.",
    },
    "bar-regions": {
      title: "CA par région",
      description: "Répartition du chiffre d'affaires (k€) sur les 6 premières régions.",
    },
    "table-top-produits": {
      title: "Top 5 produits",
      description: "Les 5 produits qui génèrent le plus de chiffre d'affaires ce mois-ci.",
    },
    "ring-objectif": {
      title: "Objectif trimestre",
      description: "Avancement vers l'objectif de CA du trimestre (T2 2026).",
    },
    "feed-commandes": {
      title: "Dernières commandes",
      description: "Flux des dernières commandes passées, modifiées ou annulées.",
    },
  },
  metricCaValue: "142,5 k€",
  metricCaDelta: "+12,3 %",
  metricCommandesDelta: "+8 %",
  metricPanierDelta: "+3,9 %",
  vsLastMonth: "vs mai 2026",
  tableColRef: "Réf.",
  tableColProduct: "Produit",
  tableColRevenue: "CA",
  ringPercentLabel: "78 % de l'objectif T2",
  ringDetail: "312 k€ réalisés sur 400 k€ — 18 jours restants.",

  /* ----- Simulateur : flux d'activité ----- */
  orderPlaced: "a passé la commande",
  orderModified: "a modifié la commande",
  orderCancelled: "a annulé la commande",
  quantitiesRevised: "quantités révisées",

  /* ----- Simulateur : barre d'actions, grille, bibliothèque ----- */
  statusLine: (shown: number, hidden: number) =>
    `${shown} widget${shown > 1 ? "s" : ""} affiché${shown > 1 ? "s" : ""} · ${hidden} dans la bibliothèque`,
  editingSuffix: " — mode personnalisation actif",
  customize: "Personnaliser",
  done: "Terminer",
  hide: "Masquer",
  add: "Ajouter",
  resetLayout: "Réinitialiser la disposition",
  emptyTitle: "Tableau de bord vide",
  emptyAllHidden: "Tous les widgets sont masqués.",
  emptyEditingHint: "Ajoutez-en depuis la bibliothèque ci-dessous.",
  emptyIdleHint: "Cliquez sur « Personnaliser » puis ajoutez des widgets depuis la bibliothèque.",
  toolbarLabel: (title: string) => `Outils — ${title}`,
  moveUpLabel: (title: string) => `Monter « ${title} »`,
  moveDownLabel: (title: string) => `Descendre « ${title} »`,
  enlargeLabel: (title: string) => `Agrandir « ${title} » sur 2 colonnes`,
  shrinkLabel: (title: string) => `Réduire « ${title} » à 1 colonne`,
  twoColsShort: "2 col.",
  oneColShort: "1 col.",
  libraryTitle: "Bibliothèque de widgets",
  libraryAllShown: "Tous les widgets du catalogue sont déjà affichés sur le tableau de bord.",
  libraryDefaultSize: (size: number) =>
    `(${size === 2 ? "2 colonnes" : "1 colonne"} par défaut)`,

  /* ----- Simulateur : toasts et confirmation ----- */
  toastSource: "Tableaux de bord",
  widgetHiddenTitle: "Widget masqué",
  widgetHiddenMsg: (title: string) =>
    `Le widget « ${title} » a été masqué. Retrouvez-le dans la bibliothèque.`,
  widgetAddedTitle: "Widget ajouté",
  widgetAddedMsg: (title: string) =>
    `Le widget « ${title} » a été ajouté en bas du tableau de bord.`,
  resetToastTitle: "Disposition réinitialisée",
  resetToastMsg: "La disposition par défaut a été restaurée et la sauvegarde locale supprimée.",
  confirmResetTitle: "Réinitialiser la disposition ?",
  confirmResetMessage:
    "Le tableau de bord reviendra à sa disposition par défaut (5 widgets) et la sauvegarde locale sera supprimée. Cette action est immédiate.",
  confirmResetLabel: "Réinitialiser",
  cancelLabel: "Annuler",

  /* ----- simulateur/page.tsx ----- */
  simPageTitle: "Simulateur — Tableaux de bord",
  simPageDescription:
    "Cinq widgets affichés par défaut, huit au catalogue. Cliquez sur « Personnaliser » pour réordonner (↑ / ↓), redimensionner (⤢, 1 ou 2 colonnes), masquer ou ajouter des widgets depuis la bibliothèque. Votre disposition est sauvegardée localement et restaurée à la prochaine visite.",

  /* ----- documentation/page.tsx ----- */
  docPageTitle: "Documentation — Tableaux de bord",
  docPageDescription:
    "Tableau de bord à widgets personnalisable : catalogue de widgets, modèle de configuration (ordre, taille, visibilité) et persistance de la disposition.",
  catalogTitle: "Catalogue de widgets",
  catalogIntroBeforeCode:
    "Le catalogue définit les widgets disponibles : chaque entrée associe un identifiant stable, un titre, une taille par défaut et une fonction de rendu vers un vrai composant ",
  catalogIntroAfterCode:
    ". Les widgets non placés sur la grille restent disponibles dans la bibliothèque (visible en mode personnalisation).",
  colId: "Identifiant",
  colType: "Type",
  colWidget: "Widget",
  colDefaultSize: "Taille par défaut",
  oneColumn: "1 colonne",
  twoColumns: "2 colonnes",
  catalogRows: {
    "metric-ca": "CA du mois (142,5 k€, +12,3 %)",
    "metric-commandes": "Commandes (1 248, +8 %)",
    "metric-panier": "Panier moyen (114,20 €)",
    "line-ventes": "Ventes — 12 derniers mois",
    "bar-regions": "CA par région (6 régions)",
    "table-top-produits": "Top 5 produits (réf. / nom / CA)",
    "ring-objectif": "Objectif trimestre (78 %)",
    "feed-commandes": "Dernières commandes (4 entrées)",
  },
  configTitle: "Modèle de configuration",
  configBody1:
    "La disposition est un tableau ordonné : l'ordre des entrées est l'ordre d'affichage dans la grille (",
  configBody2: "), ",
  configBody3:
    " vaut 1 ou 2 colonnes, et la visibilité est implicite — un widget absent du tableau est masqué (il apparaît alors dans la bibliothèque). Aucune donnée métier n'est stockée : la configuration ne référence que des identifiants du catalogue.",
  opsTitle: "Opérations de personnalisation",
  opsItems: [
    {
      strong: "Réordonner (↑ / ↓)",
      before: " — permutation de deux entrées adjacentes du tableau ; boutons désactivés aux extrémités.",
      code: "",
      after: "",
    },
    { strong: "Redimensionner (⤢)", before: " — bascule ", code: "size", after: " entre 1 et 2 colonnes." },
    {
      strong: "Masquer",
      before: " — retire l'entrée du tableau ; le widget rejoint la bibliothèque.",
      code: "",
      after: "",
    },
    {
      strong: "Ajouter",
      before: " — ajoute l'entrée en fin de tableau avec la taille par défaut du catalogue.",
      code: "",
      after: "",
    },
    {
      strong: "Réinitialiser",
      before: " — restaure la disposition par défaut et purge la sauvegarde (confirmation via ",
      code: "bpm.confirmModal",
      after: ").",
    },
  ],
  persistTitle: "Persistance",
  persist1a: "Dans le simulateur, la disposition est écrite dans ",
  persist1b: " (clé ",
  persist1c: ") à chaque changement, puis relue au montage via ",
  persist1d:
    ". Le rendu initial utilise toujours la disposition par défaut pour rester identique côté serveur et côté client (SSR-safe) ; la configuration sauvegardée est appliquée juste après l'hydratation, après validation (identifiants connus du catalogue, tailles 1 ou 2, sans doublon — toute valeur invalide est ignorée).",
  persistSnippet: `// Lecture au montage (jamais au render)
useEffect(() => {
  const raw = window.localStorage.getItem("bpm.tableaux-de-bord.layout.v1");
  const stored = raw ? parseStoredLayout(raw) : null; // validation stricte
  if (stored) setLayout(stored);
  setHydrated(true);
}, []);

// Écriture à chaque changement, uniquement après hydratation
useEffect(() => {
  if (!hydrated) return;
  window.localStorage.setItem("bpm.tableaux-de-bord.layout.v1", JSON.stringify(layout));
}, [layout, hydrated]);`,
  persist2a: "En production, remplacer ",
  persist2b: " par un enregistrement par utilisateur (table ",
  persist2c: " : ",
  persist2d: ", ",
  persist2e: " JSON, ",
  persist2f: ") avec la même validation côté serveur ; le suffixe de version de la clé (",
  persist2g: ") permet d'invalider proprement les anciennes dispositions quand le catalogue évolue.",
};

export type ModuleStrings = typeof fr;

const en: ModuleStrings = {
  /* ----- Common ----- */
  moduleTitle: "Dashboards",
  breadcrumbModules: "Modules",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",
  openSimulator: "Open the simulator",
  numberLocale: "en-US",

  /* ----- page.tsx ----- */
  pageDescription:
    "A genuinely customizable widget dashboard: show, hide, reorder and resize 8 widgets (metrics, charts, table, target, order feed). The layout is saved and restored automatically. Try it in the Simulator.",
  categoryBadge: "Data & reporting",
  aboutTitle: "About",
  aboutBody:
    "The Dashboards module lets every user compose their own view: they pick the widgets shown from a catalog (metrics, sales curve, revenue by region, top products, quarterly target, order feed), reorder them, resize them (1 or 2 columns) and hide them. The layout is saved locally and restored on the next visit — everyone gets “their” dashboard back.",
  componentsTitle: "Components used",
  componentsLibrary: "library",
  componentsToolbar: "per-widget toolbar",
  componentsReset: "reset",
  and: "and",
  customizationTitle: "Customization",
  customizationItems: [
    {
      strong: "Customize",
      text: " — turns on edit mode: dashed borders and a toolbar on every widget; “Done” to exit.",
    },
    { strong: "↑ / ↓", text: " — reorders the widgets (buttons disabled at the ends)." },
    { strong: "⤢", text: " — toggles the widget size between 1 and 2 columns." },
    {
      strong: "Hide / Add",
      text: " — moves a widget to the library, or brings it back onto the grid.",
    },
    {
      strong: "Reset layout",
      text: " — returns to the default layout, with explicit confirmation.",
    },
  ],
  simNoteBeforeCode: "The simulator runs entirely locally (seeded data, ",
  simNoteAfterCode:
    " persistence, no API required). In production, replace local persistence with a per-user server-side record. See the ",
  simNoteLinkLabel: "documentation",
  simNoteEnd: " for the widget catalog and the configuration model.",

  /* ----- Simulator: widget catalog ----- */
  months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  widgets: {
    "metric-ca": {
      title: "Monthly revenue",
      description: "Revenue for the current month, with the change vs the previous month.",
    },
    "metric-commandes": {
      title: "Orders",
      description: "Number of orders this month, with the change vs the previous month.",
    },
    "metric-panier": {
      title: "Average order value",
      description: "Average amount per order for the current month.",
    },
    "line-ventes": {
      title: "Sales — last 12 months",
      description: "Monthly revenue trend (€k) over a rolling year.",
    },
    "bar-regions": {
      title: "Revenue by region",
      description: "Revenue breakdown (€k) across the top 6 regions.",
    },
    "table-top-produits": {
      title: "Top 5 products",
      description: "The 5 products generating the most revenue this month.",
    },
    "ring-objectif": {
      title: "Quarterly target",
      description: "Progress toward the quarterly revenue target (Q2 2026).",
    },
    "feed-commandes": {
      title: "Latest orders",
      description: "Feed of the latest orders placed, updated or cancelled.",
    },
  },
  metricCaValue: "€142.5k",
  metricCaDelta: "+12.3%",
  metricCommandesDelta: "+8%",
  metricPanierDelta: "+3.9%",
  vsLastMonth: "vs May 2026",
  tableColRef: "Ref.",
  tableColProduct: "Product",
  tableColRevenue: "Revenue",
  ringPercentLabel: "78% of the Q2 target",
  ringDetail: "€312k achieved out of €400k — 18 days left.",

  /* ----- Simulator: activity feed ----- */
  orderPlaced: "placed order",
  orderModified: "updated order",
  orderCancelled: "cancelled order",
  quantitiesRevised: "quantities revised",

  /* ----- Simulator: action bar, grid, library ----- */
  statusLine: (shown: number, hidden: number) =>
    `${shown} widget${shown === 1 ? "" : "s"} shown · ${hidden} in the library`,
  editingSuffix: " — customize mode active",
  customize: "Customize",
  done: "Done",
  hide: "Hide",
  add: "Add",
  resetLayout: "Reset layout",
  emptyTitle: "Empty dashboard",
  emptyAllHidden: "All widgets are hidden.",
  emptyEditingHint: "Add some from the library below.",
  emptyIdleHint: "Click “Customize”, then add widgets from the library.",
  toolbarLabel: (title: string) => `Tools — ${title}`,
  moveUpLabel: (title: string) => `Move “${title}” up`,
  moveDownLabel: (title: string) => `Move “${title}” down`,
  enlargeLabel: (title: string) => `Expand “${title}” to 2 columns`,
  shrinkLabel: (title: string) => `Shrink “${title}” to 1 column`,
  twoColsShort: "2 col.",
  oneColShort: "1 col.",
  libraryTitle: "Widget library",
  libraryAllShown: "Every widget in the catalog is already shown on the dashboard.",
  libraryDefaultSize: (size: number) =>
    `(${size === 2 ? "2 columns" : "1 column"} by default)`,

  /* ----- Simulator: toasts and confirmation ----- */
  toastSource: "Dashboards",
  widgetHiddenTitle: "Widget hidden",
  widgetHiddenMsg: (title: string) =>
    `The “${title}” widget has been hidden. You can find it in the library.`,
  widgetAddedTitle: "Widget added",
  widgetAddedMsg: (title: string) =>
    `The “${title}” widget has been added to the bottom of the dashboard.`,
  resetToastTitle: "Layout reset",
  resetToastMsg: "The default layout has been restored and the local save deleted.",
  confirmResetTitle: "Reset the layout?",
  confirmResetMessage:
    "The dashboard will return to its default layout (5 widgets) and the local save will be deleted. This takes effect immediately.",
  confirmResetLabel: "Reset",
  cancelLabel: "Cancel",

  /* ----- simulateur/page.tsx ----- */
  simPageTitle: "Simulator — Dashboards",
  simPageDescription:
    "Five widgets shown by default, eight in the catalog. Click “Customize” to reorder (↑ / ↓), resize (⤢, 1 or 2 columns), hide or add widgets from the library. Your layout is saved locally and restored on your next visit.",

  /* ----- documentation/page.tsx ----- */
  docPageTitle: "Documentation — Dashboards",
  docPageDescription:
    "Customizable widget dashboard: widget catalog, configuration model (order, size, visibility) and layout persistence.",
  catalogTitle: "Widget catalog",
  catalogIntroBeforeCode:
    "The catalog defines the available widgets: each entry pairs a stable identifier with a title, a default size and a render function that returns a real ",
  catalogIntroAfterCode:
    " component. Widgets not placed on the grid remain available in the library (visible in customize mode).",
  colId: "Identifier",
  colType: "Type",
  colWidget: "Widget",
  colDefaultSize: "Default size",
  oneColumn: "1 column",
  twoColumns: "2 columns",
  catalogRows: {
    "metric-ca": "Monthly revenue (€142.5k, +12.3%)",
    "metric-commandes": "Orders (1,248, +8%)",
    "metric-panier": "Average order value (€114.20)",
    "line-ventes": "Sales — last 12 months",
    "bar-regions": "Revenue by region (6 regions)",
    "table-top-produits": "Top 5 products (ref / name / revenue)",
    "ring-objectif": "Quarterly target (78%)",
    "feed-commandes": "Latest orders (4 entries)",
  },
  configTitle: "Configuration model",
  configBody1:
    "The layout is an ordered array: the order of its entries is the display order in the grid (",
  configBody2: "), ",
  configBody3:
    " is 1 or 2 columns, and visibility is implicit — a widget missing from the array is hidden (it then appears in the library). No business data is stored: the configuration only references catalog identifiers.",
  opsTitle: "Customization operations",
  opsItems: [
    {
      strong: "Reorder (↑ / ↓)",
      before: " — swaps two adjacent entries of the array; buttons disabled at the ends.",
      code: "",
      after: "",
    },
    { strong: "Resize (⤢)", before: " — toggles ", code: "size", after: " between 1 and 2 columns." },
    {
      strong: "Hide",
      before: " — removes the entry from the array; the widget joins the library.",
      code: "",
      after: "",
    },
    {
      strong: "Add",
      before: " — appends the entry to the array with the catalog's default size.",
      code: "",
      after: "",
    },
    {
      strong: "Reset",
      before: " — restores the default layout and clears the save (confirmation via ",
      code: "bpm.confirmModal",
      after: ").",
    },
  ],
  persistTitle: "Persistence",
  persist1a: "In the simulator, the layout is written to ",
  persist1b: " (key ",
  persist1c: ") on every change, then read back on mount via ",
  persist1d:
    ". The initial render always uses the default layout so it stays identical on the server and the client (SSR-safe); the saved configuration is applied right after hydration, after validation (identifiers known to the catalog, sizes 1 or 2, no duplicates — any invalid value is ignored).",
  persistSnippet: `// Read on mount (never during render)
useEffect(() => {
  const raw = window.localStorage.getItem("bpm.tableaux-de-bord.layout.v1");
  const stored = raw ? parseStoredLayout(raw) : null; // strict validation
  if (stored) setLayout(stored);
  setHydrated(true);
}, []);

// Write on every change, only after hydration
useEffect(() => {
  if (!hydrated) return;
  window.localStorage.setItem("bpm.tableaux-de-bord.layout.v1", JSON.stringify(layout));
}, [layout, hydrated]);`,
  persist2a: "In production, replace ",
  persist2b: " with a per-user record (a ",
  persist2c: " table: ",
  persist2d: ", ",
  persist2e: " JSON, ",
  persist2f: ") with the same server-side validation; the key's version suffix (",
  persist2g: ") makes it possible to cleanly invalidate old layouts when the catalog evolves.",
};

export const STR = { fr, en } as const;
