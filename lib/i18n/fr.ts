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
    modules: "Modules",
    docs: "Documentation",
    gettingStarted: "Démarrage",
    resources: "Ressources",
    mcp: "MCP",
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
    modules: "Modules métier",
    gettingStarted: "Démarrage",
    changelog: "Changelog",
    resourcesHub: "Toutes les ressources",
    mcp: "Connecteur MCP",
    llms: "llms.txt — référence machine",
    llmsCore: "llms-core.txt",
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
    showcase: {
      liveTitle: "Le rendu réel, pas des captures.",
      liveBody:
        "Chaque tuile ci-dessous est un composant du package, monté en direct sur cette page. Survolez, lisez, comparez : c'est exactement ce que votre application affichera.",
      families: {
        dataDisplay: "Affichage de données",
        layout: "Mise en page",
        interaction: "Interaction",
        feedback: "Feedback",
        navigation: "Navigation",
        media: "Média",
        charts: "Graphiques",
        utilities: "Utilitaires",
        identity: "Identification & traçabilité",
        ai: "IA & spécialisés",
      },
      tiles: {
        metric: "Métrique",
        status: "Suivi de statut",
        gauge: "Jauge à seuils",
        progress: "Progression",
        approval: "Flux d'approbation",
        activity: "Flux d'activité",
        anomaly: "Détection d'anomalie",
      },
      progressLabel: "Objectif trimestriel",
      badgeReview: "À revoir",
      approver1: "Marie Dupont",
      role1: "Responsable",
      approver2: "Jean Martin",
      role2: "Direction",
      activityAction: "a validé",
      activityTarget: "le devis DV-001",
      anomalyTitle: "Écart de stock détecté",
      anomalyExpected: "100 unités",
      anomalyActual: "85 unités",
    },
    modules: {
      title: "{count} modules métier prêts à brancher.",
      body:
        "Au-delà des composants, Blueprint Modular livre des modules complets — assemblés, documentés et testables en ligne. Chacun dispose d'une page avec documentation et simulateur.",
      cta: "Explorer les modules",
      categories: {
        auth: "Authentification",
        content: "Contenu & productivité",
        data: "Données & reporting",
        process: "Processus & workflow",
        integrations: "Intégrations & technique",
        business: "Métier",
      },
      descriptions: {
        auth: "Connexion Google et e-mail, sessions, whitelist utilisateurs.",
        content: "Calendrier, wiki, templates, newsletter, tableau blanc, monitor…",
        data: "Tableaux de bord, rapports, référentiels, analyse de documents, exports.",
        process: "Tâches, workflow, notifications, audit log, validations.",
        integrations: "Connecteurs, webhooks, multi-langue, thèmes, assistant IA.",
        business: "Catalogue produits, devis & facturation, formulaires, réservations.",
      },
    },
    whyBpm: {
      title: "Pourquoi Blueprint Modular ?",
      points: [
        {
          title: "Une seule source de vérité",
          body:
            "Le site, le catalogue et llms.txt sont générés depuis le code TypeScript. Aucune divergence possible entre la doc et le composant.",
        },
        {
          title: "Accessibilité et thèmes inclus",
          body:
            "Contrastes, focus visibles, rôles ARIA, clair et sombre : tout est intégré aux composants, pas ajouté après coup.",
        },
        {
          title: "Aucun build front à maintenir",
          body:
            "Le package Python embarque le React déjà compilé. Pas de Node, pas de bundler, pas de fichier de configuration à entretenir.",
        },
        {
          title: "Pensé pour les agents",
          body:
            "Toute la surface d'API est lisible par un LLM. Votre agent construit, complète et corrige l'interface sans deviner.",
        },
      ],
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          q: "Faut-il connaître React ?",
          a: "Non. Vous écrivez du Python ; les composants React sont déjà compilés dans le package et s'appellent comme des fonctions.",
        },
        {
          q: "Peut-on personnaliser le thème ?",
          a: "Oui. Couleurs, logo et mode clair/sombre passent par les tokens de design ; le module Thèmes permet un rendu par instance ou par client.",
        },
        {
          q: "Comment mon agent utilise-t-il la bibliothèque ?",
          a: "Donnez-lui llms.txt : il y trouve chaque composant avec ses props, types, valeurs par défaut et exemples, dans un format pensé pour son contexte.",
        },
        {
          q: "Quelle base de données faut-il ?",
          a: "Chaque module documente ses tables Prisma et ses variables d'environnement. Voir docs/DATABASE.md dans le dépôt pour les prérequis de production.",
        },
        {
          q: "Est-ce prêt pour la production ?",
          a: "Oui. Les modules métier sont assemblés et documentés, avec authentification, audit et déploiement décrits — ce site tourne sur ses propres composants.",
        },
      ],
    },
    cta: {
      title: "Prêt à écrire votre première interface ?",
      body:
        "Installez le package, lancez bpm run, et servez une application métier complète — sans toucher au HTML.",
      primary: "Commencer",
      secondary: "Voir les composants",
    },
  },
  homeDemo: {
    revenue: "CA mensuel",
    orders: "Commandes",
    gaugeLabel: "Charge ligne 2",
    stageCreated: "Créé",
    stageAnalysis: "En analyse",
    stageValidation: "Validation",
    stageClosed: "Clôturé",
    statusOk: "Opérationnel",
  },
  gallery: {
    title: "Galerie de composants",
    caption: "{count} composants bpm.* en rendu réel",
    ariaSections: "Sections de la galerie",
    sections: {
      typography: "Typographie",
      button: "Button",
      feedback: "Feedback & statuts",
      forms: "Saisie",
      layout: "Mise en page & conteneurs",
      data: "Données & visualisation",
      navigation: "Navigation",
      overlays: "Overlays & interactions",
      media: "Médias & utilitaires",
      business: "Systèmes métier",
      specialized: "Spécialisés",
    },
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
  componentPage: {
    apiTitle: "Référence d'API",
    apiNote:
      "Extrait de llms.txt, généré depuis les sources TypeScript — la même référence que lisent les agents.",
  },
  mcp: {
    metaTitle: "Connecteur MCP — Blueprint Modular",
    metaDescription:
      "Serveur MCP public, read-only, qui expose le catalogue de composants Blueprint Modular à Claude, ChatGPT et tout hôte MCP. Sans authentification.",
    title: "Connecteur MCP",
    lead:
      "Un serveur {strong} qui expose le catalogue de {count} composants à Claude, ChatGPT et tout hôte MCP, via le transport Streamable HTTP. Aucune authentification : le catalogue est une donnée publique.",
    leadStrong: "MCP public, en lecture seule,",
    badgeReadonly: "Lecture seule",
    badgeNoauth: "Sans authentification",
    badgePublic: "Catalogue public",
    endpointTitle: "Endpoint",
    endpointNote: "Transport Streamable HTTP, sans état. SSE désactivé (déprécié par la spec MCP).",
    toolsTitle: "Outils exposés",
    toolsNote:
      "Quatre outils en lecture seule (readOnlyHint). Aucune écriture, aucune action, aucune exposition de données internes.",
    tools: [
      {
        name: "list_components",
        sig: "category?, cursor?",
        desc: "Liste paginée (curseur) des composants : nom et description en une ligne, filtrable par catégorie.",
      },
      {
        name: "search_components",
        sig: "query, cursor?",
        desc: "Recherche paginée par pertinence (nom, description, catégorie, tags).",
      },
      {
        name: "get_component",
        sig: "name",
        desc: "Détail d'un composant : description, props et types, exemple d'usage, composants associés.",
      },
      {
        name: "suggest_composition",
        sig: "need, limit?",
        desc: "Suggère des composants répondant à un besoin décrit en langage naturel.",
      },
    ],
    categoriesTitle: "Catégories couvertes",
    addTitle: "Ajouter le connecteur",
    addClaude: "Dans Claude",
    addClaudeSteps: [
      "Settings → Connectors → Add custom connector.",
      "Name : Blueprint Modular.",
      "Remote MCP server URL : l'endpoint ci-dessus.",
      "Aucune authentification à configurer.",
    ],
    addChatgpt: "Dans ChatGPT (developer mode)",
    addChatgptSteps: [
      "Settings → Connectors → Advanced → Developer mode.",
      "Create / Add custom connector.",
      "MCP Server URL : l'endpoint ci-dessus, authentification : None.",
    ],
    testTitle: "Tester en local",
    testNote:
      "En développement, l'endpoint est servi sur http://localhost:3000/api/mcp par npm run dev. Inspectez-le avec MCP Inspector (Transport : Streamable HTTP, Auth : none).",
    footnote:
      "Endpoint de santé : GET /api/health. Confidentialité : /privacy. Une seule application sert le site et le connecteur.",
    contact: "Contact",
  },
  resources: {
    metaTitle: "Ressources — Blueprint Modular",
    metaDescription:
      "Documentation, guides, référence d'API et connecteur MCP de Blueprint Modular. Tout ce qu'il faut pour construire, livrer et automatiser.",
    title: "Ressources",
    lead:
      "Toute la documentation, les guides et les références machine pour construire, livrer et automatiser avec Blueprint Modular. Les liens pointent vers des pages réelles de ce site.",
    externalBadge: "Externe",
    groups: {
      docs: {
        title: "Documentation",
        desc: "Comprendre le produit et démarrer une application.",
      },
      guides: {
        title: "Guides & modules",
        desc: "Composants en situation et modules métier prêts à brancher.",
      },
      api: {
        title: "Référence machine",
        desc: "La surface d'API complète, générée depuis le code — lisible par les agents.",
      },
      mcp: {
        title: "Connecteur MCP",
        desc: "Brancher le catalogue directement dans Claude, ChatGPT et tout hôte MCP.",
      },
    },
    cards: {
      docsHub: { title: "Hub documentation", body: "Vue d'ensemble, parcours d'installation et liens structurés." },
      gettingStarted: { title: "Démarrage", body: "Installer, première app, premier composant — en trois étapes." },
      catalog: { title: "Catalogue des composants", body: "Les composants du registre : descriptions, catégories, aperçus live." },
      changelog: { title: "Changelog", body: "Versions, ajouts et corrections du package." },
      gallery: { title: "Galerie de composants", body: "Chaque composant rendu en situation réelle, avec ses variantes." },
      modules: { title: "Modules métier", body: "Modules assemblés et documentés, chacun avec sa page et son simulateur." },
      database: { title: "Prérequis production", body: "Tables Prisma par module, variables d'environnement, déploiement." },
      llms: { title: "llms.txt", body: "La référence machine complète, générée depuis les sources TypeScript." },
      llmsCore: { title: "llms-core.txt", body: "Version condensée : l'essentiel de l'API en quelques milliers de tokens." },
      pypi: { title: "Package PyPI", body: "Installer blueprint-modular depuis l'index Python officiel." },
      mcpConnector: { title: "Connecteur MCP", body: "Endpoint public read-only, quatre outils, sans authentification." },
    },
  },
};

export default fr;
