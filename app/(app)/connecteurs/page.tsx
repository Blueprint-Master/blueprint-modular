import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { STR } from "./strings";
import { ConnecteursListContent } from "./ConnecteursListContent";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const S = STR[locale];
  return {
    title: { absolute: S.metaTitle },
    description: S.metaDescription,
    alternates: { canonical: "https://blueprint-modular.com/connecteurs" },
    openGraph: {
      type: "website",
      url: "https://blueprint-modular.com/connecteurs",
      title: S.metaTitle,
      description: S.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: { card: "summary_large_image", title: S.metaTitle, description: S.metaDescription },
  };
}

export default function ConnecteursPage() {
  return <ConnecteursListContent />;
}
