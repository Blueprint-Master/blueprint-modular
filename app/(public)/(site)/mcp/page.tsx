import type { Metadata } from "next";
import Link from "next/link";
import { Badge, CodeBlock } from "@/components/bpm";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/mcp/meta";
import { TOTAL, CATEGORIES } from "@/lib/mcp/registry";

/**
 * Page publique du connecteur MCP, intégrée au shell du site (nav + footer + i18n).
 * L'endpoint et les outils reflètent la source réelle (lib/mcp/registry.ts,
 * app/api/mcp/route.ts) — jamais de valeur inventée.
 */
const ENDPOINT = "https://blueprint-modular.com/api/mcp";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  return {
    title: { absolute: dict.mcp.metaTitle },
    description: dict.mcp.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/mcp" },
    openGraph: {
      type: "website",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/mcp",
      title: dict.mcp.metaTitle,
      description: dict.mcp.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
  };
}

export default async function McpPage() {
  const { dict } = await getDict();
  const t = dict.mcp;

  return (
    <>
      <section className="site-hero">
        <div className="site-container">
          <h1>{t.title}</h1>
          <p className="site-lead">
            {fmt(t.lead, { count: TOTAL, strong: t.leadStrong })}
          </p>
          <div className="site-showcase-badges" style={{ marginTop: "1rem" }}>
            <Badge variant="success">{t.badgeReadonly}</Badge>
            <Badge variant="primary">{t.badgeNoauth}</Badge>
            <Badge variant="default">{t.badgePublic}</Badge>
          </div>
        </div>
      </section>

      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{t.endpointTitle}</h2>
          <p className="site-section-body">{t.endpointNote}</p>
          <CodeBlock code={`POST ${ENDPOINT}`} language="bash" />
        </div>
      </section>

      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{t.toolsTitle}</h2>
          <p className="site-section-body">{t.toolsNote}</p>
          <ul className="site-module-grid">
            {t.tools.map((tool) => (
              <li className="site-module-card" key={tool.name}>
                <div className="site-module-card-head">
                  <span className="site-module-name site-mono">{tool.name}</span>
                </div>
                <p className="site-mono" style={{ fontSize: "0.8rem", color: "var(--bpm-accent)" }}>
                  ({tool.sig})
                </p>
                <p className="site-module-desc">{tool.desc}</p>
              </li>
            ))}
          </ul>
          <h3 className="site-showcase-subtitle">{t.categoriesTitle}</h3>
          <p className="site-section-body site-mono" style={{ fontSize: "0.85rem" }}>
            {CATEGORIES.join(" · ")}
          </p>
        </div>
      </section>

      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{t.addTitle}</h2>
          <div className="site-split">
            <div>
              <h3 className="site-showcase-subtitle">{t.addClaude}</h3>
              <ol className="site-steps">
                {t.addClaudeSteps.map((step, i) => (
                  <li className="site-step" key={i}>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="site-showcase-subtitle">{t.addChatgpt}</h3>
              <ol className="site-steps">
                {t.addChatgptSteps.map((step, i) => (
                  <li className="site-step" key={i}>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <h3 className="site-showcase-subtitle">{t.testTitle}</h3>
          <p className="site-section-body">{t.testNote}</p>
          <CodeBlock
            code={[
              "URL=http://localhost:3000/api/mcp",
              'curl -s -H "Content-Type: application/json" \\',
              '  -H "Accept: application/json, text/event-stream" -X POST "$URL" \\',
              `  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`,
            ].join("\n")}
            language="bash"
          />
        </div>
      </section>

      <section className="site-section site-section-bordered">
        <div className="site-container">
          <p className="site-section-body">{t.footnote}</p>
          <p className="site-section-body">
            {t.contact} :{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="site-cta-secondary site-mono">
              {CONTACT_EMAIL}
            </a>
          </p>
          <div className="site-hero-actions">
            <Link href="/resources" className="site-cta-secondary">
              {dict.nav.resources}
            </Link>
            <Link href="/docs/components" className="site-cta-secondary">
              {dict.footer.catalog}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
