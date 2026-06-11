import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { LegalArticle } from "@/components/site/LegalArticle";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDict();
  const p = dict.legal.privacy;
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/privacy" },
    openGraph: {
      type: "website",
      siteName: dict.common.brand,
      url: "https://blueprint-modular.com/privacy",
      title: p.metaTitle,
      description: p.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
  };
}

export default async function PrivacyPage() {
  const { locale, dict } = await getDict();
  const p = dict.legal.privacy;
  return (
    <LegalArticle
      dict={dict}
      locale={locale}
      title={p.title}
      intro={p.intro}
      sections={p.sections}
      contactTitle={p.contactTitle}
      contactBody={p.contactBody}
    >
      <div className="site-legal-section">
        <h2>{p.cookiesTitle}</h2>
        <p>{p.cookiesBody}</p>
      </div>
      <div className="site-legal-section">
        <h2>{p.rgpdTitle}</h2>
        <p>{p.rgpdBody}</p>
      </div>
    </LegalArticle>
  );
}
