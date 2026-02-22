import Link from "next/link";

const COMPONENTS = [
  { slug: "metric", name: "bpm.metric" },
  { slug: "button", name: "bpm.button" },
  { slug: "panel", name: "bpm.panel" },
];

export default function DocsComponentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--bpm-accent)" }}>
        Composants BPM
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Référence des composants avec sandbox live.
      </p>
      <ul className="space-y-2">
        {COMPONENTS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/docs/components/${c.slug}`}
              className="underline"
              style={{ color: "var(--bpm-accent-cyan)" }}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
