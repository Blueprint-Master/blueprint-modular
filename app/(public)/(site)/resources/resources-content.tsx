"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n";
import { COMPONENT_COUNT } from "../_home/data";

type CardKey =
  | "docsHome"
  | "gettingStarted"
  | "changelog"
  | "pypi"
  | "catalog"
  | "gallery"
  | "modules"
  | "mcp"
  | "llms";

type GroupKey = "documentation" | "components" | "agents";

/** Destinations VÉRIFIÉES : routes internes réelles + liens externes stables. */
const CARD_HREF: Record<CardKey, { href: string; external: boolean }> = {
  docsHome: { href: "/docs", external: false },
  gettingStarted: { href: "/docs/getting-started", external: false },
  changelog: { href: "/docs/changelog", external: false },
  pypi: { href: "https://pypi.org/project/blueprint-modular/", external: true },
  catalog: { href: "/docs/components", external: false },
  gallery: { href: "/components", external: false },
  modules: { href: "/modules", external: false },
  mcp: { href: "/mcp", external: false },
  llms: { href: "/llms.txt", external: true },
};

const GROUPS: { key: GroupKey; cards: CardKey[] }[] = [
  { key: "documentation", cards: ["docsHome", "gettingStarted", "changelog", "pypi"] },
  { key: "components", cards: ["catalog", "gallery", "modules"] },
  { key: "agents", cards: ["mcp", "llms"] },
];

export function ResourcesContent() {
  const { dict } = useI18n();
  const res = dict.resources;

  const cardBody = (key: CardKey): string => {
    const body = res.cards[key].body;
    return key === "catalog" ? fmt(body, { count: COMPONENT_COUNT }) : body;
  };

  return (
    <>
      <section className="site-hero">
        <div className="site-container">
          <span className="site-eyebrow">{res.eyebrow}</span>
          <h1>{res.title}</h1>
          <p className="site-lead">{res.lead}</p>
        </div>
      </section>

      {GROUPS.map((group) => (
        <section className="site-section site-section-bordered" key={group.key}>
          <div className="site-container">
            <h2>{res.groups[group.key]}</h2>
            <ul className="site-resource-grid">
              {group.cards.map((key) => {
                const { href, external } = CARD_HREF[key];
                const card = res.cards[key];
                const inner = (
                  <>
                    <span className="site-resource-card-title">
                      {card.title}
                      {external && (
                        <span className="site-resource-ext" aria-label={res.externalLabel}>
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
                        target="_blank"
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
      ))}
    </>
  );
}
