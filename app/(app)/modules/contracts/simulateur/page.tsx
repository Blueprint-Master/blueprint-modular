"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner, Panel, Button } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

interface ContractDemo { id: string; originalFilename: string; status: string; }

export default function ContractsSimulateurPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale].simulator;
  const [contracts, setContracts] = useState<ContractDemo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts?status=done", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setContracts(list.slice(0, 10).map((c: { id: string; originalFilename: string; status: string }) => ({
          id: c.id,
          originalFilename: c.originalFilename,
          status: c.status,
        })));
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, []);

  const openDemo = (id: string) => {
    router.push(`/modules/contracts/${id}`);
  };

  if (loading) {
    return (
      <div className="doc-page flex flex-col items-center justify-center gap-4 min-h-[200px]" style={{ color: "var(--bpm-text-secondary)" }}>
        <Spinner size="medium" text={t.loading} />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <h1 className="text-xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>{t.title}</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.intro}
      </p>

      {contracts.length > 0 ? (
        <Panel variant="info" title={t.availableTitle} className="mt-6">
          <ul className="space-y-2">
            {contracts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 flex-wrap">
                <span className="text-sm truncate" style={{ color: "var(--bpm-text-primary)" }}>{c.originalFilename}</span>
                <Button size="small" variant="secondary" onClick={() => openDemo(c.id)}>
                  {t.viewContract}
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {t.onlyAnalyzed}
          </p>
        </Panel>
      ) : (
        <Panel variant="info" title={t.sandboxTitle} className="mt-6">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {t.sandboxDesc}
          </p>
          <Link href="/modules/contracts" className="inline-block mt-4">
            <Button variant="primary">{t.goToRepository}</Button>
          </Link>
        </Panel>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/contracts" style={{ color: "var(--bpm-accent-cyan)" }}>{t.backToRepository}</Link>
        <Link href="/modules/contracts/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{t.documentation}</Link>
      </nav>
    </div>
  );
}
