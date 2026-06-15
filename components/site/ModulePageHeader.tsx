import React from "react";
import Link from "next/link";

/**
 * En-tête commun des pages module (`/modules/<nom>`). Converge le gabarit
 * `doc-page-header` dupliqué dans ~29 pages module en un primitif unique, à
 * markup **identique** (mêmes classes `doc-*`) — aucun changement visuel.
 *
 * C'est le point d'ancrage unique pour un futur dogfooding du titre vers
 * `bpm.title` (un seul endroit à modifier au lieu de 29). Tokens `--bpm-*` /
 * classes `doc-*` uniquement.
 */
export interface ModulePageHeaderLink {
  href: string;
  label: React.ReactNode;
}

export interface ModulePageHeaderProps {
  /** Texte courant du fil d'Ariane, après « Modules → ». */
  breadcrumbCurrent: React.ReactNode;
  /** Libellé du lien racine du fil d'Ariane (défaut « Modules »). */
  modulesLabel?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  /** Badge de catégorie (texte). Optionnel. */
  category?: React.ReactNode;
  /** Contenu additionnel dans la ligne de méta (ex. temps de lecture). Optionnel. */
  metaExtra?: React.ReactNode;
  /** Liens d'accès rapide (Simulateur / Documentation), rendus en accent cyan. */
  links?: ModulePageHeaderLink[];
}

export function ModulePageHeader({
  breadcrumbCurrent,
  modulesLabel = "Modules",
  title,
  description,
  category,
  metaExtra,
  links = [],
}: ModulePageHeaderProps) {
  return (
    <div className="doc-page-header">
      <div className="doc-breadcrumb">
        <Link href="/modules">{modulesLabel}</Link> → {breadcrumbCurrent}
      </div>
      <h1>{title}</h1>
      <p className="doc-description">{description}</p>
      {(category != null || metaExtra != null) && (
        <div className="doc-meta">
          {category != null && <span className="doc-badge doc-badge-category">{category}</span>}
          {metaExtra}
        </div>
      )}
      {links.length > 0 && (
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {links.map((link, i) => (
            <React.Fragment key={link.href}>
              {i > 0 && " · "}
              <Link
                href={link.href}
                className="font-medium underline"
                style={{ color: "var(--bpm-accent-cyan)" }}
              >
                {link.label}
              </Link>
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
}
