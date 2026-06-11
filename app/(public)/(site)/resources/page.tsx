import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n";

/**
 * Hub de ressources : documentation, guides, référence machine et connecteur MCP.
 * Tous les liens pointent vers des pages/fichiers réels de ce déploiement
 * (routes vérifiées) ou vers des cibles externes explicitement marquées.
 */
type CardKey = keyof Dictionary["resources"]["cards"];
type GroupKey = keyof Dictionary["resources"]["groups"];

type ResourceLink = { card: CardKey; href: string; external?: boolean };

const GROUPS: { group: GroupKey; links: ResourceLink[] }[] = [
  {
    group: "docs",
    links: [
      { card: "docsHub", href: "/docs" },
      { card: "gettingStarted", href: "/docs/getting-started" },
      { card: "catalog", href: "/docs/components" },
      { card: "changelog", href: "/docs/changelog" },
    ],
  },
  {
    group: "guides",
    links: [
      { card: "gallery", href: "/components" },
      { card: "modules", href: "/modules" },
      {
        card: "database",
        href: "https://github.com/Blueprint-Master/blueprint-modular/blob/master/docs/DATABASE.md",
        external: true,
      },
    ],
  },
  {
    group: "api",
    links: [
      { card: "llms", href: "/llms.txt", external: true },
      { card: "llmsCore", href: "/llms-core.txt", external: true },
      { card: "pypi", href: "https://pypi.org/project/blueprint-modular/", external: true },
    ],
  },
  {
    group: "mcp",
    links: [{ card: "mcpConnector", href: "/mcp" }],
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  return {
    title: { absolute: dict.resources.metaTitle },
    description: dict.resources.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/resources" },
    openGraph: {
      type: "website",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/resources",
      title: dict.resources.metaTitle,
      description: dict.resources.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
  };
}

export default async function ResourcesPage() {
  const { dict } = await getDict();
  const t = dict.resources;

  return (
    <>
      <section className="site-hero">
        <div className="site-container">
          <h1>{t.title}</h1>
          <p className="site-lead">{t.lead}</p>
        </div>
      </section>

      {GROUPS.map(({ group, links }) => (
        <section className="site-section site-section-bordered" key={group}>
          <div className="site-container">
            <h2>{t.groups[group].title}</h2>
            <p className="site-section-body">{t.groups[group].desc}</p>
            <ul className="site-module-grid">
              {links.map(({ card, href, external }) => {
                const c = t.cards[card];
                const head = (
                  <div className="site-module-card-head">
                    <span className="site-module-name">{c.title}</span>
                    {external && <span className="site-module-count">{t.externalBadge}</span>}
                  </div>
                );
                return (
                  <li className="site-module-card" key={card}>
                    {external ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="site-resource-link">
                        {head}
                        <p className="site-module-desc">{c.body}</p>
                      </a>
                    ) : (
                      <Link href={href} className="site-resource-link">
                        {head}
                        <p className="site-module-desc">{c.body}</p>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
