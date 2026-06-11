import Link from "next/link";
import { notFound } from "next/navigation";
import registry from "@/lib/generated/bpm-components.json";
import { getPrevNext } from "@/lib/docPages";
import { getLlmsPropsBlock } from "@/lib/llmsDoc";
import { getDict } from "@/lib/i18n/server";

type Props = { params: Promise<{ slug: string }> };

export default async function DocComponentSlugPage({ params }: Props) {
  const { slug } = await params;
  const entry = registry.components.find((c) => c.slug === slug);
  if (!entry) notFound();

  const { dict } = await getDict();
  const { prev, next } = getPrevNext(slug);
  const propsBlock = getLlmsPropsBlock(entry.name);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{dict.catalog.breadcrumb}</Link> → {entry.name}
        </div>
        <h1>{entry.name}</h1>
        <p className="doc-description">{entry.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{entry.category}</span>
        </div>
      </div>

      {propsBlock && (
        <section style={{ marginTop: 24, maxWidth: 760 }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            {dict.componentPage.apiTitle}
          </h2>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {dict.componentPage.apiNote}
          </p>
          <pre
            style={{
              background: "var(--bpm-code-bg)",
              border: "1px solid var(--bpm-code-border)",
              borderRadius: "var(--bpm-radius)",
              padding: 16,
              fontSize: 13,
              lineHeight: 1.6,
              overflowX: "auto",
              fontFamily: "var(--site-font-mono)",
              color: "var(--bpm-text-primary)",
            }}
          >
            <code>{propsBlock}</code>
          </pre>
        </section>
      )}

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
