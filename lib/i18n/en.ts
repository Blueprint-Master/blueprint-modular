import type { Dictionary } from "./index";

/**
 * EN dictionary — typed against the FR structure: a missing key is a compile error.
 */
const en: Dictionary = {
  common: {
    brand: "Blueprint Modular",
    tagline: "Business components driven from Python.",
    installCommand: "npm i @blueprint-modular/core",
    openApp: "Open the app",
    rendered: "Rendered",
    code: "Code",
  },
  nav: {
    gallery: "Components",
    modules: "Modules",
    mcp: "MCP",
    resources: "Resources",
    docs: "Documentation",
    gettingStarted: "Getting started",
    ariaMain: "Main navigation",
    ariaLocale: "Site language",
    ariaHome: "Blueprint Modular — home",
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
        "Every tile below is a package component, mounted live on this page. Hover, read, compare: this is exactly what your application will render.",
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
  gallery: {
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
    lead: "Two real surfaces, both published. Start with React (live, exposed to the MCP); the Python CLI is available to drive an app from a script.",
    reactTrack: {
      label: "React / JSX — available today",
      body: "The featured surface: the npm package @blueprint-modular/core exposes the bpm object and components as JSX. This is the surface read by the MCP connector. Install, import the stylesheet, compose.",
      usageNote: "Don't forget the stylesheet: import '@blueprint-modular/core/dist/style.css'.",
    },
    pythonTrack: {
      label: "Python — available (bpm CLI)",
      body: "The PyPI package blueprint-modular ships the bpm object and the CLI (bpm init / run / build). Ideal to drive a data application from a plain Python script.",
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
};

export default en;
