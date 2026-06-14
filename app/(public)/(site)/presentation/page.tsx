import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import { JsonLd } from "@/components/site/JsonLd";
import { ValueProps } from "../_home/ValueProps";
import { WhyBpm } from "../_home/WhyBpm";
import { FinalCta } from "../_home/FinalCta";
import { COMPONENT_COUNT, MODULE_COUNT } from "../_home/data";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  return {
    title: { absolute: dict.presentationPage.metaTitle },
    description: dict.presentationPage.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/presentation" },
    openGraph: {
      type: "website",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/presentation",
      title: dict.presentationPage.metaTitle,
      description: dict.presentationPage.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.presentationPage.metaTitle,
      description: dict.presentationPage.metaDescription,
    },
  };
}

/** Pilliers du produit : destinations internes réelles, dans l'ordre du parcours. */
const ECOSYSTEM = [
  { key: "components", href: "/composants" },
  { key: "modules", href: "/modules" },
  { key: "mcp", href: "/mcp" },
  { key: "docs", href: "/docs" },
  { key: "resources", href: "/resources" },
] as const;

export default async function PresentationPage() {
  const { dict } = await getDict();
  const p = dict.presentationPage;
  const counts = { components: COMPONENT_COUNT, modules: MODULE_COUNT };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: p.title,
    description: fmt(p.metaDescription, counts),
    url: "https://blueprint-modular.com/presentation",
    isPartOf: { "@type": "WebSite", name: dict.common.brand, url: "https://blueprint-modular.com/" },
  };

  return (
    <>
      <JsonLd data={webPage} />

      {/* HERO */}
      <section className="site-hero">
        <div className="site-container">
          <span className="site-eyebrow">{p.eyebrow}</span>
          <h1>{p.title}</h1>
          <p className="site-lead">{fmt(p.lead, counts)}</p>
          <div className="site-hero-actions">
            <Link href="/docs/getting-started" className="site-cta-primary">
              {p.ctaPrimary}
            </Link>
            <Link href="/dashboard" className="site-cta-secondary">
              {p.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* CE POUR QUOI C'EST CONÇU (réutilise la thèse produit de l'accueil) */}
      <ValueProps dict={dict} />

      {/* L'ÉCOSYSTÈME — carte des points d'entrée du produit */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{p.ecosystem.title}</h2>
          <p className="site-section-body">{p.ecosystem.lead}</p>
          <ul className="site-resource-grid">
            {ECOSYSTEM.map(({ key, href }) => {
              const card = p.ecosystem.cards[key];
              return (
                <li key={key}>
                  <Link className="site-resource-card" href={href}>
                    <span className="site-resource-card-title">{card.title}</span>
                    <span className="site-resource-card-body">{fmt(card.body, counts)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* POURQUOI (principes — réutilise l'accueil) */}
      <WhyBpm dict={dict} />

      {/* CTA FINAL (réutilise l'accueil) */}
      <FinalCta dict={dict} />
    </>
  );
}
