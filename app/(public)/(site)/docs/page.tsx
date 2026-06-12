import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/lib/generated/bpm-components.json";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";

export const metadata: Metadata = {
  alternates: { canonical: "https://app.blueprint-modular.com/docs" },
};

type CardKey = "gettingStarted" | "catalog" | "gallery" | "llms" | "changelog" | "database";

/** Destinations vérifiées : routes internes réelles + liens externes stables. */
const CARD_HREF: Record<CardKey, { href: string; external: boolean }> = {
  gettingStarted: { href: "/docs/getting-started", external: false },
  catalog: { href: "/docs/components", external: false },
  gallery: { href: "/components", external: false },
  llms: { href: "/llms.txt", external: true },
  changelog: { href: "/docs/changelog", external: false },
  database: {
    href: "https://github.com/Blueprint-Modular/blueprint-modular/blob/master/docs/DATABASE.md",
    external: true,
  },
};

/** Ordre d'affichage des cartes du hub documentation. */
const CARDS: CardKey[] = ["gettingStarted", "catalog", "gallery", "llms", "changelog", "database"];

export default async function DocsPage() {
  const { dict } = await getDict();
  const hub = dict.docsHub;
  const count = registry.components.length;

  const cardBody = (key: CardKey): string => {
    const body = hub.cards[key].body;
    return key === "catalog" ? fmt(body, { count }) : body;
  };

  return (
    <>
      {/* HERO — aligné sur les pages MCP et Ressources (eyebrow + titre + lead) */}
      <section className="site-hero">
        <div className="site-container">
          <span className="site-eyebrow">{hub.eyebrow}</span>
          <h1>{hub.title}</h1>
          <p className="site-lead">{hub.lead}</p>
        </div>
      </section>

      <section className="site-section site-section-bordered">
        <div className="site-container">
          <ul className="site-resource-grid">
            {CARDS.map((key) => {
              const { href, external } = CARD_HREF[key];
              const card = hub.cards[key];
              const inner = (
                <>
                  <span className="site-resource-card-title">
                    {card.title}
                    {external && (
                      <span className="site-resource-ext" aria-hidden="true">
                        ↗
                      </span>
                    )}
                  </span>
                  <span className="site-resource-card-body">{cardBody(key)}</span>
                </>
              );
              return (
                <li key={key}>
                  {external ? (
                    <a
                      className="site-resource-card"
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link className="site-resource-card" href={href}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
