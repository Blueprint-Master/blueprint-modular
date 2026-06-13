/**
 * Chaînes bilingues du module Keep screen on.
 * Parité fr/en garantie par le type : `const en: typeof fr`.
 * Les valeurs techniques (valeurs des durées en minutes, conversion en secondes)
 * ne changent pas : seul l'affichage est traduit.
 */

const fr = {
  // Partagé
  moduleName: "Keep screen on",
  breadcrumbModules: "Modules",
  backToModules: "← Modules",
  documentationLink: "Documentation",

  // Page principale (page.tsx)
  pageTitle: "Keep Screen On",
  pageDescription:
    "Gardez l'écran allumé pendant une présentation, une réunion ou une lecture. Choisissez une durée ou indéfini.",
  badgeCategory: "Module",
  panelTitle: "Durée d'écran allumé",
  durations: [
    { value: 0, label: "Éteint" },
    { value: 5, label: "5 min" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 60, label: "1 h" },
    { value: -1, label: "Indéfini" },
  ] as { value: number; label: string }[],
  checkingSupport: "Vérification du support…",
  unsupportedBefore:
    "Votre navigateur ou la page (HTTP au lieu de HTTPS) ne supporte pas le maintien de l'écran. Utilisez un navigateur récent (Chrome, Edge, Safari) sur une page en ",
  unsupportedStrong: "HTTPS",
  unsupportedAfter: ".",
  wakeLockErrorFallback: "Impossible d'activer le maintien de l'écran.",
  statusOnRemaining: (remaining: string) => `Écran allumé — reste ${remaining}`,
  statusOnIndefinite: "Écran allumé (indéfini)",
  statusOff: "Écran non maintenu",
  visibilityNote:
    "L'écran reste allumé tant que l'onglet est visible. En mode durée, le maintien s'arrête à la fin du compte à rebours.",

  // Documentation (documentation/page.tsx)
  docTitle: "Keep screen on — Documentation",
  docDescription: "Maintien de l'écran allumé avec durée réglable ou indéfinie.",
  docAboutTitle: "À propos",
  docAboutBefore: "Le module ",
  docAboutStrong: "Keep screen on",
  docAboutMiddle: " utilise l'API ",
  docAboutLink: "Screen Wake Lock",
  docAboutAfter:
    " pour empêcher l'écran de s'éteindre ou de passer en veille pendant une présentation, une réunion ou une lecture.",
  docSettingsTitle: "Réglage",
  docSettingOffStrong: "Éteint",
  docSettingOffText:
    " : le navigateur ne maintient pas l'écran (comportement par défaut).",
  docSettingTimedStrong: "5 min, 15 min, 30 min, 1 h",
  docSettingTimedText:
    " : l'écran reste allumé pendant la durée choisie ; un compte à rebours s'affiche. À la fin, le maintien est relâché automatiquement.",
  docSettingIndefiniteStrong: "Indéfini",
  docSettingIndefiniteText:
    " : l'écran reste allumé tant que l'onglet est visible et actif (pas de limite de temps).",
  docVisibilityTitle: "Visibilité de l'onglet",
  docVisibilityText:
    "Si vous changez d'onglet ou minimisez le navigateur, le Wake Lock peut être relâché par le navigateur. Lorsque vous revenez sur l'onglet, le module réactive automatiquement le maintien (en mode indéfini ou si la durée choisie n'est pas encore écoulée).",
  docCompatibilityTitle: "Compatibilité",
  docCompatibilityBefore: "L'API Wake Lock fonctionne uniquement en ",
  docCompatibilityStrong: "HTTPS",
  docCompatibilityAfter:
    " (ou localhost) et est supportée par Chrome, Edge et Safari récents. En HTTP ou sur un navigateur non supporté, un message indique que la fonctionnalité n'est pas disponible.",
  docOpenModule: "Ouvrir Keep screen on",
  docBreadcrumbDocumentation: "Documentation",
};

const en: typeof fr = {
  // Shared
  moduleName: "Keep screen on",
  breadcrumbModules: "Modules",
  backToModules: "← Modules",
  documentationLink: "Documentation",

  // Main page (page.tsx)
  pageTitle: "Keep Screen On",
  pageDescription:
    "Keep the screen awake during a presentation, a meeting, or while reading. Pick a duration or keep it on indefinitely.",
  badgeCategory: "Module",
  panelTitle: "Screen-on duration",
  durations: [
    { value: 0, label: "Off" },
    { value: 5, label: "5 min" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hr" },
    { value: -1, label: "Indefinite" },
  ],
  checkingSupport: "Checking browser support…",
  unsupportedBefore:
    "Your browser or this page (HTTP instead of HTTPS) does not support keeping the screen awake. Use a recent browser (Chrome, Edge, Safari) on a page served over ",
  unsupportedStrong: "HTTPS",
  unsupportedAfter: ".",
  wakeLockErrorFallback: "Could not turn on the screen wake lock.",
  statusOnRemaining: (remaining: string) => `Screen on — ${remaining} left`,
  statusOnIndefinite: "Screen on (indefinite)",
  statusOff: "Screen not kept on",
  visibilityNote:
    "The screen stays awake as long as this tab is visible. In timed mode, the wake lock is released when the countdown ends.",

  // Documentation (documentation/page.tsx)
  docTitle: "Keep screen on — Documentation",
  docDescription: "Keep the screen awake with an adjustable or indefinite duration.",
  docAboutTitle: "About",
  docAboutBefore: "The ",
  docAboutStrong: "Keep screen on",
  docAboutMiddle: " module uses the ",
  docAboutLink: "Screen Wake Lock",
  docAboutAfter:
    " API to prevent the screen from turning off or going to sleep during a presentation, a meeting, or while reading.",
  docSettingsTitle: "Settings",
  docSettingOffStrong: "Off",
  docSettingOffText:
    ": the browser does not keep the screen awake (default behavior).",
  docSettingTimedStrong: "5 min, 15 min, 30 min, 1 hr",
  docSettingTimedText:
    ": the screen stays awake for the chosen duration and a countdown is shown. When it ends, the wake lock is released automatically.",
  docSettingIndefiniteStrong: "Indefinite",
  docSettingIndefiniteText:
    ": the screen stays awake as long as the tab is visible and active (no time limit).",
  docVisibilityTitle: "Tab visibility",
  docVisibilityText:
    "If you switch tabs or minimize the browser, the Wake Lock may be released by the browser. When you return to the tab, the module automatically re-enables it (in indefinite mode, or if the chosen duration has not elapsed yet).",
  docCompatibilityTitle: "Compatibility",
  docCompatibilityBefore: "The Wake Lock API only works over ",
  docCompatibilityStrong: "HTTPS",
  docCompatibilityAfter:
    " (or on localhost) and is supported by recent versions of Chrome, Edge, and Safari. Over HTTP or in an unsupported browser, a message indicates that the feature is unavailable.",
  docOpenModule: "Open Keep screen on",
  docBreadcrumbDocumentation: "Documentation",
};

export const STR = { fr, en } as const;
