import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/mcp/meta";
import { TOTAL, CATEGORIES } from "@/lib/mcp/registry";

export const metadata = {
  title: "Connecteur MCP — Blueprint Modular",
  description:
    "Serveur MCP public read-only exposant le catalogue de composants Blueprint Modular à Claude, ChatGPT et tout hôte MCP.",
};

const ENDPOINT = "https://blueprint-modular.com/api/mcp";

const tools: Array<{ name: string; sig: string; desc: string }> = [
  {
    name: "list_components",
    sig: "category?, cursor?",
    desc: "Liste paginée (curseur) des composants : nom + description en une ligne, filtrable par catégorie.",
  },
  {
    name: "search_components",
    sig: "query, cursor?",
    desc: "Recherche paginée par pertinence (nom, description, catégorie, tags).",
  },
  {
    name: "get_component",
    sig: "name",
    desc: "Détail d'un composant : description, props/types, exemple d'usage, composants associés.",
  },
  {
    name: "suggest_composition",
    sig: "need, limit?",
    desc: "Suggère des composants répondant à un besoin décrit en langage naturel.",
  },
];

export default function McpDocsPage() {
  return (
    <main
      className="min-h-screen p-8 max-w-3xl mx-auto"
      style={{ color: "var(--bpm-text-primary)", background: "var(--bpm-bg-primary)" }}
    >
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        Connecteur MCP — Blueprint Modular
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Serveur <strong>MCP public, read-only</strong> exposant le catalogue de {TOTAL} composants{" "}
        <code>@blueprint-modular/core</code> à Claude, ChatGPT et tout hôte MCP, via le transport
        <strong> Streamable HTTP</strong>. Aucune authentification.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
          Endpoint
        </h2>
        <pre
          className="p-3 rounded text-sm overflow-x-auto"
          style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}
        >
          POST {ENDPOINT}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
          Outils exposés (4, read-only)
        </h2>
        <ul className="space-y-3" style={{ color: "var(--bpm-text-secondary)" }}>
          {tools.map((t) => (
            <li key={t.name}>
              <code style={{ color: "var(--bpm-accent)" }}>
                {t.name}({t.sig})
              </code>
              <div className="text-sm">{t.desc}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
          Catégories
        </h2>
        <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {CATEGORIES.join(" · ")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
          Ajouter dans Claude
        </h2>
        <ol
          className="list-decimal ml-5 space-y-1 text-sm"
          style={{ color: "var(--bpm-text-secondary)" }}
        >
          <li>Settings → Connectors → Add custom connector.</li>
          <li>
            Name : <em>Blueprint Modular</em>.
          </li>
          <li>
            Remote MCP server URL : <code>{ENDPOINT}</code>.
          </li>
          <li>Aucune authentification à configurer.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
          Ajouter dans ChatGPT (developer mode)
        </h2>
        <ol
          className="list-decimal ml-5 space-y-1 text-sm"
          style={{ color: "var(--bpm-text-secondary)" }}
        >
          <li>Settings → Connectors → Advanced → Developer mode.</li>
          <li>Create / Add custom connector.</li>
          <li>
            MCP Server URL : <code>{ENDPOINT}</code>, authentification : <em>None</em>.
          </li>
        </ol>
      </section>

      <section className="mb-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <p>
          Endpoint de santé : <code>GET /api/health</code>. Confidentialité :{" "}
          <Link href="/privacy" className="underline" style={{ color: "var(--bpm-accent)" }}>
            /privacy
          </Link>
          . Contact :{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "var(--bpm-accent)" }}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
