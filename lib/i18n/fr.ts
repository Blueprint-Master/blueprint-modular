/**
 * Dictionnaire FR — source des types pour la parité FR/EN.
 * Toute clé ajoutée ici doit exister dans en.ts (vérifié par TypeScript).
 * Placeholders : {nom} interpolé via fmt() de lib/i18n.
 */
const fr = {
  common: {
    brand: "Blueprint Modular",
    tagline: "Composants métier pilotés depuis Python.",
    installCommand: "pip install blueprint-modular",
    openApp: "Ouvrir l'app",
    rendered: "Rendu",
    code: "Code",
  },
  nav: {
    gallery: "Composants",
    docs: "Documentation",
    gettingStarted: "Démarrage",
    ariaMain: "Navigation principale",
    ariaLocale: "Langue du site",
    ariaHome: "Blueprint Modular — accueil",
  },
  footer: {
    product: "Produit",
    resources: "Ressources",
    legal: "Légal",
    gallery: "Galerie de composants",
    catalog: "Catalogue",
    gettingStarted: "Démarrage",
    changelog: "Changelog",
    llms: "llms.txt — référence machine",
    pypi: "Package PyPI",
    privacy: "Confidentialité",
    terms: "Conditions d'utilisation",
    note: "Ce site est construit avec ses propres composants.",
  },
  home: {
    metaTitle: "Blueprint Modular — composants métier pilotés depuis Python",
    metaDescription:
      "Des composants React appelés comme des fonctions Python : tableaux, métriques, workflows, jauges à seuils. Documentés pour les humains, lisibles par les agents.",
    hero: {
      title: "L'interface métier, en un appel de fonction.",
      lead:
        "Blueprint Modular expose {count} composants React — tableaux, métriques, workflows, jauges à seuils — comme de simples fonctions Python. Vous écrivez la logique ; l'interface, la cohérence visuelle et l'accessibilité sont déjà là.",
      ctaPrimary: "Commencer",
      ctaSecondary: "Voir les composants",
      demoCaption: "Rendu réel — ces composants sont ceux du package, pas des captures d'écran.",
    },
    why: {
      title: "Conçu pour les applications métier, pas pour les démos.",
      points: [
        {
          title: "Des composants qui connaissent le métier",
          body:
            "Suivi de statuts, flux d'approbation, jauges à seuils d'alerte, flux d'activité : les états et les règles d'affichage sont intégrés au composant, pas réécrits à chaque écran.",
        },
        {
          title: "Python devant, React dessous",
          body:
            "Chaque composant s'appelle comme une fonction. Pas de HTML, pas de JavaScript, pas de build front à maintenir — et le rendu reste du vrai React, thémable, clair et sombre.",
        },
        {
          title: "Documenté pour les agents",
          body:
            "Toute la surface d'API est publiée dans llms.txt, généré depuis les sources TypeScript. Votre agent y lit les props exactes, les valeurs par défaut et les règles d'usage de chaque composant.",
        },
      ],
    },
    codeDemo: {
      title: "Un appel, un composant.",
      body:
        "Le même objet bpm couvre la saisie, les tableaux, les graphiques et les workflows. Voici l'intégralité du code d'un indicateur avec variation :",
    },
    agents: {
      title: "Votre agent connaît déjà cette bibliothèque.",
      body:
        "llms.txt expose chaque composant — props, types, valeurs par défaut, exemples — dans un format pensé pour le contexte d'un LLM. C'est la même source générée depuis le code qui alimente ce site : une seule vérité, zéro divergence.",
      cta: "Lire llms.txt",
    },
    catalog: {
      title: "{count} composants, dix familles.",
      body:
        "Du bouton au CRUD complet : chaque composant est décrit au catalogue avec son aperçu, et démontré en situation dans la galerie.",
      ctaGallery: "Parcourir la galerie",
      ctaCatalog: "Ouvrir le catalogue",
      countSuffix: "composants",
    },
    install: {
      title: "Installez, écrivez, servez.",
      steps: [
        { title: "Installer", body: "Le package embarque les composants React compilés : aucun outillage front requis." },
        { title: "Créer une app", body: "bpm init génère la structure du projet, prête à éditer." },
        { title: "Lancer", body: "bpm run sert votre application — rechargée à chaque sauvegarde." },
      ],
      cta: "Suivre le guide de démarrage",
    },
  },
  gallery: {
    title: "Galerie de composants",
    caption: "{count} composants bpm.* en rendu réel",
  },
  docsHub: {
    title: "Documentation",
    lead:
      "Tout ce qu'il faut pour construire et livrer une application Blueprint Modular : un parcours d'installation, le catalogue des composants et la référence machine pour vos agents.",
    cards: {
      gettingStarted: {
        title: "Démarrage",
        body: "Installation, première app, premier composant — en trois étapes.",
      },
      catalog: {
        title: "Catalogue des composants",
        body: "Les {count} composants du registre : descriptions, catégories, aperçus live.",
      },
      gallery: {
        title: "Galerie",
        body: "Chaque composant rendu en situation réelle, avec ses variantes et compositions.",
      },
      llms: {
        title: "llms.txt",
        body: "La référence machine complète, générée depuis les sources TypeScript. À donner à votre agent.",
      },
      changelog: {
        title: "Changelog",
        body: "Versions, ajouts et corrections du package.",
      },
      database: {
        title: "Prérequis production",
        body: "Tables Prisma par module, variables d'environnement, déploiement — voir docs/DATABASE.md dans le dépôt.",
      },
    },
  },
  gettingStarted: {
    title: "Démarrage",
    lead: "De zéro à une application qui tourne, en trois étapes.",
    steps: [
      {
        title: "Installer",
        body:
          "Le package Python embarque les composants React compilés. Aucun Node, aucun bundler, aucun fichier de configuration front à installer.",
      },
      {
        title: "Créer une application",
        body: "bpm init génère un projet minimal : un fichier app.py et la configuration nécessaire, rien de plus.",
      },
      {
        title: "Écrire le premier composant",
        body: "Chaque composant est une fonction de l'objet bpm. Lancez avec bpm run : la page se recharge à chaque sauvegarde.",
      },
    ],
    previewLabel: "Aperçu en direct du composant ci-dessus :",
    next: {
      title: "Et ensuite ?",
      catalog: "Parcourez le catalogue pour découvrir les {count} composants disponibles.",
      llms: "Vous travaillez avec un agent ? Donnez-lui llms.txt : il connaîtra toute la surface d'API.",
    },
    backToDocs: "Retour à la documentation",
  },
  catalog: {
    title: "Catalogue",
    lead:
      "Référence des {count} composants, alimentée par le registre du package : noms, descriptions et catégories proviennent de la source générée — jamais saisis à la main. Cliquez sur une carte pour la fiche du composant.",
    searchPlaceholder: "Rechercher un composant…",
    searchAria: "Rechercher un composant par mots-clés",
    breadcrumb: "Catalogue",
  },
};

export default fr;
