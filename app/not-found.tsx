import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

/** Chaîne bilingue locale — portée : page 404 uniquement. Le lien retour réutilise dict.legal.backHome. */
const CONTENT = {
  fr: { code: "Erreur 404", notFound: "Page introuvable." },
  en: { code: "Error 404", notFound: "Page not found." },
} as const;

export default async function NotFound() {
  const { locale, dict } = await getDict();
  const t = CONTENT[locale];

  return (
    <main className="plano-notfound" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <p className="plano-eyebrow">{t.code}</p>
      <h1 className="plano-notfound-title">{t.notFound}</h1>
      <Link href="/" className="plano-notfound-back">
        {dict.legal.backHome}
      </Link>
    </main>
  );
}
