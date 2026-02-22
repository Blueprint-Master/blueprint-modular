import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center" style={{ color: "var(--bpm-accent)" }}>
          Mot de passe oublié
        </h1>
        <p className="text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          Réinitialisation à venir. Utilisez la connexion OAuth en attendant.
        </p>
        <p className="text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/login" className="underline">Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}
