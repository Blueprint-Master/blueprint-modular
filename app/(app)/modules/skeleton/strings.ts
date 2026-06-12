/**
 * Chaînes bilingues du module Skeleton.
 * Parité fr/en garantie par le type : `const en: typeof fr`.
 * Les noms techniques (bpm.skeleton, bpm.skeleton_dashboard, props, classes CSS)
 * et les CodeBlocks ne changent pas : seul l'affichage est traduit.
 */

const fr = {
  // Partagé
  breadcrumbModules: "Modules",
  moduleName: "Skeleton",
  openSimulator: "Ouvrir le simulateur",
  documentationLink: "Documentation",
  simulatorLink: "Simulateur",
  backToModules: "← Retour aux modules",
  backToModule: "← Retour au module Skeleton",
  loadingAria: "Chargement",

  // À propos (partagé page.tsx / documentation)
  aboutTitle: "À propos",
  aboutBeforeStrong: "Le module ",
  aboutAfterStrong: " fournit des assemblages de ",
  aboutAfterCode:
    " pour afficher un état de chargement réaliste d'une page complète (en-tête, métriques, cartes, tableau). Réutilisables tels quels ou à adapter à votre layout.",

  // Page module (page.tsx)
  pageDescription:
    "Assemblages de bpm.skeleton pour un chargement de page complet. Testez dans le Simulateur.",
  categoryBadge: "Contenu & productivité",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",
  simuIntro:
    "Aperçu d'un assemblage type. Pour voir le skeleton plein écran en situation de chargement, ouvrez le simulateur.",
  simuBoxBeforeCode:
    "Le simulateur affiche une page entière en skeleton (header, titre, 3 métriques, zone contenu, tableau) construite uniquement avec ",
  simuBoxAfterCode: ".",

  // Simulateur (simulateur/page.tsx)
  simulatorBreadcrumb: "Simulateur",
  simulatorTitle: "Simulateur — Skeleton",
  simulatorDescription:
    "Assemblages bpm.skeleton_* pour chargement de page. Choisissez l'assemblage et les paramètres pour l'aperçu.",
  assemblyLabel: "Assemblage",
  assemblyPlaceholder: "Choisir",
  assemblyOptions: [
    { value: "dashboard", label: "Tableau de bord (bpm.skeleton_dashboard)" },
    { value: "list", label: "Liste (bpm.skeleton_list)" },
    { value: "article", label: "Article (bpm.skeleton_article)" },
    { value: "form", label: "Formulaire (bpm.skeleton_form)" },
    { value: "detail", label: "Fiche détail (bpm.skeleton_detail)" },
    { value: "chart", label: "Graphique (bpm.skeleton_chart)" },
  ],
  metricsLabel: "Métriques",
  tableRowsLabel: "Lignes tableau",
  rowsLabel: "Lignes",
  columnsLabel: "Colonnes",
  fieldsLabel: "Champs",

  // Documentation (documentation/page.tsx)
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Skeleton",
  docDescBeforeCode: "Assemblages de ",
  docDescAfterCode:
    " pour un état de chargement réaliste (en-tête, métriques, tableau). Quand l'utiliser, comment l'intégrer.",
  modulePageLink: "Page du module (Documentation + Simulateur)",
  componentTitle: "Composant bpm.skeleton",
  propsLabel: "Props : ",
  usageGuideTitle: "Guide d'usage",

  whenStrong: "Quand préférer le skeleton au spinner ?",
  whenBody:
    " Utilisez un skeleton lorsque la page a une structure identifiable (tableau, formulaire, article) : le placeholder reproduit cette structure et réduit la perception du temps d'attente. Utilisez un spinner pour des actions ponctuelles (soumission, chargement d'un détail en overlay).",

  buildStrong: "Construire un skeleton fidèle à sa page :",
  buildBody:
    " choisissez l'assemblage nommé correspondant (dashboard, list, article, form, detail, chart) et adaptez le nombre de lignes, colonnes ou métriques. Le simulateur permet de prévisualiser chaque assemblage avec des sliders pour les paramètres.",

  transitionStrong: "Transition vers le contenu :",
  transitionS1: " affichez le skeleton tant que ",
  transitionS2: ", puis le contenu réel. Pour une transition fluide, appliquez ",
  transitionS3: " sur le conteneur skeleton (classe ",
  transitionS4: ") et passez à ",
  transitionS5: " avant de retirer le skeleton du DOM ou de le cacher.",

  implementStrong: "Implémenter la transition :",
  implementS1: " gardez le conteneur avec la classe ",
  implementS2: " (qui a déjà ",
  implementS3:
    " en global). Avant de démonter le skeleton, mettez ",
  implementS4:
    " sur ce conteneur, attendez 200 ms, puis remplacez par le contenu réel ou supprimez le nœud.",

  reduceStrong: "Réduire les animations :",
  reduceS1: " le composant respecte ",
  reduceS2: " (animation désactivée automatiquement). Vous pouvez aussi passer ",
  reduceS3: " pour un skeleton statique (screenshots, tests).",
};

const en: typeof fr = {
  // Shared
  breadcrumbModules: "Modules",
  moduleName: "Skeleton",
  openSimulator: "Open the simulator",
  documentationLink: "Documentation",
  simulatorLink: "Simulator",
  backToModules: "← Back to modules",
  backToModule: "← Back to the Skeleton module",
  loadingAria: "Loading",

  // About (shared page.tsx / documentation)
  aboutTitle: "About",
  aboutBeforeStrong: "The ",
  aboutAfterStrong: " module provides assemblies of ",
  aboutAfterCode:
    " to display a realistic loading state for a full page (header, metrics, cards, table). Reusable as-is or adaptable to your layout.",

  // Module page (page.tsx)
  pageDescription:
    "bpm.skeleton assemblies for a full-page loading state. Try them in the Simulator.",
  categoryBadge: "Content & productivity",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",
  simuIntro:
    "Preview of a typical assembly. To see the skeleton full screen in a loading scenario, open the simulator.",
  simuBoxBeforeCode:
    "The simulator displays an entire page as a skeleton (header, title, 3 metrics, content area, table) built solely with ",
  simuBoxAfterCode: ".",

  // Simulator (simulateur/page.tsx)
  simulatorBreadcrumb: "Simulator",
  simulatorTitle: "Simulator — Skeleton",
  simulatorDescription:
    "bpm.skeleton_* assemblies for page loading. Choose the assembly and parameters for the preview.",
  assemblyLabel: "Assembly",
  assemblyPlaceholder: "Choose",
  assemblyOptions: [
    { value: "dashboard", label: "Dashboard (bpm.skeleton_dashboard)" },
    { value: "list", label: "List (bpm.skeleton_list)" },
    { value: "article", label: "Article (bpm.skeleton_article)" },
    { value: "form", label: "Form (bpm.skeleton_form)" },
    { value: "detail", label: "Detail view (bpm.skeleton_detail)" },
    { value: "chart", label: "Chart (bpm.skeleton_chart)" },
  ],
  metricsLabel: "Metrics",
  tableRowsLabel: "Table rows",
  rowsLabel: "Rows",
  columnsLabel: "Columns",
  fieldsLabel: "Fields",

  // Documentation (documentation/page.tsx)
  docBreadcrumb: "Documentation",
  docTitle: "Documentation — Skeleton",
  docDescBeforeCode: "Assemblies of ",
  docDescAfterCode:
    " for a realistic loading state (header, metrics, table). When to use it and how to integrate it.",
  modulePageLink: "Module page (Documentation + Simulator)",
  componentTitle: "bpm.skeleton component",
  propsLabel: "Props: ",
  usageGuideTitle: "Usage guide",

  whenStrong: "When should you prefer a skeleton over a spinner?",
  whenBody:
    " Use a skeleton when the page has an identifiable structure (table, form, article): the placeholder mirrors that structure and reduces the perceived waiting time. Use a spinner for one-off actions (submitting a form, loading a detail in an overlay).",

  buildStrong: "Building a skeleton that matches your page:",
  buildBody:
    " pick the corresponding named assembly (dashboard, list, article, form, detail, chart) and adjust the number of rows, columns, or metrics. The simulator lets you preview each assembly with sliders for the parameters.",

  transitionStrong: "Transitioning to the content:",
  transitionS1: " show the skeleton while ",
  transitionS2: ", then the real content. For a smooth transition, apply ",
  transitionS3: " to the skeleton container (class ",
  transitionS4: ") and switch to ",
  transitionS5: " before removing the skeleton from the DOM or hiding it.",

  implementStrong: "Implementing the transition:",
  implementS1: " keep the container with the ",
  implementS2: " class (which already has ",
  implementS3: " globally). Before unmounting the skeleton, set ",
  implementS4:
    " on this container, wait 200 ms, then replace it with the real content or remove the node.",

  reduceStrong: "Reducing animations:",
  reduceS1: " the component honors ",
  reduceS2: " (the animation is disabled automatically). You can also pass ",
  reduceS3: " for a static skeleton (screenshots, tests).",
};

export const STR = { fr, en } as const;
