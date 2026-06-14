import React from "react";

/**
 * Échafaudage de mise en page commun aux trois catalogues de référence
 * (Composants, Modules, Connecteurs). La présentation de référence est celle du
 * pilier Connecteurs : un hero (eyebrow + titre + lead + méta) puis des sections
 * par catégorie bordées, avec une grille de cartes responsive (retombe en une
 * colonne sur mobile). Tokens `site-*` / `--bpm-*` uniquement.
 */

export function CatalogueHero({
  eyebrow,
  title,
  lead,
  meta,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Ligne de méta sous le lead (ex. « 104 composants »). */
  meta?: React.ReactNode;
  /** Contenu additionnel (ex. champ de recherche). */
  children?: React.ReactNode;
}) {
  return (
    <section className="site-hero">
      <div className="site-container">
        {eyebrow && <span className="site-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {lead && <p className="site-lead">{lead}</p>}
        {meta && (
          <p className="site-eyebrow" style={{ marginTop: 8 }}>
            {meta}
          </p>
        )}
        {children && (
          <div style={{ marginTop: 16, maxWidth: 420 }}>{children}</div>
        )}
      </div>
    </section>
  );
}

/** Section de catégorie : titre + grille de cartes (auto-fill, min 280px). */
export function CatalogueSection({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="site-section site-section-bordered">
      <div className="site-container">
        <h2>{title}</h2>
        <div
          className="catalogue-grid"
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            marginTop: 16,
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
