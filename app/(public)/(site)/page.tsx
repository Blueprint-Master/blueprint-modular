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
      title: dict.home.metaTitle,
      description: dict.home.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
  };
}

export default function HomePage() {
  return <HomeContent />;
}
