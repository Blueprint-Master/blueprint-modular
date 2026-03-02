import Link from "next/link";
import { getCachedDemoProductionData } from "@/lib/demo-production-data";
import { DemoProductionDashboard } from "./DemoProductionDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function DemoProductionPage() {
  const data = await getCachedDemoProductionData();

  return (
    <div className="min-h-screen" style={{ background: "var(--bpm-bg-secondary, #f5f5f5)" }}>
      <header
        className="sticky top-0 z-10 border-b px-4 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{
          background: "var(--bpm-bg-primary)",
          borderColor: "var(--bpm-border)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-semibold text-lg"
            style={{ color: "var(--bpm-text-primary)" }}
          >
            Blueprint Modular
          </Link>
          <span
            className="text-sm px-2 py-1 rounded"
            style={{
              background: "var(--bpm-bg-secondary)",
              color: "var(--bpm-text-secondary)",
            }}
          >
            Démo Production
          </span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/docs"
            className="underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Documentation
          </Link>
          <Link
            href="/sandbox"
            className="underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            App Builder
          </Link>
        </nav>
      </header>

      <div
        className="mx-auto max-w-4xl px-4 py-3 text-center text-sm"
        style={{
          background: "rgba(245, 158, 11, 0.12)",
          color: "#8a5a00",
          borderBottom: "1px solid rgba(245, 158, 11, 0.3)",
        }}
      >
        Démo — données fictives. Déployez votre propre instance pour connecter vos lignes et
        indicateurs.
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <DemoProductionDashboard data={data} />
      </main>
    </div>
  );
}
