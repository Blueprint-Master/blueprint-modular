import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import { JsonLd } from "@/components/site/JsonLd";
import { COMPONENT_COUNT } from "../_home/data";
import { McpContent } from "./mcp-content";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  return {
    title: { absolute: dict.mcp.metaTitle },
    description: dict.mcp.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/mcp" },
    openGraph: {
      type: "article",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/mcp",
      title: dict.mcp.metaTitle,
      description: dict.mcp.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.mcp.metaTitle,
      description: dict.mcp.metaDescription,
    },
  };
}

export default async function McpPage() {
  const { dict } = await getDict();

  const techArticle = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: dict.mcp.title,
    description: fmt(dict.mcp.metaDescription, { count: COMPONENT_COUNT }),
    url: "https://blueprint-modular.com/mcp",
    about: "Model Context Protocol",
    keywords: "MCP, Model Context Protocol, Blueprint Modular, connecteur, agents",
    publisher: { "@type": "Organization", name: dict.common.brand },
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://blueprint-modular.com/mcp" },
  };

  return (
    <>
      <JsonLd data={techArticle} />
      <McpContent />
    </>
  );
}
