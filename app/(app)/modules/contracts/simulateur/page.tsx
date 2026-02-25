"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner, Panel, Button } from "@/components/bpm";

interface ContractDemo { id: string; originalFilename: string; status: string; }

export default function ContractsSimulateurPage() {
  const router = useRouter();
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
        <Spinner size="medium" text="Chargement…" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <h1 className="text-xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>Simulateur Base contractuelle</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Ouvrez un contrat en mode démo pour tester la page de détail et l&apos;analyse IA.
      </p>

      {contracts.length > 0 ? (
        <Panel variant="info" title="Contrats disponibles (démo)" className="mt-6">
          <ul className="space-y-2">
            {contracts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 flex-wrap">
                <span className="text-sm truncate" style={{ color: "var(--bpm-text-primary)" }}>{c.originalFilename}</span>
                <Button size="small" variant="secondary" onClick={() => openDemo(c.id)}>
                  Voir le contrat
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            Seuls les contrats déjà analysés (statut « Analysé ») sont listés.
          </p>
        </Panel>
      ) : (
        <Panel variant="info" title="Mode sandbox" className="mt-6">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucun contrat analysé pour le moment. Uploadez un fichier depuis la Base contractuelle, lancez l&apos;analyse, puis revenez ici pour ouvrir un contrat en démo.
          </p>
          <Link href="/modules/contracts" className="inline-block mt-4">
            <Button variant="primary">Aller à la Base contractuelle</Button>
          </Link>
        </Panel>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/contracts" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour à la Base contractuelle</Link>
        <Link href="/modules/contracts/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
