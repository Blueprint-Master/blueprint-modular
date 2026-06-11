"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n";
import { COMPONENT_COUNT } from "../_home/data";

export const MCP_ENDPOINT = "https://mcp.blueprint-modular.com/api/mcp";

/** Outils du connecteur : noms et signatures sont des identifiants de code (non traduits). */
const TOOLS = [
  { name: "list_components", sig: "category?, cursor?" },
  { name: "search_components", sig: "query, cursor?" },
  { name: "get_component", sig: "name" },
  { name: "suggest_composition", sig: "need, limit?" },
] as const;

const INITIALIZE_EXAMPLE = `curl -X POST ${MCP_ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": {},
      "clientInfo": { "name": "my-agent", "version": "1.0.0" }
    }
  }'`;

export function McpContent() {
  const { dict } = useI18n();
  const mcp = dict.mcp;

  const propEntries = [
    { key: "readonly", ...mcp.props.readonly },
    { key: "noauth", ...mcp.props.noauth },
    { key: "nopii", ...mcp.props.nopii },
    {
      key: "count",
      title: fmt(mcp.props.count.title, { count: COMPONENT_COUNT }),
      body: mcp.props.count.body,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="site-hero">
        <div className="site-container">
          <span className="site-eyebrow">{mcp.eyebrow}</span>
          <h1>{mcp.title}</h1>
          <p className="site-lead">{fmt(mcp.lead, { count: COMPONENT_COUNT })}</p>
          <div className="site-mcp-endpoint">
            <span className="site-pane-label">{mcp.endpointLabel}</span>
            <code className="site-endpoint">{MCP_ENDPOINT}</code>
          </div>
          <div className="site-hero-actions">
            <Link href="/components" className="site-cta-primary">
              {mcp.ctaComponents}
            </Link>
            <Link href="/docs" className="site-cta-secondary">
              {mcp.ctaDocs}
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT + PROPERTIES */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{mcp.whatTitle}</h2>
          <p className="site-section-body">{mcp.whatBody}</p>
          <h3 className="site-showcase-subtitle">{mcp.propsTitle}</h3>
          <ul className="site-why-grid">
            {propEntries.map((p) => (
              <li className="site-why-card" key={p.key}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TOOLS */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{mcp.toolsTitle}</h2>
          <p className="site-section-body">{mcp.toolsBody}</p>
          <ul className="site-tool-grid">
            {TOOLS.map((tool) => (
              <li className="site-tool-card" key={tool.name}>
                <code className="site-tool-name">
                  {tool.name}
                  <span className="site-tool-sig">({tool.sig})</span>
                </code>
                <p>{mcp.tools[tool.name]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ADD THE CONNECTOR */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{mcp.addTitle}</h2>
          <p className="site-section-body">{mcp.addBody}</p>
          <div className="site-split">
            <div className="site-demo-panel">
              <h3 className="site-step-title">{mcp.addClaude.title}</h3>
              <ol className="site-ordered-steps">
                {mcp.addClaude.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="site-demo-panel">
              <h3 className="site-step-title">{mcp.addGeneric.title}</h3>
              <ol className="site-ordered-steps">
                {mcp.addGeneric.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* INITIALIZE EXAMPLE */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{mcp.exampleTitle}</h2>
          <p className="site-section-body">{mcp.exampleBody}</p>
          <CodeBlock code={INITIALIZE_EXAMPLE} language="bash" />
        </div>
      </section>

      {/* LINKS */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{mcp.linksTitle}</h2>
          <div className="site-hero-actions">
            <Link href="/docs/components" className="site-cta-secondary">
              {mcp.linkCatalog}
            </Link>
            <Link href="/components" className="site-cta-secondary">
              {mcp.linkGallery}
            </Link>
            <Link href="/resources" className="site-cta-secondary">
              {dict.nav.resources}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
