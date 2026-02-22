import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        404
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Page introuvable.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg font-medium"
        style={{ background: "var(--bpm-accent)", color: "#fff" }}
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
