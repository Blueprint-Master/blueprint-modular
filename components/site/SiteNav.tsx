"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { LOCALES } from "@/lib/i18n";

const LINKS = [
  { href: "/components", key: "gallery" as const },
  { href: "/modules", key: "modules" as const },
  { href: "/docs", key: "docs" as const },
  { href: "/resources", key: "resources" as const },
  { href: "/mcp", key: "mcp" as const },
];

export function SiteNav() {
  const { locale, dict, setLocale } = useI18n();
  const pathname = usePathname();

  return (
    <header className="site-nav">
      <div className="site-container site-nav-inner">
        <Link href="/" className="site-wordmark" aria-label={dict.nav.ariaHome}>
          <span className="site-wordmark-strong">Blueprint</span> Modular
        </Link>

        <nav aria-label={dict.nav.ariaMain} className="site-nav-links">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="site-nav-link"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {dict.nav[link.key]}
            </Link>
          ))}
        </nav>

        <div className="site-nav-actions">
          <div className="site-locale-switch" role="group" aria-label={dict.nav.ariaLocale}>
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
          <Link href="/dashboard" className="site-cta-secondary site-nav-app">
            {dict.common.openApp}
          </Link>
        </div>
      </div>
    </header>
  );
}
