"use client";

import Link from "next/link";
import AuthSimulateur from "../simulateur-content";

const cardStyle = {
  background: "var(--bpm-bg-primary)",
  borderColor: "var(--bpm-border)",
};
const linkStyle = { color: "var(--bpm-accent-cyan)" };

function ModelCard({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="p-5 rounded-xl border" style={cardStyle}>
      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {title}
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {description}
      </p>
      <div className="flex flex-wrap gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
            style={{ ...linkStyle, borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AuthSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link>
          {" → "}
          <Link href="/modules/auth">Auth</Link>
          {" → "}
          Simulateur
        </div>
        <h1>Simulateur — Auth</h1>
        <p className="doc-description">
          Jouez les flux complets dans le bac à sable : connexion (comptes de démo, whitelist de
          domaines, erreurs), inscription, mot de passe oublié — sans toucher la vraie session.
          Les trois modèles de page restent consultables en bas.
        </p>
      </div>

      <AuthSimulateur />

      <h2 className="text-lg font-semibold mt-10 mb-3" style={{ color: "var(--bpm-text-primary)" }}>
        Modèles de page de connexion
      </h2>
      <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        <ModelCard
          title="1. Carte centrée (par défaut)"
          description="Formulaire dans une carte centrée, option Google + e-mail."
          links={[
            { href: "/login", label: "Aperçu connexion" },
            { href: "/register", label: "Aperçu inscription" },
          ]}
        />
        <ModelCard
          title="2. Modèle split"
          description="Formulaire à gauche, image à droite (équipe, collaboration)."
          links={[
            { href: "/login?layout=split", label: "Aperçu connexion" },
            { href: "/register?layout=split", label: "Aperçu inscription" },
          ]}
        />
        <ModelCard
          title="3. Google seul"
          description="Un seul bouton « Google », pas de formulaire e-mail."
          links={[{ href: "/login?showEmailOption=false", label: "Aperçu connexion" }]}
        />
      </div>

      <nav className="doc-pagination">
        <Link href="/modules/auth" className="text-sm font-medium hover:underline" style={linkStyle}>
          ← Retour au module Auth
        </Link>
      </nav>
    </div>
  );
}
