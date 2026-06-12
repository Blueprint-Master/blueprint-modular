import type { Dictionary } from "./index";

/**
 * EN dictionary — typed against the FR structure: a missing key is a compile error.
 */
const en: Dictionary = {
  common: {
    brand: "Blueprint Modular",
    tagline: "Business components driven from Python.",
    installCommand: "pip install blueprint-modular",
    openApp: "Open the app",
    rendered: "Rendered",
    code: "Code",
  },
  nav: {
    presentation: "Overview",
    gallery: "Components",
    modules: "Modules",
    mcp: "MCP",
    resources: "Resources",
    docs: "Documentation",
    gettingStarted: "Getting started",
    ariaMain: "Main navigation",
    ariaLocale: "Site language",
    ariaHome: "Blueprint Modular — home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  footer: {
    product: "Product",
    resources: "Resources",
    legal: "Legal",
    gallery: "Component gallery",
    modules: "Business modules",
    catalog: "Catalog",
    gettingStarted: "Getting started",
    changelog: "Changelog",
    docs: "Documentation",
    resourcesHub: "Resources & guides",
    mcp: "MCP connector",
    llms: "llms.txt — machine reference",
    llmsCore: "llms-core.txt",
    pypi: "PyPI package",
    legalNotice: "Legal notice",
    privacy: "Privacy",
    terms: "Terms of use",
    note: "This site is built with its own components.",
  },
  home: {
    metaTitle: "Blueprint Modular — business components driven from Python",
    metaDescription:
      "React components called like Python functions: tables, metrics, workflows, threshold gauges. Documented for humans, readable by agents.",
    hero: {
      title: "Business interfaces, one function call at a time.",
      lead:
        "Blueprint Modular exposes {count} React components — tables, metrics, workflows, threshold gauges — as plain Python functions. You write the logic; the interface, visual consistency and accessibility are already there.",
      ctaPrimary: "Get started",
      ctaSecondary: "Browse components",
      demoCaption: "Live rendering — these are the package's own components, not screenshots.",
    },
    why: {
      title: "Built for business applications, not demos.",
      points: [
        {
          title: "Components that know the domain",
          body:
            "Status tracking, approval flows, alert-threshold gauges, activity feeds: states and display rules live inside the component, not rewritten on every screen.",
        },
        {
          title: "Python in front, React underneath",
          body:
            "Every component is called like a function. No HTML, no JavaScript, no frontend build to maintain — and the output is real React, themeable, light and dark.",
        },
        {
          title: "Documented for agents",
          body:
            "The entire API surface ships in llms.txt, generated from the TypeScript sources. Your agent reads the exact props, defaults and usage rules of every component.",
        },
      ],
    },
    codeDemo: {
      title: "One call, one component.",
      body:
        "The same bpm object covers inputs, tables, charts and workflows. This is the entire code for a metric with a delta:",
    },
    agents: {
      title: "Your agent already knows this library.",
      body:
        "llms.txt exposes every component — props, types, defaults, examples — in a format designed for an LLM's context window. It is the same code-generated source that powers this site: one truth, zero drift.",
      cta: "Read llms.txt",
    },
    catalog: {
      title: "{count} components, ten families.",
      body:
        "From a button to a full CRUD page: every component is described in the catalog with a preview, and demonstrated in real situations in the gallery.",
      ctaGallery: "Browse the gallery",
      ctaCatalog: "Open the catalog",
      countSuffix: "components",
    },
    install: {
      title: "Install, write, serve.",
      steps: [
        { title: "Install", body: "The package ships the compiled React components: no frontend tooling required." },
        { title: "Create an app", body: "bpm init generates the project structure, ready to edit." },
        { title: "Run", body: "bpm run serves your application — reloaded on every save." },
      ],
      cta: "Follow the getting-started guide",
    },
    showcase: {
      liveTitle: "The real output, not screenshots.",
      liveBody:
        "Each tile is a package component, executed live in your browser — and beneath each one, the exact line that produces it. The code you read is the code that runs. This is exactly what your application will render, pixel for pixel.",
      copy: "Copy",
      copied: "Copied",
      families: {
        dataDisplay: "Data display",
        layout: "Layout",
        interaction: "Interaction",
        feedback: "Feedback",
        navigation: "Navigation",
        media: "Media",
        charts: "Charts",
        utilities: "Utilities",
        identity: "Identification & traceability",
        ai: "AI & specialized",
      },
      tiles: {
        metric: "Metric",
        status: "Status tracker",
        gauge: "Threshold gauge",
        progress: "Progress",
        approval: "Approval flow",
        activity: "Activity feed",
        anomaly: "Anomaly detection",
      },
      progressLabel: "Quarterly target",
      badgeReview: "Needs review",
      approver1: "Marie Dupont",
      role1: "Manager",
      approver2: "Jean Martin",
      role2: "Executive",
      activityAction: "approved",
      activityTarget: "quote DV-001",
      anomalyTitle: "Stock discrepancy detected",
      anomalyExpected: "100 units",
      anomalyActual: "85 units",
    },
    modules: {
      title: "{count} business modules ready to plug in.",
      body:
        "Beyond components, Blueprint Modular ships complete modules — assembled, documented and testable online. Each one has a documentation page and a live simulator.",
      cta: "Explore the modules",
      categories: {
        auth: "Authentication",
        content: "Content & productivity",
        data: "Data & reporting",
        process: "Process & workflow",
        integrations: "Integrations & technical",
        business: "Business",
      },
      descriptions: {
        auth: "Google and e-mail sign-in, sessions, user whitelist.",
        content: "Calendar, wiki, templates, newsletter, whiteboard, monitor…",
        data: "Dashboards, reports, reference data, document analysis, exports.",
        process: "Tasks, workflow, notifications, audit log, approvals.",
        integrations: "Connectors, webhooks, multi-language, themes, AI assistant.",
        business: "Product catalog, quotes & invoicing, forms, bookings.",
      },
    },
    whyBpm: {
      title: "Why Blueprint Modular?",
      points: [
        {
          title: "A single source of truth",
          body:
            "The site, the catalog and llms.txt are generated from the TypeScript code. No possible drift between the docs and the component.",
        },
        {
          title: "Accessibility and themes included",
          body:
            "Contrast, visible focus, ARIA roles, light and dark: it is all built into the components, not bolted on afterwards.",
        },
        {
          title: "No frontend build to maintain",
          body:
            "The Python package ships the already-compiled React. No Node, no bundler, no configuration file to look after.",
        },
        {
          title: "Built for agents",
          body:
            "The entire API surface is readable by an LLM. Your agent builds, completes and fixes the interface without guessing.",
        },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Do I need to know React?",
          a: "No. You write Python; the React components are already compiled in the package and are called like functions.",
        },
        {
          q: "Can the theme be customized?",
          a: "Yes. Colors, logo and light/dark mode go through design tokens; the Themes module enables per-instance or per-client rendering.",
        },
        {
          q: "How does my agent use the library?",
          a: "Hand it llms.txt: it finds every component with its props, types, defaults and examples, in a format designed for its context window.",
        },
        {
          q: "What database does it need?",
          a: "Each module documents its Prisma tables and environment variables. See docs/DATABASE.md in the repository for production prerequisites.",
        },
        {
          q: "Is it production-ready?",
          a: "Yes. The business modules are assembled and documented, with authentication, audit and deployment described — this site runs on its own components.",
        },
      ],
    },
    mcpTeaser: {
      eyebrow: "Model Context Protocol",
      title: "Your agents read the catalog, live.",
      body:
        "The MCP connector exposes the {count} components to Claude and any MCP host — props, examples, compositions — read-only, with no authentication and no personal data.",
      cta: "Discover the MCP connector",
    },
    resourcesTeaser: {
      eyebrow: "Resources",
      title: "Documentation, guides and reference, together.",
      body:
        "A single entry point to the documentation, getting-started guides, component catalog, machine reference and MCP connector.",
      cta: "Open the resources",
    },
    cta: {
      title: "Ready to write your first interface?",
      body:
        "Install the package, run bpm run, and serve a complete business application — without touching any HTML.",
      primary: "Get started",
      secondary: "Browse components",
      contact: "Contact us",
      offer:
        "Open source under the Apache-2.0 license — free, no vendor lock-in. A question, an enterprise need? Get in touch.",
    },
  },
  homeDemo: {
    revenue: "Monthly revenue",
    orders: "Orders",
    gaugeLabel: "Line 2 load",
    stageCreated: "Created",
    stageAnalysis: "In analysis",
    stageValidation: "Validation",
    stageClosed: "Closed",
    statusOk: "Operational",
  },
  presentationPage: {
    metaTitle: "Overview — Blueprint Modular",
    metaDescription:
      "Blueprint Modular at a glance: React components called like Python functions, ready-to-wire business modules, an MCP connector for your agents, and documentation generated from the code.",
    eyebrow: "Overview",
    title: "Blueprint Modular, at a glance.",
    lead:
      "A business-UI library driven from Python: {components} components rendered live, {modules} ready-to-wire modules, an MCP connector for your agents — one source of truth, from code to catalog.",
    ctaPrimary: "Get started",
    ctaSecondary: "Open the app",
    ecosystem: {
      title: "One product, five entry points.",
      lead:
        "Every building block is discovered, tested and documented in the same place. Here's where to start.",
      cards: {
        components: {
          title: "Components",
          body: "The {components} bpm.* components rendered in real situations, with variants and compositions.",
        },
        modules: {
          title: "Business modules",
          body: "{modules} ready-to-wire modules — auth, wiki, monitoring, contracts, dashboards — each with its docs and simulator.",
        },
        mcp: {
          title: "MCP connector",
          body: "The catalog opened to your agents: read-only, no authentication, no personal data.",
        },
        docs: {
          title: "Documentation",
          body: "Install path, detailed catalog and machine reference, from first component to production.",
        },
        resources: {
          title: "Resources",
          body: "Guides, changelog, PyPI package and llms.txt — everything to build, in one entry point.",
        },
      },
    },
  },
  changelogPage: {
    title: "Changelog",
    lead: "Every change, derived from the merged pull request history. Generated from git, never hand-written.",
    backToDocs: "Back to documentation",
    empty: "No entries yet.",
    types: {
      feat: "Feature",
      fix: "Fix",
      perf: "Performance",
      refactor: "Refactor",
      style: "Style",
      docs: "Docs",
      other: "Change",
    },
  },
  gallery: {
    eyebrow: "Components",
    title: "Component gallery",
    caption: "{count} bpm.* components, live",
    ariaSections: "Gallery sections",
    sections: {
      typography: "Typography",
      button: "Button",
      feedback: "Feedback & status",
      forms: "Inputs",
      layout: "Layout & containers",
      data: "Data & visualization",
      navigation: "Navigation",
      overlays: "Overlays & interactions",
      media: "Media & utilities",
      business: "Business systems",
      specialized: "Specialized",
    },
  },
  docsHub: {
    eyebrow: "Documentation",
    title: "Documentation",
    lead:
      "Everything you need to build and ship a Blueprint Modular application: an installation path, the component catalog, and the machine reference for your agents.",
    cards: {
      gettingStarted: {
        title: "Getting started",
        body: "Install, first app, first component — in three steps.",
      },
      catalog: {
        title: "Component catalog",
        body: "The {count} components of the registry: descriptions, categories, live previews.",
      },
      gallery: {
        title: "Gallery",
        body: "Every component rendered in a real situation, with its variants and compositions.",
      },
      llms: {
        title: "llms.txt",
        body: "The complete machine reference, generated from the TypeScript sources. Hand it to your agent.",
      },
      changelog: {
        title: "Changelog",
        body: "Package versions, additions and fixes.",
      },
      database: {
        title: "Production prerequisites",
        body: "Prisma tables per module, environment variables, deployment — see docs/DATABASE.md in the repository.",
      },
    },
  },
  gettingStarted: {
    title: "Getting started",
    lead: "Two real getting-started paths, both published and working. Drive your app in Python (pip + bpm run), or compose the same components in React/JSX.",
    pythonTrack: {
      label: "Python — pip install + bpm run",
      body: "The PyPI package blueprint-modular ships the bpm object and the CLI (bpm init / run / build). Drive a complete data application from a plain Python script — without touching any HTML.",
    },
    reactTrack: {
      label: "React / JSX — @blueprint-modular/core",
      body: "The npm package @blueprint-modular/core exposes the same bpm object and components as JSX. This is the surface read by the MCP connector. Install, import the stylesheet, compose.",
      usageNote: "Don't forget the stylesheet: import '@blueprint-modular/core/dist/style.css'.",
    },
    steps: [
      {
        title: "Install",
        body:
          "The Python package ships the compiled React components. No Node, no bundler, no frontend configuration file to install.",
      },
      {
        title: "Create an application",
        body: "bpm init generates a minimal project: an app.py file and the required configuration, nothing more.",
      },
      {
        title: "Write the first component",
        body: "Every component is a function on the bpm object. Run with bpm run: the page reloads on every save.",
      },
    ],
    previewLabel: "Live preview of the component above:",
    next: {
      title: "What's next?",
      catalog: "Browse the catalog to discover the {count} available components.",
      llms: "Working with an agent? Hand it llms.txt: it will know the entire API surface.",
    },
    backToDocs: "Back to the documentation",
  },
  catalog: {
    title: "Catalog",
    lead:
      "Reference of the {count} components, fed by the package registry: names, descriptions and categories come from the generated source — never typed by hand. Click a card for the component page.",
    searchPlaceholder: "Search a component…",
    searchAria: "Search a component by keywords",
    breadcrumb: "Catalog",
  },
  componentPage: {
    apiTitle: "API reference",
    apiNote:
      "Excerpt from llms.txt, generated from the TypeScript sources — the same reference your agents read.",
    semanticTitle: "Semantic layer",
    semanticNote:
      "What the component means to an agent — values proposed by the loop, ontology curated by a human. Exposed by the MCP connector (get_component).",
    semanticRole: "Role",
    semanticFrame: "Ω frame",
    semanticIndicatorType: "Indicator type",
    semanticDirectionality: "Directionality",
    semanticTemporality: "Temporality",
    semanticGuidanceUse: "When to use",
    semanticGuidancePair: "Pairs with",
    semanticGuidanceAvoid: "Avoid for",
    semanticRelations: "Indicator relations",
    semanticContext: "Expected context",
    semanticStatus: "Status",
    semanticCurationQuestion: "Curation question",
  },
  mcp: {
    metaTitle: "MCP connector — Blueprint Modular",
    metaDescription:
      "Public, read-only MCP server exposing the Blueprint Modular component catalog to Claude and any MCP host. No authentication, no personal data.",
    eyebrow: "Model Context Protocol",
    title: "The Blueprint Modular catalog, open to your agents.",
    lead:
      "The MCP connector exposes the package's {count} components to Claude, ChatGPT and any Model Context Protocol host. Read-only, with no authentication and no personal data.",
    endpointLabel: "Public endpoint",
    ctaComponents: "See the components live",
    ctaDocs: "Read the documentation",
    whatTitle: "A read-only connector",
    whatBody:
      "The server exposes the @blueprint-modular/core registry over JSON-RPC 2.0 on a Streamable HTTP/SSE transport. Your agents query the catalog — names, descriptions, props, examples — without ever writing or accessing private data.",
    propsTitle: "What the connector guarantees",
    props: {
      readonly: {
        title: "Read-only",
        body: "No writes, no mutations. The connector only exposes the catalog.",
      },
      noauth: {
        title: "No authentication",
        body: "No key, no token. The endpoint is public and ready to use immediately.",
      },
      nopii: {
        title: "No personal data",
        body: "Only component metadata flows through. No private or internal information.",
      },
      count: {
        title: "{count} components",
        body: "The whole registry, filterable by category and queryable in natural language.",
      },
    },
    toolsTitle: "Four exposed tools",
    toolsBody: "Each tool returns a paginated, bounded response, designed for an LLM's context window.",
    toolSigLabel: "Signature",
    tools: {
      list_components: "Paginated list of components: name and description, filterable by category.",
      search_components: "Relevance search across name, description, category and tags.",
      get_component: "Component detail: description, props and types, usage example, related components.",
      suggest_composition: "Suggests components matching a need described in natural language.",
    },
    addTitle: "Add the connector",
    addBody:
      "The connector works with any MCP client. Here is how to set it up in Claude and in a generic host.",
    addClaude: {
      title: "In Claude",
      steps: [
        "Open Settings → Connectors.",
        "Choose “Add custom connector”.",
        "Paste the endpoint URL above — no authentication to configure.",
        "Confirm: the four tools appear in your conversations.",
      ],
    },
    addGeneric: {
      title: "In any MCP host",
      steps: [
        "Declare a remote MCP server pointing to the endpoint.",
        "Transport: Streamable HTTP (SSE). Authentication: none.",
        "List the tools via tools/list, then call them via tools/call.",
      ],
    },
    exampleTitle: "First call",
    exampleBody: "A single initialize JSON-RPC 2.0 request opens the session:",
    linksTitle: "Go further",
    linkCatalog: "Component catalog",
    linkGallery: "Live gallery",
  },
  resources: {
    metaTitle: "Resources & guides — Blueprint Modular",
    metaDescription:
      "Documentation, getting-started guides, component catalog, machine reference and MCP connector: everything to build with Blueprint Modular.",
    eyebrow: "Resources",
    title: "Everything to build with Blueprint Modular.",
    lead:
      "Documentation, step-by-step guides, component catalog, machine reference for your agents and the MCP connector — gathered in a single entry point.",
    externalLabel: "External link",
    groups: {
      documentation: "Documentation",
      components: "Components & modules",
      agents: "For AI agents",
    },
    cards: {
      docsHome: {
        title: "Documentation",
        body: "The entry point: installation, concepts and the full path.",
      },
      gettingStarted: {
        title: "Getting started",
        body: "From installation to a running first application, in three steps.",
      },
      changelog: {
        title: "Changelog",
        body: "Package versions, additions and fixes.",
      },
      pypi: {
        title: "PyPI package",
        body: "pip install blueprint-modular — the package and its command-line interface.",
      },
      catalog: {
        title: "Component catalog",
        body: "The {count} components of the registry: descriptions, categories and previews.",
      },
      gallery: {
        title: "Live gallery",
        body: "Every component rendered in a real situation, with its variants and compositions.",
      },
      modules: {
        title: "Business modules",
        body: "Complete building blocks — wiki, quotes, asset management — documented and testable.",
      },
      mcp: {
        title: "MCP connector",
        body: "Expose the catalog to Claude and any MCP host, read-only.",
      },
      llms: {
        title: "llms.txt",
        body: "The complete machine reference, generated from the sources. Hand it to your agent.",
      },
    },
  },
  legal: {
    lastUpdated: "Last updated: {date}",
    backHome: "Back to home",
    nav: {
      notice: "Legal notice",
      privacy: "Privacy",
      terms: "Terms of use",
    },
    notice: {
      metaTitle: "Legal notice — Blueprint Modular",
      metaDescription:
        "Legal notice for Blueprint Modular: publisher, hosting, intellectual property and the package's open-source license.",
      title: "Legal notice",
      intro:
        "This legal notice applies to the Blueprint Modular website and its MCP connector. For any question, write to us at the publisher's address listed in this legal notice.",
      sections: [
        {
          h: "Site publisher",
          p: "This site is published by BEAM Consulting, a single-member limited liability company (SARL à associé unique) with share capital of €500, registered with the Paris Trade and Companies Register under number 930 217 609 (RCS Paris). Registered office: 60 rue François Ier, 75008 Paris, France. SIREN: 930 217 609.",
        },
        {
          h: "Hosting",
          p: "OVH SAS, 2 rue Kellermann, 59100 Roubaix, France — RCS Lille Métropole 424 761 419.",
        },
        {
          h: "Intellectual property",
          p: "The brand, logo and editorial content of the site are the property of the publisher. The component code is distributed under an open-source license (see below). Any reproduction of the editorial content without authorization is prohibited.",
        },
        {
          h: "Package license",
          p: "The @blueprint-modular/core package is released under the Apache-2.0 license. You are free to use, modify and redistribute it under the terms of that license. The full text ships with the package on PyPI and in the repository.",
        },
        {
          h: "Liability",
          p: "The publisher strives to provide accurate, up-to-date information, without guaranteeing completeness or the absence of errors. Use of the site and package is at the user's own responsibility.",
        },
      ],
    },
    privacy: {
      metaTitle: "Privacy policy — Blueprint Modular",
      metaDescription:
        "Blueprint Modular privacy policy: no personal data collected, no tracking cookies, stateless reads of a public catalog. GDPR-compliant.",
      title: "Privacy policy",
      intro:
        "This policy describes how the Blueprint Modular website and its MCP connector handle data. In short: no personal data collected, no tracking cookies.",
      sections: [
        {
          h: "No personal data collected",
          p: "The site and the MCP connector do not request, collect or process any personal data. No authentication is required to browse the showcase or query the catalog: there is no account or profile created for this purpose.",
        },
        {
          h: "Stateless reads of a public catalog",
          p: "Each request to the connector is a stateless read of the public component catalog. The server is strictly read-only: it performs no writes and accesses no private or production data.",
        },
        {
          h: "No storage of conversations",
          p: "The content of your conversations and tool requests is not retained. Ephemeral technical counters per IP address may exist in memory only to apply basic rate limiting; they are neither persisted nor used to identify a user.",
        },
        {
          h: "No sharing with third parties",
          p: "No data is sold, rented or shared with third parties. The service performs no advertising tracking.",
        },
      ],
      cookiesTitle: "Cookies",
      cookiesBody:
        "The site uses no tracking, analytics or advertising cookies. A single technical cookie (bpm-locale) remembers your language choice; it is strictly necessary for operation and does not require prior consent.",
      rgpdTitle: "GDPR and your rights",
      rgpdBody:
        "Since no personal data is collected, there is no processing under the GDPR requiring consent. Should you nonetheless consider that data concerning you has been processed, you have a right of access, rectification and erasure, which you may exercise at the publisher's address listed in the legal notice.",
    },
    terms: {
      metaTitle: "Terms of use — Blueprint Modular",
      metaDescription:
        "Terms of use for the Blueprint Modular site and its MCP connector: purpose, package license, service availability, limitation of liability.",
      title: "Terms of use",
      intro:
        "By using the Blueprint Modular website, its MCP connector or the @blueprint-modular/core package, you accept the terms below.",
      sections: [
        {
          h: "Purpose",
          p: "The site presents the Blueprint Modular component library and exposes a public, read-only MCP connector. The package is distributed via PyPI.",
        },
        {
          h: "Package license",
          p: "The @blueprint-modular/core package is released under the Apache-2.0 license. Your use of the package is governed by that license, which prevails regarding the code.",
        },
        {
          h: "Use of the MCP connector",
          p: "The connector is provided free of charge, read-only and without authentication. Basic rate limiting may apply to preserve service availability. Any abusive use aimed at degrading the service is prohibited.",
        },
        {
          h: "Availability",
          p: "The service is provided “as is”, without any guarantee of continuous availability. The publisher may change, suspend or discontinue all or part of the service without notice.",
        },
        {
          h: "Limitation of liability",
          p: "The publisher cannot be held liable for any direct or indirect damage resulting from the use of the site, connector or package, within the limits permitted by applicable law.",
        },
        {
          h: "Changes to the terms",
          p: "These terms may be updated. The applicable version is the one published on this page at the date of your use.",
        },
      ],
    },
  },
};

export default en;
