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
    presentation: "Présentation",
    gallery: "Composants",
    modules: "Modules",
    mcp: "MCP",
    resources: "Ressources",
    docs: "Documentation",
    gettingStarted: "Démarrage",
    ariaMain: "Navigation principale",
    ariaLocale: "Langue du site",
    ariaHome: "Blueprint Modular — accueil",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
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
    legalNotice: "Mentions légales",
    privacy: "Confidentialité",
    terms: "Conditions d'utilisation",
    note: "Ce site est construit avec ses propres composants.",
    pythonSurface: "Python",
    reactSurface: "React",
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
        "Chaque tuile est un composant du package, exécuté en direct dans votre navigateur — et sous chacune, la ligne exacte qui la produit. Le code que vous lisez est le code qui tourne. C'est ce que votre application affichera, au pixel près.",
      copy: "Copier",
      copied: "Copié",
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
      contact: "Nous contacter",
      offer:
        "Open-source sous licence Apache-2.0 — gratuit, sans verrou propriétaire. Une question, un besoin entreprise ? Écrivez-nous.",
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
  presentationPage: {
    metaTitle: "Présentation — Blueprint Modular",
    metaDescription:
      "Blueprint Modular en un coup d'œil : des composants React appelés comme des fonctions Python, des modules métier prêts à brancher, un connecteur MCP pour vos agents et une documentation générée depuis le code.",
    eyebrow: "Présentation",
    title: "Blueprint Modular, en un coup d'œil.",
    lead:
      "Une bibliothèque d'interfaces métier pilotée depuis Python : {components} composants en rendu réel, {modules} modules prêts à brancher, un connecteur MCP pour vos agents — une seule source de vérité, du code au catalogue.",
    ctaPrimary: "Commencer",
    ctaSecondary: "Ouvrir l'app",
    ecosystem: {
      title: "Un produit, cinq points d'entrée.",
      lead:
        "Chaque brique se découvre, se teste et se documente au même endroit. Voici par où entrer.",
      cards: {
        components: {
          title: "Composants",
          body: "Les {components} composants bpm.* rendus en situation réelle, avec variantes et compositions.",
        },
        modules: {
          title: "Modules métier",
          body: "{modules} modules prêts à brancher — auth, wiki, veille, contrats, tableaux de bord — chacun avec sa doc et son simulateur.",
        },
        mcp: {
          title: "Connecteur MCP",
          body: "Le catalogue ouvert à vos agents : lecture seule, sans authentification, sans donnée personnelle.",
        },
        docs: {
          title: "Documentation",
          body: "Parcours d'installation, catalogue détaillé et référence machine, du premier composant à la mise en production.",
        },
        resources: {
          title: "Ressources",
          body: "Guides, changelog, package PyPI et llms.txt — tout pour construire, réunis en un point d'entrée.",
        },
      },
    },
  },
  changelogPage: {
    title: "Changelog",
    lead: "Chaque évolution, dérivée de l'historique des pull requests fusionnées. Généré depuis git, jamais saisi à la main.",
    backToDocs: "Retour à la documentation",
    empty: "Aucune entrée pour le moment.",
    types: {
      feat: "Nouveauté",
      fix: "Correctif",
      perf: "Performance",
      refactor: "Refactorisation",
      style: "Style",
      docs: "Documentation",
      other: "Évolution",
    },
  },
  gallery: {
    eyebrow: "Composants",
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
    demo: {
      staticPreview: "aperçu statique",
      uploaded: "Sélectionné : {files}",
      wizardDone: "Parcours terminé — onComplete appelé.",
      loggedOut: "Déconnexion (démo) — onLogout appelé.",
      toastReplay: "Rejouer la notification",
    },
  },
  docsHub: {
    eyebrow: "Documentation",
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
    lead: "Deux chemins de démarrage réels, tous deux publiés et fonctionnels. Pilotez votre app en Python (pip + bpm run), ou composez les mêmes composants en React/JSX.",
    pythonTrack: {
      label: "Python — pip install + bpm run",
      body: "Le paquet PyPI blueprint-modular fournit l'objet bpm et le CLI (bpm init / run / build). Pilotez une application de données complète depuis un simple script Python — sans toucher au HTML.",
    },
    reactTrack: {
      label: "React / JSX — @blueprint-modular/core",
      body: "Le paquet npm @blueprint-modular/core expose le même objet bpm et les composants en JSX. C'est la surface lue par le connecteur MCP. Installez, importez la feuille de style, composez.",
      usageNote: "N'oubliez pas la feuille de style : import '@blueprint-modular/core/dist/style.css'.",
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
  modulesCatalog: {
    eyebrow: "Catalogue",
    title: "Modules",
    lead:
      "Les {count} modules disponibles, classés par catégorie. Chaque module dispose d'une page avec documentation et simulateur pour tester en ligne.",
    meta: "{count} modules",
    searchPlaceholder: "Rechercher un module (mots-clés…)",
    searchAria: "Rechercher un module par mots-clés",
    documentation: "Documentation",
    simulator: "Simulateur",
    categories: {
      auth: "Authentification",
      content: "Contenu & productivité",
      data: "Données & reporting",
      process: "Processus & workflow",
      integrations: "Intégrations & technique",
      business: "Métier",
    },
  },
  componentPage: {
    apiTitle: "Référence d'API",
    apiNote:
      "Extrait de llms.txt, généré depuis les sources TypeScript — la même référence que lisent les agents.",
    semanticTitle: "Couche sémantique",
    semanticNote:
      "Ce que le composant signifie pour un agent — valeurs proposées par la boucle, ontologie curée par l'humain. Exposée par le connecteur MCP (get_component).",
    semanticRole: "Rôle",
    semanticFrame: "Frame Ω",
    semanticIndicatorType: "Type d'indicateur",
    semanticDirectionality: "Directionnalité",
    semanticTemporality: "Temporalité",
    semanticGuidanceUse: "Quand l'employer",
    semanticGuidancePair: "S'associe avec",
    semanticGuidanceAvoid: "À éviter pour",
    semanticRelations: "Relations d'indicateurs",
    semanticContext: "Contexte attendu",
    semanticStatus: "Statut",
    semanticCurationQuestion: "Question de curation",
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
  legal: {
    lastUpdated: "Dernière mise à jour : {date}",
    backHome: "Retour à l'accueil",
    nav: {
      notice: "Mentions légales",
      privacy: "Confidentialité",
      terms: "Conditions d'utilisation",
    },
    notice: {
      metaTitle: "Mentions légales — Blueprint Modular",
      metaDescription:
        "Mentions légales de Blueprint Modular : éditeur, hébergement, propriété intellectuelle et licence open-source du package.",
      title: "Mentions légales",
      intro:
        "Les présentes mentions légales s'appliquent au site Blueprint Modular et au connecteur MCP associé. Pour toute question, écrivez-nous à l'adresse de l'éditeur indiquée dans les présentes mentions légales.",
      sections: [
        {
          h: "Éditeur du site",
          p: "Le site est édité par BEAM Consulting, société à responsabilité limitée à associé unique (EURL) au capital de 500 €, immatriculée au Registre du commerce et des sociétés de Paris sous le numéro 930 217 609 (RCS Paris). Siège social : 60 rue François Ier, 75008 Paris, France. SIREN : 930 217 609.",
        },
        {
          h: "Hébergement",
          p: "OVH SAS, 2 rue Kellermann, 59100 Roubaix, France — RCS Lille Métropole 424 761 419.",
        },
        {
          h: "Propriété intellectuelle",
          p: "La marque, le logo et le contenu rédactionnel du site sont la propriété de l'éditeur. Le code des composants est distribué sous licence open-source (voir ci-dessous). Toute reproduction du contenu éditorial sans autorisation est interdite.",
        },
        {
          h: "Licence du package",
          p: "Le package @blueprint-modular/core est publié sous licence Apache-2.0. Vous êtes libre de l'utiliser, le modifier et le redistribuer dans les conditions de cette licence. Le texte complet est disponible avec le package sur PyPI et dans le dépôt.",
        },
        {
          h: "Responsabilité",
          p: "L'éditeur s'efforce de fournir des informations exactes et à jour, sans garantir l'exhaustivité ni l'absence d'erreur. L'usage du site et du package se fait sous la responsabilité de l'utilisateur.",
        },
      ],
    },
    privacy: {
      metaTitle: "Politique de confidentialité — Blueprint Modular",
      metaDescription:
        "Politique de confidentialité de Blueprint Modular : aucune donnée personnelle collectée, aucun cookie de suivi, lectures stateless d'un catalogue public. Conforme au RGPD.",
      title: "Politique de confidentialité",
      intro:
        "Cette politique décrit comment le site Blueprint Modular et son connecteur MCP traitent les données. En résumé : aucune donnée personnelle collectée, aucun cookie de suivi.",
      sections: [
        {
          h: "Aucune donnée personnelle collectée",
          p: "Le site et le connecteur MCP ne demandent, ne collectent ni ne traitent aucune donnée personnelle. Aucune authentification n'est requise pour consulter la vitrine ou interroger le catalogue : il n'y a ni compte, ni profil créé à cette fin.",
        },
        {
          h: "Lectures stateless d'un catalogue public",
          p: "Chaque requête au connecteur est une lecture sans état du catalogue public de composants. Le serveur est strictement read-only : il n'effectue aucune écriture et n'accède à aucune donnée privée ou de production.",
        },
        {
          h: "Aucun stockage des conversations",
          p: "Le contenu de vos conversations et de vos requêtes d'outils n'est pas conservé. Des compteurs techniques éphémères par adresse IP peuvent exister en mémoire le temps d'appliquer une limitation de débit basique ; ils ne sont ni persistés, ni utilisés pour identifier un utilisateur.",
        },
        {
          h: "Aucun partage avec des tiers",
          p: "Aucune donnée n'est vendue, louée ou partagée avec des tiers. Le service ne réalise aucun pistage publicitaire.",
        },
      ],
      cookiesTitle: "Cookies",
      cookiesBody:
        "Le site n'utilise aucun cookie de suivi, de mesure d'audience ni de publicité. Un unique cookie technique (bpm-locale) mémorise votre choix de langue ; il est strictement nécessaire au fonctionnement et ne requiert pas de consentement préalable.",
      rgpdTitle: "RGPD et vos droits",
      rgpdBody:
        "Aucune donnée personnelle n'étant collectée, il n'existe pas de traitement au sens du RGPD nécessitant un consentement. Si vous estimez néanmoins qu'une donnée vous concernant a été traitée, vous disposez d'un droit d'accès, de rectification et d'effacement que vous pouvez exercer à l'adresse de l'éditeur indiquée dans les mentions légales.",
    },
    terms: {
      metaTitle: "Conditions d'utilisation — Blueprint Modular",
      metaDescription:
        "Conditions d'utilisation du site Blueprint Modular et de son connecteur MCP : objet, licence du package, disponibilité du service, limitation de responsabilité.",
      title: "Conditions d'utilisation",
      intro:
        "En utilisant le site Blueprint Modular, son connecteur MCP ou le package @blueprint-modular/core, vous acceptez les conditions ci-dessous.",
      sections: [
        {
          h: "Objet",
          p: "Le site présente la bibliothèque de composants Blueprint Modular et expose un connecteur MCP public en lecture seule. Le package est distribué via PyPI.",
        },
        {
          h: "Licence du package",
          p: "Le package @blueprint-modular/core est publié sous licence Apache-2.0. Votre usage du package est régi par cette licence, qui prévaut pour ce qui concerne le code.",
        },
        {
          h: "Usage du connecteur MCP",
          p: "Le connecteur est fourni gratuitement, en lecture seule et sans authentification. Une limitation de débit basique peut s'appliquer pour préserver la disponibilité du service. Tout usage abusif visant à dégrader le service est interdit.",
        },
        {
          h: "Disponibilité",
          p: "Le service est fourni « en l'état », sans garantie de disponibilité continue. L'éditeur peut faire évoluer, suspendre ou interrompre tout ou partie du service sans préavis.",
        },
        {
          h: "Limitation de responsabilité",
          p: "L'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site, du connecteur ou du package, dans les limites permises par la loi applicable.",
        },
        {
          h: "Évolution des conditions",
          p: "Ces conditions peuvent être mises à jour. La version applicable est celle publiée sur cette page à la date de votre utilisation.",
        },
      ],
    },
  },
};

export default fr;
