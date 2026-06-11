"use client";

import { useEffect, useState } from "react";
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

  // Ferme le menu mobile à chaque changement de route.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Empêche le scroll du body quand le menu plein écran est ouvert.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="site-nav" data-menu-open={menuOpen ? "true" : undefined}>
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
          <button
            type="button"
            className="site-nav-burger"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="site-nav-burger-bar" aria-hidden="true" />
            <span className="site-nav-burger-bar" aria-hidden="true" />
            <span className="site-nav-burger-bar" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Panneau mobile : liens + CTA, plein écran sous la barre */}
      <div
        id="site-mobile-menu"
        className="site-mobile-menu"
        hidden={!menuOpen}
        aria-label={dict.nav.ariaMain}
      >
        <nav className="site-mobile-links" aria-label={dict.nav.ariaMain}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="site-mobile-link"
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {dict.nav[link.key]}
            </Link>
          ))}
        </nav>
        <Link
          href="/dashboard"
          className="site-cta-primary site-mobile-cta"
          onClick={() => setMenuOpen(false)}
        >
          {dict.common.openApp}
        </Link>
      </div>
    </header>
  );
}
