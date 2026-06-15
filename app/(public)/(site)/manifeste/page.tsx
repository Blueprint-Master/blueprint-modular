import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { JsonLd } from "@/components/site/JsonLd";

const URL = "https://blueprint-modular.com/manifeste";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  const m = dict.manifestePage;
  return {
    title: { absolute: m.metaTitle },
    description: m.metaDescription,
    alternates: { canonical: URL },
    openGraph: {
      type: "article",
      siteName: dict.common.brand,
      url: URL,
      title: m.metaTitle,
      description: m.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: m.metaTitle,
      description: m.metaDescription,
    },
  };
}

export default async function ManifestePage() {
  const { dict } = await getDict();
  const m = dict.manifestePage;

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: m.title,
    description: m.metaDescription,
    url: URL,
    isPartOf: { "@type": "WebSite", name: dict.common.brand, url: "https://blueprint-modular.com/" },
  };

  return (
    <>
      <JsonLd data={webPage} />

      {/* HERO — eyebrow + thèse + accroche */}
      <section className="site-hero">
        <div className="site-container">
          <span className="site-eyebrow">{m.eyebrow}</span>
          <h1>{m.title}</h1>
          <p className="site-lead">{m.lead}</p>
        </div>
      </section>

      {/* CORPS — typographie de lecture (mêmes primitives que les pages légales) */}
      <section className="site-section">
        <article className="site-container site-legal">
          <p className="site-legal-intro">{m.intro}</p>

          {m.sections.map((s) => (
            <div className="site-legal-section" key={s.h}>
              <h2>{s.h}</h2>
              <p>{s.p}</p>
            </div>
          ))}

          <p className="site-legal-signature">{m.signature}</p>

          <div className="site-hero-actions">
            <Link href="/docs/getting-started" className="site-cta-primary">
              {m.ctaPrimary}
            </Link>
            <Link href="/composants" className="site-cta-secondary">
              {m.ctaSecondary}
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
