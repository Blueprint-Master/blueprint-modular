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
    gallery: "Components",
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
    catalog: "Catalog",
    gettingStarted: "Getting started",
    changelog: "Changelog",
    llms: "llms.txt — machine reference",
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
  },
  gallery: {
    title: "Component gallery",
    caption: "{count} bpm.* components, live",
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
    lead: "From zero to a running application, in three steps.",
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
};

export default en;
