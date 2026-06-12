"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ThemesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/themes">Thèmes</Link> → Documentation
        </nav>
        <h1>Documentation — Thèmes / White-label</h1>
        <p className="doc-description">
          Branding par instance ou client : variables exposées, modèle JSON d&apos;un thème,
          application au DOM et résolution multi-tenant.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Variables exposées
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Un thème expose un petit jeu de variables, volontairement réduit pour rester maintenable.
        Tout le reste (états hover, ombres, contrastes) est dérivé de ces valeurs.
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>couleurApp</code> — nom d&apos;application affiché dans la barre (les initiales servent de logo de repli).</li>
        <li><code>accent</code> — couleur primaire (boutons, badges, liens) ; la couleur du texte posé dessus est dérivée par luminance.</li>
        <li><code>fond</code> — arrière-plan général de l&apos;interface.</li>
        <li><code>surface</code> — fond des cartes, panneaux et champs.</li>
        <li><code>texte</code> — couleur de texte principale ; les bordures sont dérivées (texte à ~15 % d&apos;opacité).</li>
        <li><code>rayon</code> — rayon de bordure en px (0–16), appliqué uniformément.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle JSON d&apos;un thème
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        C&apos;est exactement le format produit par « Exporter JSON » dans le simulateur, et celui
        attendu côté serveur pour provisionner une instance.
      </p>
      <CodeBlock
        code={`{
  "id": "theme-acme",
  "nom": "ACME Corp",
  "couleurApp": "ACME Portail",
  "accent": "#e11d48",
  "fond": "#faf6f6",
  "surface": "#ffffff",
  "texte": "#1c1917",
  "rayon": 4
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Application au DOM
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        En production, le thème résolu est appliqué une seule fois, en injectant les variables CSS
        sur un conteneur racine — jamais champ par champ dans les composants. Dans le simulateur,
        l&apos;aperçu est <strong>scopé</strong> : les valeurs sont posées en style inline sur le
        conteneur de prévisualisation, sans jamais muter les variables globales du document (elles
        restent la propriété du ThemeProvider de l&apos;application).
      </p>
      <CodeBlock
        code={`// Application scopée (aperçu ou app embarquée) — pas de document.documentElement
function appliquerTheme(racine: HTMLElement, theme: Theme) {
  racine.style.setProperty("--bpm-accent", theme.accent);
  racine.style.setProperty("--bpm-bg", theme.fond);
  racine.style.setProperty("--bpm-surface", theme.surface);
  racine.style.setProperty("--bpm-text", theme.texte);
  racine.style.setProperty("--bpm-radius", theme.rayon + "px");
}`}
        language="typescript"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Multi-tenant
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        La résolution du thème suit l&apos;ordre : thème explicitement assigné à l&apos;instance →
        thème du client (tenant) → thème par défaut de la plateforme. Recommandations :
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>Persister les thèmes dans une table <code>themes</code> et référencer <code>theme_id</code> sur chaque tenant ; ne jamais dupliquer les valeurs.</li>
        <li>Résoudre le tenant côté serveur (sous-domaine ou en-tête d&apos;instance) et servir les variables dès le premier rendu pour éviter tout flash de thème.</li>
        <li>Conserver un thème par défaut non supprimable : c&apos;est le repli de toute instance dont le thème a été retiré (comportement reproduit dans le simulateur).</li>
        <li>Tracer les déploiements de branding via le champ <code>exporteLe</code> ajouté à chaque export JSON.</li>
      </ul>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/themes/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
