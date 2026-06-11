import Link from "next/link";
import { fmt, type Dictionary, type Locale } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/mcp/meta";

/** Date de dernière révision des pages légales (constante, pas la date du jour). */
export const LEGAL_LAST_UPDATED_ISO = "2026-06-11";

export function formatLegalDate(locale: Locale): string {
  return new Date(LEGAL_LAST_UPDATED_ISO).toLocaleDateString(
    locale === "en" ? "en-US" : "fr-FR",
    { year: "numeric", month: "long", day: "numeric" }
  );
}

type Section = { h: string; p: string };

/**
 * Coquille commune des pages légales (mentions, confidentialité, conditions).
 * Server Component : rend le contenu depuis le dictionnaire selon la locale du
 * cookie ; la bascule de langue (router.refresh) le re-rend automatiquement.
 */
export function LegalArticle({
  dict,
  locale,
  title,
  intro,
  sections,
  contactTitle,
  contactBody,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  title: string;
  intro: string;
  sections: readonly Section[];
  contactTitle: string;
  contactBody: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="site-section">
      <article className="site-container site-legal">
        <h1>{title}</h1>
        <p className="site-legal-meta">{fmt(dict.legal.lastUpdated, { date: formatLegalDate(locale) })}</p>
        <p className="site-legal-intro">{intro}</p>

        {sections.map((s) => (
          <div className="site-legal-section" key={s.h}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </div>
        ))}

        {children}

        <div className="site-legal-section">
          <h2>{contactTitle}</h2>
          <p>
            {contactBody}{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>

        <p className="site-legal-back">
          <Link href="/">← {dict.legal.backHome}</Link>
        </p>
      </article>
    </section>
  );
}
