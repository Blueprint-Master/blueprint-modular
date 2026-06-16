import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { JsonLd } from "@/components/site/JsonLd";
import { fetchCuratedApps } from "@/lib/gallery/curated";
import { AppsCarousel } from "./AppsCarousel";

// Données read-only consommées au rendu (même source que GET /api/gallery).
// `force-dynamic` : pas de prérendu statique au build (l'endpoint Maker peut
// être absent en CI), et la galerie reste fraîche derrière le cache du fetch.
export const dynamic = "force-dynamic";

const PAGE_URL = "https://blueprint-modular.com/galerie";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  const g = dict.galleryPage;
  return {
    title: { absolute: g.metaTitle },
    description: g.metaDescription,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      type: "website",
      siteName: dict.common.brand,
      url: PAGE_URL,
      title: g.metaTitle,
      description: g.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: g.metaTitle,
      description: g.metaDescription,
    },
  };
}

export default async function GaleriePage() {
  const { dict } = await getDict();
  const g = dict.galleryPage;
  const apps = await fetchCuratedApps();

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: g.title,
    description: g.metaDescription,
    url: PAGE_URL,
    isPartOf: {
      "@type": "WebSite",
      name: dict.common.brand,
      url: "https://blueprint-modular.com/",
    },
  };

  return (
    <>
      <JsonLd data={collection} />

      {/* HERO — eyebrow + titre + accroche */}
      <section className="site-hero">
        <div className="site-container">
          <span className="site-eyebrow">{g.eyebrow}</span>
          <h1>{g.title}</h1>
          <p className="site-lead">{g.lead}</p>
        </div>
      </section>

      {/* CORPS — grille/carrousel de captures, ou état vide neutre */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          {apps.length === 0 ? (
            <p className="apps-gallery-empty">{g.empty}</p>
          ) : (
            <AppsCarousel
              apps={apps}
              labels={{
                promptLabel: g.promptLabel,
                screenshotAlt: g.screenshotAlt,
                noShot: g.noShot,
                prev: g.prev,
                next: g.next,
                viewDetail: g.viewDetail,
              }}
            />
          )}
        </div>
      </section>
    </>
  );
}
