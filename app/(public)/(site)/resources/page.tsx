import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { ResourcesContent } from "./resources-content";

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
    twitter: {
      card: "summary_large_image",
      title: dict.resources.metaTitle,
      description: dict.resources.metaDescription,
    },
  };
}

export default function ResourcesPage() {
  return <ResourcesContent />;
}
