import Link from "next/link";

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Blueprint Modular",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  programmingLanguage: "Python",
  url: "https://blueprint-modular.com",
  description: "Python/React framework for building business interfaces without HTML or JavaScript. Ready-to-use components for dashboards, data tables, metrics, and more.",
  featureList: ["bpm.metric", "bpm.table", "bpm.tabs", "bpm.panel", "Wiki module", "AI chat module", "Document analysis module"],
  license: "https://opensource.org/licenses/MIT",
  author: { "@type": "Organization", name: "BEAM Consulting" },
};

export default function HomePage() {
  return (
    <main className="min-h-screen p-8" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--bpm-accent)" }}>
          Blueprint Modular
        </h1>
        <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
          Briques prêtes à l&apos;emploi. Vous écrivez la logique.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg font-medium"
            style={{ background: "var(--bpm-accent)", color: "#fff" }}
          >
            Connexion
          </Link>
        </div>
      </div>
    </main>
  );
}
