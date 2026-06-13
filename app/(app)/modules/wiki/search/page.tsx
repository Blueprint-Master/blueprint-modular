"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Badge, Button, Panel } from "@/components/bpm";
import { HighlightedText } from "@/components/wiki/HighlightedText";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

type Hit = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  tags?: string[];
  updatedAt: string;
  authorName?: string | null;
  author?: { name: string | null };
};

export default function WikiSearchPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const { data: session, status } = useSession();
  const [query, setQuery] = useState(q);
  const [textResults, setTextResults] = useState<Hit[]>([]);
  const [semanticResults, setSemanticResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async () => {
    const term = query.trim();
    if (!term) {
      setTextResults([]);
      setSemanticResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/wiki?search=${encodeURIComponent(term)}&status=published&withContent=false`,
        { credentials: "include" }
      );
      const data = res.ok ? await res.json() : [];
      const list = Array.isArray(data) ? data : [];
      setTextResults(list);
      if (list.length < 3 && session) {
        const sem = await fetch("/api/wiki/semantic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: term, limit: 5 }),
          credentials: "include",
        });
        const semData = sem.ok ? await sem.json() : { results: [] };
        setSemanticResults(Array.isArray(semData.results) ? semData.results : []);
      } else {
        setSemanticResults([]);
      }
    } catch {
      setTextResults([]);
      setSemanticResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, session]);

  useEffect(() => {
    if (q && status !== "loading") runSearch();
  }, [q, status]);

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">{t.common.modules}</Link> → <Link href="/modules/wiki">Wiki</Link> → {t.search.breadcrumb}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {t.search.title}
        </h1>
        <form
          onSubmit={(e) => { e.preventDefault(); runSearch(); }}
          className="flex flex-wrap items-center gap-2 mt-4"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="flex-1 min-w-[200px] px-3 py-2 rounded border text-sm"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
          <Button type="submit" size="small" disabled={loading}>
            {loading ? t.search.searching : t.search.searchButton}
          </Button>
        </form>
      </div>

      {loading && (
        <div className="flex gap-4 flex-wrap">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full max-w-md h-24 rounded border animate-pulse" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }} />
          ))}
        </div>
      )}

      {!loading && searched && (
        <>
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
              {t.search.results(textResults.length)}
            </h2>
            {textResults.length === 0 ? (
              <Panel variant="info" title={t.search.noResultsTitle}>
                <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                  {t.search.noResultsBody}
                </p>
              </Panel>
            ) : (
              <ul className="space-y-4">
                {textResults.map((a) => (
                  <li key={a.id} className="p-4 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                    <Link href={`/modules/wiki/${a.slug}`} className="block no-underline group">
                      <h3 className="text-lg font-semibold group-hover:underline" style={{ color: "var(--bpm-accent-cyan)" }}>
                        <HighlightedText text={a.title} term={query.trim()} />
                      </h3>
                      {a.excerpt && (
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--bpm-text-secondary)" }}>
                          <HighlightedText text={a.excerpt} term={query.trim()} />
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {Array.isArray(a.tags) && a.tags.slice(0, 5).map((t) => (
                          <Badge key={t} variant="default">{t}</Badge>
                        ))}
                        <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                          {(a.authorName ?? a.author?.name) ?? "—"} · {new Date(a.updatedAt).toLocaleDateString(t.common.locale)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {semanticResults.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
                {t.search.semanticResults}
              </h2>
              <ul className="space-y-4">
                {semanticResults.map((a) => (
                  <li key={a.id} className="p-4 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                    <Link href={`/modules/wiki/${a.slug}`} className="block no-underline group">
                      <h3 className="text-lg font-semibold group-hover:underline" style={{ color: "var(--bpm-accent-cyan)" }}>{a.title}</h3>
                      {a.excerpt && <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--bpm-text-secondary)" }}>{a.excerpt}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {Array.isArray(a.tags) && a.tags.slice(0, 5).map((t) => (
                          <Badge key={t} variant="default">{t}</Badge>
                        ))}
                        <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                          {(a.authorName ?? a.author?.name) ?? "—"} · {new Date(a.updatedAt).toLocaleDateString(t.common.locale)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/wiki" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.backToWiki}</Link>
        <Link href="/modules/wiki/tags" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.tags}</Link>
      </nav>
    </div>
  );
}
