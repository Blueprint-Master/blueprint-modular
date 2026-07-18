import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

/** Chaîne bilingue locale — portée : page 404 uniquement. Le lien retour réutilise dict.legal.backHome. */
const CONTENT = {
  fr: { notFound: "Page introuvable." },
  en: { notFound: "Page not found." },
} as const;

export default async function NotFound() {
  const { locale, dict } = await getDict();
  const t = CONTENT[locale];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        404
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.notFound}
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg font-medium"
        style={{ background: "var(--bpm-accent)", color: "#fff" }}
      >
        {dict.legal.backHome}
      </Link>
    </main>
  );
}
