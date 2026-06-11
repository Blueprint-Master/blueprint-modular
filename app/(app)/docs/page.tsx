import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/lib/generated/bpm-components.json";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";

export const metadata: Metadata = {
  alternates: { canonical: "https://app.blueprint-modular.com/docs" },
};

const CARD_STYLE: React.CSSProperties = {
  display: "block",
  border: "1px solid var(--bpm-border)",
  borderRadius: 12,
  padding: "18px 20px",
  background: "var(--bpm-surface)",
  textDecoration: "none",
  transition: "var(--bpm-transition-fast)",
};

function DocCard({
  href,
  title,
  body,
  external = false,
}: {
  href: string;
  title: string;
  body: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: "var(--bpm-text-primary)", marginBottom: 6 }}>
        {title}
      </span>
      <span style={{ display: "block", fontSize: 13.5, lineHeight: 1.55, color: "var(--bpm-text-secondary)" }}>{body}</span>
    </>
  );
  if (external) {
    return (
      <a href={href} style={CARD_STYLE} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link href={href} style={CARD_STYLE}>
      {content}
    </Link>
  );
}

export default async function DocsPage() {
  const { dict } = await getDict();
  const hub = dict.docsHub;
  const count = registry.components.length;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>{hub.title}</h1>
        <p className="doc-description">{hub.lead}</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 8,
        }}
      >
        <DocCard href="/docs/getting-started" title={hub.cards.gettingStarted.title} body={hub.cards.gettingStarted.body} />
        <DocCard
          href="/docs/components"
          title={hub.cards.catalog.title}
          body={fmt(hub.cards.catalog.body, { count })}
        />
        <DocCard href="/components" title={hub.cards.gallery.title} body={hub.cards.gallery.body} />
        <DocCard href="/llms.txt" title={hub.cards.llms.title} body={hub.cards.llms.body} external />
        <DocCard href="/docs/changelog" title={hub.cards.changelog.title} body={hub.cards.changelog.body} />
        <DocCard
          href="https://github.com/Blueprint-Modular/blueprint-modular/blob/master/docs/DATABASE.md"
          title={hub.cards.database.title}
          body={hub.cards.database.body}
          external
        />
      </div>
    </div>
  );
}
