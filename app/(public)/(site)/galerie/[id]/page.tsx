import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { JsonLd } from "@/components/site/JsonLd";
import { getCuratedApp } from "@/lib/gallery/curated";
import { GenerationChain } from "./GenerationChain";

// Même source read-only que /galerie (l'endpoint Maker peut être absent en CI).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const GALLERY_URL = "https://blueprint-modular.com/galerie";
const pageUrl = (id: string) => `${GALLERY_URL}/${encodeURIComponent(id)}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { locale, dict } = await getDict();
  const g = dict.galleryPage;
  const app = await getCuratedApp(id);
  if (!app) return { title: { absolute: g.metaTitle } };

  const title = g.detailMetaTitle.replace("{title}", app.title);
  const description = app.prompt || g.metaDescription;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: pageUrl(id) },
    openGraph: {
      type: "article",
      siteName: dict.common.brand,
      url: pageUrl(id),
      title,
      description,
      locale: locale === "en" ? "en_US" : "fr_FR",
      ...(app.screenshotUrl ? { images: [{ url: app.screenshotUrl }] } : {}),
    },
    twitter: {
      card: app.screenshotUrl ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function GalerieDetailPage({ params }: Props) {
  const { id } = await params;
  const { dict } = await getDict();
  const g = dict.galleryPage;
  const app = await getCuratedApp(id);
  if (!app) notFound();

  // CreativeWork : une app présentée comme œuvre issue d'un prompt déterministe.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: app.title,
    description: app.prompt || g.metaDescription,
    url: pageUrl(id),
    dateCreated: app.createdAt,
    ...(app.screenshotUrl ? { image: app.screenshotUrl } : {}),
    isPartOf: {
      "@type": "CollectionPage",
      name: g.title,
      url: GALLERY_URL,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="site-hero">
        <div className="site-container">
          <span className="site-eyebrow">{g.eyebrow}</span>
          <h1>{app.title}</h1>
          <p className="site-lead">{g.detailLead}</p>
        </div>
      </section>

      <section className="site-section">
        <div className="site-container">
          <GenerationChain
            app={app}
            labels={{
              stepPromptTitle: g.stepPromptTitle,
              stepStructureTitle: g.stepStructureTitle,
              stepAppTitle: g.stepAppTitle,
              narrative: g.narrative,
              entitiesTitle: g.entitiesTitle,
              modulesTitle: g.modulesTitle,
              kpisTitle: g.kpisTitle,
              fieldColLabel: g.fieldColLabel,
              fieldColType: g.fieldColType,
              fieldColRequired: g.fieldColRequired,
              requiredYes: g.requiredYes,
              requiredNo: g.requiredNo,
              fieldsCount: g.fieldsCount,
              moduleColLabel: g.moduleColLabel,
              moduleColEntity: g.moduleColEntity,
              noEntity: g.noEntity,
              screenshotAlt: g.screenshotAlt,
              noShot: g.noShot,
            }}
          />
        </div>
      </section>
    </>
  );
}
