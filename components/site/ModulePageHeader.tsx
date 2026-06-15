import React from "react";
import Link from "next/link";
import { Title } from "@/components/bpm";

/**
 * En-tête commun des pages module (`/modules/<nom>`). Converge le gabarit
 * `doc-page-header` dupliqué dans les pages module en un primitif unique.
 *
 * Dogfooding : le titre est rendu via `bpm.title` (et non un `<h1>` brut). Pour
 * éviter toute régression visuelle, on **réplique fidèlement** la règle CSS
 * historique `.site-shell .doc-page .doc-page-header h1` (police display, taille
 * `clamp` responsive, interlettrage). Les classes `doc-*` et tokens `--bpm-*`
 * restent la source de style pour le reste de l'en-tête.
 */
export interface ModulePageHeaderLink {
  href: string;
  label: React.ReactNode;
}

export interface ModulePageHeaderProps {
  /** Texte courant du fil d'Ariane, après « Modules → ». */
  breadcrumbCurrent?: React.ReactNode;
  /** Libellé du lien racine du fil d'Ariane (défaut « Modules »). */
  modulesLabel?: React.ReactNode;
  /** Override complet du contenu du fil d'Ariane (cas à plusieurs liens). */
  breadcrumb?: React.ReactNode;
  title: React.ReactNode;
  /** Taille du titre. Défaut : clamp display du shell. */
  titleSize?: string;
  /** Styles additionnels fusionnés sur le titre (ex. marge spécifique). */
  titleStyle?: React.CSSProperties;
  description?: React.ReactNode;
  /** Badge de catégorie (texte). Optionnel. */
  category?: React.ReactNode;
  /** Contenu additionnel dans la ligne de méta (ex. temps de lecture). Optionnel. */
  metaExtra?: React.ReactNode;
  /** Liens d'accès rapide (Simulateur / Documentation), rendus en accent cyan. */
  links?: ModulePageHeaderLink[];
  /** id sur le conteneur (ancre, ex. "documentation"). Optionnel. */
  wrapperId?: string;
  /** Classes additionnelles sur le conteneur (ex. "mb-6"). Optionnel. */
  className?: string;
  /** Styles additionnels sur le conteneur (ex. flexShrink). Optionnel. */
  wrapperStyle?: React.CSSProperties;
}

/** Aligné sur les fiches Connecteurs (`.app-main h1` = 1.25rem / 600). */
const TITLE_BASE_STYLE: React.CSSProperties = {
  margin: "0 0 8px",
};

export function ModulePageHeader({
  breadcrumbCurrent,
  modulesLabel = "Modules",
  breadcrumb,
  title,
  titleSize = "1.25rem",
  titleStyle,
  description,
  category,
  metaExtra,
  links = [],
  wrapperId,
  className = "",
  wrapperStyle,
}: ModulePageHeaderProps) {
  return (
    <div id={wrapperId} className={`doc-page-header ${className}`.trim()} style={wrapperStyle}>
      <div className="doc-breadcrumb">
        {breadcrumb ?? (
          <>
            <Link href="/modules">{modulesLabel}</Link> → {breadcrumbCurrent}
          </>
        )}
      </div>
      <Title
        level={1}
        size={titleSize}
        bold={600}
        color="var(--bpm-text-primary)"
        style={{ ...TITLE_BASE_STYLE, ...titleStyle }}
      >
        {title}
      </Title>
      {description != null && <p className="doc-description">{description}</p>}
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
