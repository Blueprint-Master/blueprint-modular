import Link from "next/link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import changelog from "@/lib/generated/changelog.json";

export const metadata: Metadata = {
  alternates: { canonical: "https://blueprint-modular.com/docs/changelog" },
};

/** Tons de badge câblés : seuls feat/fix/perf ont une couleur dédiée, le reste est neutre. */
const TONED = new Set(["feat", "fix", "perf"]);

export default async function ChangelogPage() {
  const { dict } = await getDict();
  const t = dict.changelogPage;
  const types = t.types as Record<string, string>;
  const typeLabel = (k: string) => types[k] ?? types.other;
  const badgeClass = (k: string) => `changelog-badge changelog-badge-${TONED.has(k) ? k : "other"}`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs">{dict.nav.docs}</Link> → {t.title}
        </div>
        <h1>{t.title}</h1>
        <p className="doc-description">{t.lead}</p>
      </div>

      {changelog.groups.length === 0 && <p className="doc-description">{t.empty}</p>}

      {changelog.groups.map((group) => (
        <section className="changelog-group" key={group.key}>
          <h2>{group.label}</h2>
          <ul className="changelog-list">
            {group.entries.map((e) => (
              <li className="changelog-entry" key={e.pr}>
                <span className={badgeClass(e.type)}>{typeLabel(e.type)}</span>
                <span className="changelog-entry-title">
                  {e.scope && <span className="changelog-entry-scope">{e.scope} · </span>}
                  {e.title}
                  {e.breaking && (
                    <span className="changelog-entry-breaking" title="Breaking change">
                      {" "}
                      ⚠︎
                    </span>
                  )}
                </span>
                <span className="changelog-entry-meta">
                  <a href={`${changelog.repoUrl}/pull/${e.pr}`} target="_blank" rel="noopener noreferrer">
                    #{e.pr}
                  </a>{" "}
                  · {e.date}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p style={{ marginTop: 32 }}>
        <Link href="/docs" className="changelog-back">
          ← {t.backToDocs}
        </Link>
      </p>
    </div>
  );
}
