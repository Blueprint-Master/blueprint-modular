import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/mcp/meta";

export const metadata = {
  title: "Politique de confidentialité — Blueprint Modular",
  description:
    "Politique de confidentialité du connecteur MCP Blueprint Modular : aucune donnée personnelle collectée, lectures stateless d'un catalogue public.",
};

export default function PrivacyPage() {
  return (
    <main
      className="min-h-screen p-8 max-w-2xl mx-auto"
      style={{ color: "var(--bpm-text-primary)", background: "var(--bpm-bg-primary)" }}
    >
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        Politique de confidentialité
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Connecteur MCP « Blueprint Modular » — dernière mise à jour : 11 juin 2026.
      </p>

      <section className="space-y-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <p>
          Le connecteur MCP Blueprint Modular expose, en lecture seule, le catalogue public des
          composants <code>@blueprint-modular/core</code>. Cette page décrit comment il traite les
          données lorsqu&apos;il est utilisé via un hôte MCP (Claude, ChatGPT ou autre).
        </p>

        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            Aucune donnée personnelle collectée
          </h2>
          <p>
            Le service ne demande, ne collecte ni ne traite aucune donnée personnelle. Aucune
            authentification n&apos;est requise : il n&apos;y a ni compte, ni profil, ni cookie.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            Lectures stateless d&apos;un catalogue public
          </h2>
          <p>
            Chaque requête est une lecture sans état du catalogue public de composants. Le serveur
            est strictement <strong>read-only</strong> : il n&apos;effectue aucune écriture et
            n&apos;accède à aucun système de production.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            Aucun stockage des données de conversation
          </h2>
          <p>
            Le contenu de vos conversations et de vos requêtes d&apos;outils n&apos;est pas
            conservé. Des compteurs techniques éphémères par adresse IP peuvent exister en mémoire
            le temps d&apos;appliquer une limitation de débit basique ; ils ne sont ni persistés, ni
            utilisés pour identifier un utilisateur.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            Aucun partage avec des tiers
          </h2>
          <p>
            Aucune donnée n&apos;est vendue, louée ou partagée avec des tiers. Le service ne réalise
            aucun pistage publicitaire.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            Contact
          </h2>
          <p>
            Pour toute question relative à cette politique :{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline"
              style={{ color: "var(--bpm-accent)" }}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>

      <p className="mt-8">
        <Link href="/mcp" className="underline" style={{ color: "var(--bpm-accent)" }}>
          ← Documentation du connecteur
        </Link>
      </p>
    </main>
  );
}
