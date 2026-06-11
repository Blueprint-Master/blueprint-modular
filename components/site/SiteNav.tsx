"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { LOCALES } from "@/lib/i18n";

const LINKS = [
  { href: "/components", key: "gallery" as const },
  { href: "/modules", key: "modules" as const },
  { href: "/mcp", key: "mcp" as const },
  { href: "/resources", key: "resources" as const },
  { href: "/docs", key: "docs" as const },
];

export function SiteNav() {
  const { locale, dict, setLocale } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  // Ferme le menu mobile à chaque navigation et sur Échap.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="site-nav" data-menu-open={menuOpen ? "true" : undefined}>
      <div className="site-container site-nav-inner">
        <Link href="/" className="site-wordmark site-brand" aria-label={dict.nav.ariaHome}>
          <span className="site-brand-mark" aria-hidden="true">
            b
          </span>
          <span className="site-brand-text">
            <span className="site-wordmark-strong">Blueprint</span> Modular
          </span>
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
          <button
            type="button"
            className="site-nav-burger"
            aria-label={menuOpen ? dict.nav.ariaMenuClose : dict.nav.ariaMenu}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="site-nav-burger-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Panneau mobile déployé par le burger */}
      <div id={menuId} className="site-nav-mobile" hidden={!menuOpen}>
        <nav aria-label={dict.nav.ariaMain} className="site-nav-mobile-links">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="site-nav-mobile-link"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {dict.nav[link.key]}
            </Link>
          ))}
          <Link href="/dashboard" className="site-cta-secondary site-nav-mobile-cta">
            {dict.common.openApp}
          </Link>
        </nav>
      </div>
    </header>
  );
}
