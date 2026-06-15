"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export interface FicheNavLink {
  href: string;
  label: string;
  variant?: "outline" | "secondary";
}

export interface FicheNavProps {
  /** First link (e.g. "← Liste des actifs") - rendered as outline. */
  backLink: string;
  backLabel: string;
  /** Additional links (e.g. Tableau de bord, Documentation) - rendered as secondary. */
  secondaryLinks?: FicheNavLink[];
  className?: string;
}

export function FicheNav({ backLink, backLabel, secondaryLinks = [], className = "" }: FicheNavProps) {
  const { dict } = useI18n();
  return (
    <nav className={`doc-pagination mt-8 flex flex-wrap gap-3 ${className}`.trim()} aria-label={dict.fiche.endNavAria}>
      <Link href={backLink} className="fiche-nav-back-link">
        <Button variant="outline" size="medium">
          {backLabel}
        </Button>
      </Link>
      {secondaryLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          <Button variant={link.variant ?? "secondary"} size="medium">
            {link.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
