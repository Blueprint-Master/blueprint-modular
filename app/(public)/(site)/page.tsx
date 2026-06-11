import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
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

export default function HomePage() {
  return <HomeContent />;
}
