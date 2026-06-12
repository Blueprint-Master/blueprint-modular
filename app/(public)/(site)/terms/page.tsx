import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { LegalArticle } from "@/components/site/LegalArticle";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  const t = dict.legal.terms;
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/terms" },
    openGraph: {
      type: "website",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/terms",
      title: t.metaTitle,
      description: t.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
  };
}

export default async function TermsPage() {
  const { locale, dict } = await getDict();
  const t = dict.legal.terms;
  return (
    <LegalArticle
      dict={dict}
      locale={locale}
      title={t.title}
      intro={t.intro}
      sections={t.sections}
    />
  );
}
