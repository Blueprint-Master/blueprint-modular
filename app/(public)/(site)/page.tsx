import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { JsonLd } from "@/components/site/JsonLd";
import { HomeContent } from "./home-content";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  return {
    title: { absolute: dict.home.metaTitle },
    description: dict.home.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/" },
    openGraph: {
      type: "website",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/",
      title: dict.home.metaTitle,
      description: dict.home.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.home.metaTitle,
      description: dict.home.metaDescription,
    },
  };
}

export default async function HomePage() {
  const { dict } = await getDict();

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: dict.common.brand,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Python 3.10+",
    description: dict.home.metaDescription,
    url: "https://blueprint-modular.com/",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.home.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <JsonLd data={softwareApplication} />
      <JsonLd data={faqPage} />
      <HomeContent />
    </>
  );
}
