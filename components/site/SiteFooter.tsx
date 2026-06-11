"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { APP_VERSION } from "@/lib/version";

export function SiteFooter() {
  const { dict } = useI18n();

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
          <Link href="/components">{dict.footer.gallery}</Link>
          <Link href="/docs/components">{dict.footer.catalog}</Link>
          <Link href="/docs/getting-started">{dict.footer.gettingStarted}</Link>
          <Link href="/docs/changelog">{dict.footer.changelog}</Link>
        </nav>

        <nav className="site-footer-col" aria-label={dict.footer.resources}>
          <h2>{dict.footer.resources}</h2>
          <a href="/llms.txt">{dict.footer.llms}</a>
          <a href="https://pypi.org/project/blueprint-modular/" target="_blank" rel="noopener noreferrer">
            {dict.footer.pypi}
          </a>
        </nav>

        <nav className="site-footer-col" aria-label={dict.footer.legal}>
          <h2>{dict.footer.legal}</h2>
          <Link href="/privacy">{dict.footer.privacy}</Link>
          <Link href="/terms">{dict.footer.terms}</Link>
        </nav>
      </div>
      <div className="site-container site-footer-meta">
        <span>
          {dict.common.brand} · v{APP_VERSION}
        </span>
      </div>
    </footer>
  );
}
