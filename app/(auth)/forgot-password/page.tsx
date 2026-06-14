"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  title: "Mot de passe oublié",
  body: "Réinitialisation à venir. Utilisez la connexion OAuth en attendant.",
  backToLogin: "Retour à la connexion",
};

const en: typeof fr = {
  title: "Forgot password",
  body: "Password reset coming soon. Use OAuth sign-in in the meantime.",
  backToLogin: "Back to sign-in",
};

export default function ForgotPasswordPage() {
  const { locale } = useI18n();
  const S = locale === "en" ? en : fr;
  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center" style={{ color: "var(--bpm-accent)" }}>
          {S.title}
        </h1>
        <p className="text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {S.body}
        </p>
        <p className="text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/login" className="underline">{S.backToLogin}</Link>
        </p>
      </div>
    </main>
  );
}
