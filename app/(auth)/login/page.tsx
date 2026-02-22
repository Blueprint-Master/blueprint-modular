import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center" style={{ color: "var(--bpm-accent)" }}>
          Connexion
        </h1>
        <div className="flex flex-col gap-3">
          <a
            href="/api/auth/signin/google"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium transition opacity-90 hover:opacity-100"
            style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}
          >
            Continuer avec Google
          </a>
        </div>
        <p className="text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/" className="underline">Retour à l&apos;accueil</Link>
        </p>
      </div>
    </main>
  );
}
