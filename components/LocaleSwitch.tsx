"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import { LOCALES } from "@/lib/i18n";

/**
 * Bascule FR/EN réutilisable (même apparence grise que la vitrine et le shell app
 * via `.site-locale-switch` / `.site-locale-btn`). Destinée aux surfaces SANS
 * chrome (auth, démos, transitions) pour garantir « bascule partout ».
 *
 * Le libellé du groupe est fourni par l'appelant (les surfaces sans chrome n'ont
 * pas toujours accès à un dictionnaire) ; défaut bilingue raisonnable sinon.
 */
export function LocaleSwitch({
  className,
  ariaLabel,
}: {
  className?: string;
  ariaLabel?: string;
}) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={`site-locale-switch${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={ariaLabel ?? (locale === "fr" ? "Choix de la langue" : "Language selection")}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          className="site-locale-btn"
          aria-pressed={locale === l}
          onClick={() => setLocale(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
