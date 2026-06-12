/**
 * Chaînes bilingues du module Notification.
 * Parité fr/en garantie par le type : `const en: typeof fr`.
 */

export type NotificationTestType = "info" | "success" | "warning" | "error";

const fr = {
  // Partagé
  moduleName: "Notification",
  breadcrumbModules: "Modules",
  breadcrumbSimulator: "Simulateur",
  breadcrumbDocumentation: "Documentation",
  settingsPath: "Paramètres → Général",

  // Niveaux (listes partagées)
  levelsHeading: "Niveaux",
  level1Name: "Niveau 1",
  level1Desc: " — Haute priorité (ex. erreurs)",
  level2Name: "Niveau 2",
  level2Desc: " — Moyenne (ex. succès, avertissements)",
  level3Name: "Niveau 3",
  level3Desc: " — Basse (ex. info, paramètres sauvegardés)",

  // Boutons de test + messages de démonstration
  btnInfo: "Info",
  btnSuccess: "Succès",
  btnWarning: "Avertissement",
  btnError: "Erreur",
  testTitle: "Test",
  typeLabels: {
    info: "info",
    success: "succès",
    warning: "avertissement",
    error: "erreur",
  } as Record<NotificationTestType, string>,
  moduleTestMessage: (typeLabel: string) =>
    `Notification de test (${typeLabel}) depuis le module bpm.notification.`,
  simulatorTestMessage: (typeLabel: string) =>
    `Notification de test (${typeLabel}) depuis le simulateur bpm.notification.`,
  modulePageName: "Module Notification",
  simulatorPageName: "Simulateur Notification",

  // En-tête de la page module (page.tsx)
  moduleDescription:
    "Historique des notifications, cloche dans le header, niveaux 1 (haute) à 3 (basse). Le niveau minimal affiché est configurable dans Paramètres → Général.",
  badgeModule: "Module",
  readingTime: "⏱ 1 min",
  simulatorLinkLabel: "Simulateur (tester les notifications)",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",

  // Onglet documentation intégré (page.tsx)
  aboutHeading: "À propos",
  aboutBefore:
    "La cloche affiche les notifications récentes (stockées dans le navigateur). Chaque notification a un niveau 1, 2 ou 3 ; le filtre dans ",
  aboutAfter: " permet de n'afficher que les niveaux suffisamment prioritaires.",
  implementHeading: "Comment implanter le module",
  implementIntro1: "Le module repose sur un ",
  implementStrongContext: "contexte React",
  implementIntro2: " et une ",
  implementStrongBell: "cloche dans le header",
  implementIntro3: " déjà intégrée au layout. À faire dans votre app :",
  implementLi1a: "Envelopper l'arbre de l'app avec ",
  implementLi1b: " (ou utiliser ",
  implementLi1c: " qui inclut aussi le toast).",
  implementLi2a: "Dans tout composant enfant, utiliser ",
  implementLi2b: " pour obtenir ",
  implementLi2c: ".",
  implementLi3a: "Appeler ",
  implementLi3b: ". Le niveau (1–3) est déduit automatiquement via ",
  implementLi3c: " si vous ne le fournissez pas.",
  mainFilesLabel: "Fichiers principaux : ",

  // Onglet simulateur intégré (page.tsx) + page simulateur
  testBellHeading: "Tester la cloche",
  testBellIntroShort: "Ajoutez une notification de test puis ouvrez la cloche dans le header.",

  // Page simulateur (simulateur/page.tsx)
  simulatorTitle: "Simulateur — Notification",
  simulatorDescription:
    "Testez les notifications : ajoutez des notifications de test (info, succès, avertissement, erreur) puis ouvrez la cloche dans le header.",
  simulatorIntroBefore:
    "Cliquez sur un bouton pour ajouter une notification de test. Ouvrez ensuite la cloche dans le header pour voir l'historique. Le filtre d'affichage (niveau minimum) se configure dans ",
  simulatorIntroAfter: ".",
  backToModule: "← Retour au module Notification",

  // Page documentation (documentation/page.tsx)
  docTitle: "Documentation — Notification",
  docDescription:
    "Gérez les alertes applicatives avec 3 niveaux de priorité et un historique complet (cloche dans le header).",
  docIntro1: "Les modules Blueprint Modular font partie de l'",
  docIntroStrongApp: "application Next.js",
  docIntro2: ". Il n'y a pas de package séparé par module (pas de ",
  docIntro3: " ni ",
  docIntro4: ") : on installe l'application une fois. Le module Notification ne requiert ",
  docIntroStrongNoDep: "aucune dépendance externe",
  docIntro5:
    " (pas de base dédiée, pas d'API) : uniquement React (contexte + composants). Cette documentation décrit ",
  docIntroStrongInstall: "comment installer",
  docIntro6: " l'app pour utiliser les notifications, ",
  docIntroStrongHow: "comment le module fonctionne",
  docIntro7: ", ",
  docIntroStrongConfig: "comment le paramétrer",
  docIntro8:
    " (filtre d'affichage dans Paramètres, règles de niveau) et comment l'implanter dans votre code (",
  docIntro9: ").",

  howHeading: "Comment fonctionne le module Notification",
  how1: "Le module Notification repose sur un ",
  howStrongContext: "contexte React",
  how2: " (",
  how3: ") et une ",
  howStrongBell: "cloche dans le header",
  how4:
    " déjà intégrée au layout. Les notifications sont stockées dans le navigateur (état React, pas de base de données). Chaque notification a un ",
  howStrongLevel: "niveau",
  how5:
    " (1 = haute priorité, 2 = moyenne, 3 = basse) déduit automatiquement à partir du type (info, success, warning, error) et du titre/page via ",
  how6: ". Le filtre dans ",
  how7:
    " permet de n'afficher que les niveaux suffisamment prioritaires (ex. uniquement erreurs, ou erreurs + succès).",

  installHeading: "Installation et dépendances",
  installP:
    "Le module fait partie de l'application Next.js. Aucune dépendance externe (API, base) n'est requise pour les notifications : uniquement React (contexte + composants). Aucune variable d'environnement spécifique au module Notification.",
  cmdHeading: "Résumé des commandes (installer l'app et utiliser les notifications)",
  afterCmd1: "L'app est déjà enveloppée avec ",
  afterCmd2: " dans ",
  afterCmd3: ", qui inclut ",
  afterCmd4: ". Aucune variable d'environnement spécifique au module Notification.",

  docImplHeading: "Comment l'implanter dans votre code",
  docImplIntro1: "Dans tout composant enfant du layout (déjà sous ",
  docImplIntro2: ") :",
  docImplLi1a: "Utiliser ",
  docImplLi1b: " pour obtenir ",
  docImplLi1c: ".",
  docImplLi2a: "Appeler ",
  docImplLi2b: ". Le niveau (1–3) est déduit automatiquement via ",
  docImplLi2c: " si vous ne fournissez pas ",
  docImplLi2d: ".",

  configHeading: "Paramétrage",
  cfg1Strong: "Filtre d'affichage",
  cfg1a: " : dans ",
  cfg1b:
    ", choisir le niveau minimum à afficher (1 = uniquement haute priorité, 2 = haute + moyenne, 3 = toutes).",
  cfg2Strong: "Règles de niveau",
  cfg2a: " : définies dans ",
  cfg2b: " (LEVEL_RULES). Vous pouvez adapter les règles (ex. titre ",
  cfg2c: " → niveau 3) selon vos besoins.",

  filesHeading: "Fichiers principaux",
  file1Desc1: " — Provider et hook ",
  file1Desc2: ".",
  file3Desc: " — Cloche dans le header et panneau d'historique.",
  file4Desc1: " — Wrapper (NotificationHistoryProvider + toast) utilisé dans ",
  file4Desc2: ".",
};

const en: typeof fr = {
  // Shared
  moduleName: "Notification",
  breadcrumbModules: "Modules",
  breadcrumbSimulator: "Simulator",
  breadcrumbDocumentation: "Documentation",
  settingsPath: "Settings → General",

  // Levels (shared lists)
  levelsHeading: "Levels",
  level1Name: "Level 1",
  level1Desc: " — High priority (e.g. errors)",
  level2Name: "Level 2",
  level2Desc: " — Medium (e.g. successes, warnings)",
  level3Name: "Level 3",
  level3Desc: " — Low (e.g. info, saved settings)",

  // Test buttons + demo messages
  btnInfo: "Info",
  btnSuccess: "Success",
  btnWarning: "Warning",
  btnError: "Error",
  testTitle: "Test",
  typeLabels: {
    info: "info",
    success: "success",
    warning: "warning",
    error: "error",
  } as Record<NotificationTestType, string>,
  moduleTestMessage: (typeLabel: string) =>
    `Test notification (${typeLabel}) from the bpm.notification module.`,
  simulatorTestMessage: (typeLabel: string) =>
    `Test notification (${typeLabel}) from the bpm.notification simulator.`,
  modulePageName: "Notification Module",
  simulatorPageName: "Notification Simulator",

  // Module page header (page.tsx)
  moduleDescription:
    "Notification history, bell in the header, levels 1 (high) to 3 (low). The minimum displayed level can be configured in Settings → General.",
  badgeModule: "Module",
  readingTime: "⏱ 1 min",
  simulatorLinkLabel: "Simulator (test notifications)",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",

  // Embedded documentation tab (page.tsx)
  aboutHeading: "About",
  aboutBefore:
    "The bell shows recent notifications (stored in the browser). Each notification has a level of 1, 2 or 3; the filter in ",
  aboutAfter: " lets you display only the levels with sufficient priority.",
  implementHeading: "How to implement the module",
  implementIntro1: "The module relies on a ",
  implementStrongContext: "React context",
  implementIntro2: " and a ",
  implementStrongBell: "bell in the header",
  implementIntro3: " already integrated into the layout. To do in your app:",
  implementLi1a: "Wrap the app tree with ",
  implementLi1b: " (or use ",
  implementLi1c: ", which also includes the toast).",
  implementLi2a: "In any child component, use ",
  implementLi2b: " to get ",
  implementLi2c: ".",
  implementLi3a: "Call ",
  implementLi3b: ". The level (1–3) is inferred automatically via ",
  implementLi3c: " if you don't provide it.",
  mainFilesLabel: "Main files: ",

  // Embedded simulator tab (page.tsx) + simulator page
  testBellHeading: "Test the bell",
  testBellIntroShort: "Add a test notification, then open the bell in the header.",

  // Simulator page (simulateur/page.tsx)
  simulatorTitle: "Simulator — Notification",
  simulatorDescription:
    "Test notifications: add test notifications (info, success, warning, error), then open the bell in the header.",
  simulatorIntroBefore:
    "Click a button to add a test notification. Then open the bell in the header to see the history. The display filter (minimum level) is configured in ",
  simulatorIntroAfter: ".",
  backToModule: "← Back to the Notification module",

  // Documentation page (documentation/page.tsx)
  docTitle: "Documentation — Notification",
  docDescription:
    "Manage application alerts with 3 priority levels and a complete history (bell in the header).",
  docIntro1: "Blueprint Modular modules are part of the ",
  docIntroStrongApp: "Next.js application",
  docIntro2: ". There is no separate package per module (no ",
  docIntro3: " or ",
  docIntro4: "): you install the application once. The Notification module requires ",
  docIntroStrongNoDep: "no external dependencies",
  docIntro5:
    " (no dedicated database, no API): only React (context + components). This documentation describes ",
  docIntroStrongInstall: "how to install",
  docIntro6: " the app to use notifications, ",
  docIntroStrongHow: "how the module works",
  docIntro7: ", ",
  docIntroStrongConfig: "how to configure it",
  docIntro8:
    " (display filter in Settings, level rules) and how to implement it in your code (",
  docIntro9: ").",

  howHeading: "How the Notification module works",
  how1: "The Notification module relies on a ",
  howStrongContext: "React context",
  how2: " (",
  how3: ") and a ",
  howStrongBell: "bell in the header",
  how4:
    " already integrated into the layout. Notifications are stored in the browser (React state, no database). Each notification has a ",
  howStrongLevel: "level",
  how5:
    " (1 = high priority, 2 = medium, 3 = low) inferred automatically from the type (info, success, warning, error) and the title/page via ",
  how6: ". The filter in ",
  how7:
    " lets you display only the levels with sufficient priority (e.g. errors only, or errors + successes).",

  installHeading: "Installation and dependencies",
  installP:
    "The module is part of the Next.js application. No external dependency (API, database) is required for notifications: only React (context + components). No environment variable is specific to the Notification module.",
  cmdHeading: "Command summary (install the app and use notifications)",
  afterCmd1: "The app is already wrapped with ",
  afterCmd2: " in ",
  afterCmd3: ", which includes ",
  afterCmd4: ". No environment variable is specific to the Notification module.",

  docImplHeading: "How to implement it in your code",
  docImplIntro1: "In any child component of the layout (already under ",
  docImplIntro2: "):",
  docImplLi1a: "Use ",
  docImplLi1b: " to get ",
  docImplLi1c: ".",
  docImplLi2a: "Call ",
  docImplLi2b: ". The level (1–3) is inferred automatically via ",
  docImplLi2c: " if you don't provide ",
  docImplLi2d: ".",

  configHeading: "Configuration",
  cfg1Strong: "Display filter",
  cfg1a: ": in ",
  cfg1b:
    ", choose the minimum level to display (1 = high priority only, 2 = high + medium, 3 = all).",
  cfg2Strong: "Level rules",
  cfg2a: ": defined in ",
  cfg2b: " (LEVEL_RULES). You can adapt the rules (e.g. the title ",
  cfg2c: " → level 3) to suit your needs.",

  filesHeading: "Main files",
  file1Desc1: " — Provider and the ",
  file1Desc2: " hook.",
  file3Desc: " — Bell in the header and history panel.",
  file4Desc1: " — Wrapper (NotificationHistoryProvider + toast) used in ",
  file4Desc2: ".",
};

export const STR = { fr, en } as const;
