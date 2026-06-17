"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { PYTHON_VERSION, CORE_VERSION } from "@/lib/version";

export function SiteFooter() {
  const { locale, dict } = useI18n();

  return (
    <footer className="site-footer">
      <div className="site-container site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-wordmark">
            <span className="site-wordmark-strong">Blueprint</span> Modular
          </div>
          <p className="site-footer-tagline">{dict.common.tagline}</p>
          <p className="site-footer-note">{dict.footer.note}</p>
        </div>

        <nav className="site-footer-col" aria-label={dict.footer.product}>
          <h2>{dict.footer.product}</h2>
          <Link href="/composants">{dict.footer.gallery}</Link>
          <Link href="/modules">{dict.footer.modules}</Link>
          <Link href="/composants">{dict.footer.catalog}</Link>
          <Link href="/docs/changelog">{dict.footer.changelog}</Link>
          {/* Produit frère de l'écosystème (.Maker, moteur de génération) :
              lien externe locale-aware — /fr ou /en dérivé de la locale courante
              de la vitrine, jamais figé. */}
          <a
            href={`https://blueprint-maker.com/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {dict.footer.maker}
          </a>
        </nav>

        <nav className="site-footer-col" aria-label={dict.footer.resources}>
          <h2>{dict.footer.resources}</h2>
          <Link href="/resources">{dict.footer.resourcesHub}</Link>
          <Link href="/docs">{dict.footer.docs}</Link>
          <Link href="/docs/getting-started">{dict.footer.gettingStarted}</Link>
          <Link href="/mcp">{dict.footer.mcp}</Link>
          <a href="/llms.txt">{dict.footer.llms}</a>
          <a href="/llms-core.txt">{dict.footer.llmsCore}</a>
          <a href="https://pypi.org/project/blueprint-modular/" target="_blank" rel="noopener noreferrer">
            {dict.footer.pypi}
          </a>
          <a href="https://www.npmjs.com/package/@blueprint-modular/core" target="_blank" rel="noopener noreferrer">
            {dict.footer.npm}
          </a>
        </nav>

        <nav className="site-footer-col" aria-label={dict.footer.legal}>
          <h2>{dict.footer.legal}</h2>
          <Link href="/legal">{dict.footer.legalNotice}</Link>
          <Link href="/privacy">{dict.footer.privacy}</Link>
          <Link href="/terms">{dict.footer.terms}</Link>
          {/* Page de statut servie sur son sous-domaine canonique
              (status.blueprint-modular.com), pas sur /status de l'apex. */}
          <a href="https://status.blueprint-modular.com">{dict.footer.status}</a>
        </nav>
      </div>
      <div className="site-container site-footer-meta">
        <span>
          {dict.common.brand} · {dict.footer.pythonSurface} v{PYTHON_VERSION} · {dict.footer.reactSurface} v{CORE_VERSION}
        </span>
      </div>
    </footer>
  );
}
