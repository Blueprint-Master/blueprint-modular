/**
 * Dictionnaire FR — source des types pour la parité FR/EN.
 * Toute clé ajoutée ici doit exister dans en.ts (vérifié par TypeScript).
 * Placeholders : {nom} interpolé via fmt() de lib/i18n.
 */
const fr = {
  common: {
    brand: "Blueprint Modular",
    tagline: "Composants métier pilotés depuis Python.",
    installCommand: "npm i @blueprint-modular/core",
    openApp: "Ouvrir l'app",
    rendered: "Rendu",
    code: "Code",
  },
  nav: {
    gallery: "Composants",
    modules: "Modules",
    mcp: "MCP",
    resources: "Ressources",
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
    modules: "Modules métier",
    catalog: "Catalogue",
    gettingStarted: "Démarrage",
    changelog: "Changelog",
    docs: "Documentation",
    resourcesHub: "Ressources & guides",
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
    mcpTeaser: {
      eyebrow: "Model Context Protocol",
      title: "Vos agents lisent le catalogue, en direct.",
      body:
        "Le connecteur MCP expose les {count} composants à Claude et à tout hôte MCP — props, exemples, compositions — en lecture seule, sans authentification ni donnée personnelle.",
      cta: "Découvrir le connecteur MCP",
    },
    resourcesTeaser: {
      eyebrow: "Ressources",
      title: "Documentation, guides et référence, réunis.",
      body:
        "Un seul point d'entrée vers la documentation, les guides de démarrage, le catalogue des composants, la référence machine et le connecteur MCP.",
      cta: "Ouvrir les ressources",
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
    lead: "Deux surfaces réelles, toutes deux publiées. Commencez par React (live, exposé au MCP) ; le CLI Python est disponible pour piloter une app depuis un script.",
    reactTrack: {
      label: "React / JSX — disponible aujourd'hui",
      body: "La surface mise en avant : le paquet npm @blueprint-modular/core expose l'objet bpm et les composants en JSX. C'est la surface lue par le connecteur MCP. Installez, importez la feuille de style, composez.",
      usageNote: "N'oubliez pas la feuille de style : import '@blueprint-modular/core/dist/style.css'.",
    },
    pythonTrack: {
      label: "Python — disponible (CLI bpm)",
      body: "Le paquet PyPI blueprint-modular fournit l'objet bpm et le CLI (bpm init / run / build). Idéal pour piloter une application de données depuis un simple script Python.",
    },
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
      "Serveur MCP public et read-only qui expose le catalogue de composants Blueprint Modular à Claude et à tout hôte MCP. Sans authentification, sans donnée personnelle.",
    eyebrow: "Model Context Protocol",
    title: "Le catalogue Blueprint Modular, ouvert à vos agents.",
    lead:
      "Le connecteur MCP expose les {count} composants du package à Claude, ChatGPT et tout hôte compatible Model Context Protocol. En lecture seule, sans authentification, sans donnée personnelle.",
    endpointLabel: "Endpoint public",
    ctaComponents: "Voir les composants en direct",
    ctaDocs: "Lire la documentation",
    whatTitle: "Un connecteur en lecture seule",
    whatBody:
      "Le serveur expose le registre @blueprint-modular/core via JSON-RPC 2.0 sur un transport Streamable HTTP/SSE. Vos agents interrogent le catalogue — noms, descriptions, props, exemples — sans jamais écrire ni accéder à des données privées.",
    propsTitle: "Ce que garantit le connecteur",
    props: {
      readonly: {
        title: "Lecture seule",
        body: "Aucune écriture, aucune mutation. Le connecteur ne fait qu'exposer le catalogue.",
      },
      noauth: {
        title: "Sans authentification",
        body: "Aucune clé, aucun jeton. L'endpoint est public et immédiatement utilisable.",
      },
      nopii: {
        title: "Sans donnée personnelle",
        body: "Seules les métadonnées de composants transitent. Aucune information privée ni interne.",
      },
      count: {
        title: "{count} composants",
        body: "Tout le registre, filtrable par catégorie et interrogeable en langage naturel.",
      },
    },
    toolsTitle: "Quatre outils exposés",
    toolsBody: "Chaque outil renvoie une réponse paginée et bornée, pensée pour le contexte d'un LLM.",
    toolSigLabel: "Signature",
    tools: {
      list_components: "Liste paginée des composants : nom et description, filtrable par catégorie.",
      search_components: "Recherche par pertinence sur le nom, la description, la catégorie et les tags.",
      get_component: "Détail d'un composant : description, props et types, exemple d'usage, composants associés.",
      suggest_composition: "Suggère des composants répondant à un besoin décrit en langage naturel.",
    },
    addTitle: "Ajouter le connecteur",
    addBody:
      "Le connecteur fonctionne avec tout client MCP. Voici la marche à suivre pour Claude et pour un hôte générique.",
    addClaude: {
      title: "Dans Claude",
      steps: [
        "Ouvrez Réglages → Connecteurs.",
        "Choisissez « Ajouter un connecteur personnalisé ».",
        "Collez l'URL de l'endpoint ci-dessus — aucune authentification à configurer.",
        "Validez : les quatre outils apparaissent dans vos conversations.",
      ],
    },
    addGeneric: {
      title: "Dans tout hôte MCP",
      steps: [
        "Déclarez un serveur MCP distant pointant vers l'endpoint.",
        "Transport : Streamable HTTP (SSE). Authentification : aucune.",
        "Listez les outils via tools/list, puis appelez-les via tools/call.",
      ],
    },
    exampleTitle: "Premier appel",
    exampleBody: "Une requête initialize en JSON-RPC 2.0 suffit à ouvrir la session :",
    linksTitle: "Aller plus loin",
    linkCatalog: "Catalogue des composants",
    linkGallery: "Galerie live",
  },
  resources: {
    metaTitle: "Ressources & guides — Blueprint Modular",
    metaDescription:
      "Documentation, guides de démarrage, catalogue de composants, référence machine et connecteur MCP : tout pour construire avec Blueprint Modular.",
    eyebrow: "Ressources",
    title: "Tout pour construire avec Blueprint Modular.",
    lead:
      "Documentation, guides pas à pas, catalogue de composants, référence machine pour vos agents et connecteur MCP — rassemblés en un seul point d'entrée.",
    externalLabel: "Lien externe",
    groups: {
      documentation: "Documentation",
      components: "Composants & modules",
      agents: "Pour les agents IA",
    },
    cards: {
      docsHome: {
        title: "Documentation",
        body: "Le point d'entrée : installation, concepts et parcours complet.",
      },
      gettingStarted: {
        title: "Démarrage",
        body: "De l'installation à la première application qui tourne, en trois étapes.",
      },
      changelog: {
        title: "Changelog",
        body: "Versions, ajouts et corrections du package.",
      },
      pypi: {
        title: "Package PyPI",
        body: "pip install blueprint-modular — le package et son interface en ligne de commande.",
      },
      catalog: {
        title: "Catalogue des composants",
        body: "Les {count} composants du registre : descriptions, catégories et aperçus.",
      },
      gallery: {
        title: "Galerie live",
        body: "Chaque composant rendu en situation réelle, avec ses variantes et compositions.",
      },
      modules: {
        title: "Modules métier",
        body: "Des briques complètes — wiki, devis, gestion de parc — documentées et simulables.",
      },
      mcp: {
        title: "Connecteur MCP",
        body: "Exposez le catalogue à Claude et à tout hôte MCP, en lecture seule.",
      },
      llms: {
        title: "llms.txt",
        body: "La référence machine complète, générée depuis les sources. À donner à votre agent.",
      },
    },
  },
};

export default fr;
