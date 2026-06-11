import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { LegalArticle } from "@/components/site/LegalArticle";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  const n = dict.legal.notice;
  return {
    title: { absolute: n.metaTitle },
    description: n.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/legal" },
    openGraph: {
      type: "website",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/legal",
      title: n.metaTitle,
      description: n.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
  };
}

export default async function LegalNoticePage() {
  const { locale, dict } = await getDict();
  const n = dict.legal.notice;
  return (
    <LegalArticle
      dict={dict}
      locale={locale}
      title={n.title}
      intro={n.intro}
      sections={n.sections}
      contactTitle={n.contactTitle}
      contactBody={n.contactBody}
    />
  );
}
