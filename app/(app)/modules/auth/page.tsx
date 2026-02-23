"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function AuthModulePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
          Authentification
        </h1>
        <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Authentification (bpm.auth)
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Gestion de la session et de la connexion (Google ou e-mail). Style aligné sur myportfolio.beam-consulting.
      </p>

      {session?.user ? (
        <div
          className="max-w-md p-6 rounded-xl border"
          style={{
            background: "var(--bpm-bg-secondary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
            Session active
          </h2>
          <div className="flex items-center gap-4 mb-4">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                style={{ background: "var(--bpm-accent)" }}
              >
                {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium" style={{ color: "var(--bpm-text-primary)" }}>
                {session.user.name ?? "Utilisateur"}
              </p>
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {session.user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <div
          className="max-w-md p-6 rounded-xl border"
          style={{
            background: "var(--bpm-bg-secondary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Vous n&apos;êtes pas connecté. Connectez-vous pour accéder à votre session.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-white transition"
            style={{ background: "var(--bpm-accent)" }}
          >
            Se connecter
          </Link>
        </div>
      )}
    </div>
  );
}
