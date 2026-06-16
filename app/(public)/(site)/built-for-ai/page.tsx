import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import { JsonLd } from "@/components/site/JsonLd";
import { COMPONENT_COUNT } from "../_home/data";
import { BuiltForAiContent } from "./built-for-ai-content";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  return {
    title: { absolute: dict.builtForAI.metaTitle },
    description: dict.builtForAI.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/built-for-ai" },
    openGraph: {
      type: "article",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/built-for-ai",
      title: dict.builtForAI.metaTitle,
      description: dict.builtForAI.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.builtForAI.metaTitle,
      description: dict.builtForAI.metaDescription,
    },
  };
}

export default async function BuiltForAiPage() {
  const { dict } = await getDict();

  const techArticle = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: dict.builtForAI.title,
    description: fmt(dict.builtForAI.metaDescription, { count: COMPONENT_COUNT }),
    url: "https://blueprint-modular.com/built-for-ai",
    about: "Model Context Protocol",
    keywords: "MCP, AI agents, suggest_composition, Blueprint Modular, design system",
    publisher: { "@type": "Organization", name: dict.common.brand },
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://blueprint-modular.com/built-for-ai" },
  };

  return (
    <>
      <JsonLd data={techArticle} />
      <BuiltForAiContent />
    </>
  );
}
