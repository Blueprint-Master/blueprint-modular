"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { AuthSplitLayout } from "./AuthSplitLayout";
import styles from "./AuthForm.module.css";

const fr = {
  heading: "Créer un compte",
  request: "Recevoir le code", code: "Code reçu par e-mail", changeEmail: "Modifier l’adresse ou demander un nouveau code",
  sent: "Un code valable dix minutes a été envoyé à", invalidCode: "Code expiré ou incorrect, ou compte déjà inscrit.",
  restricted: "Cette adresse ne peut pas s’inscrire sur cette instance.",
  emailOff: "L’inscription par e-mail est désactivée sur cette instance.",
  subtitle: "Inscrivez-vous avec une méthode disponible sur cette instance.",
  or: "ou",
  fullName: "Nom complet",
  emailLabel: "Email",
  passwordLabel: "Mot de passe (12 caractères minimum)",
  creatingAccount: "Création du compte…",
  submit: "Valider",
  signIn: "Se connecter",
  backToHome: "Retour à l'accueil",
  termsPrefix: "En créant un compte, vous acceptez nos ",
  termsLink: "Conditions générales",
  termsMiddle: " et notre ",
  privacyLink: "Politique de confidentialité",
  termsSuffix: ".",
  errorRegister: "Inscription impossible. Utilisez Google pour créer un compte.",
  errorNetwork: "Erreur réseau. Réessayez ou utilisez Google.",
};

const en: typeof fr = {
  heading: "Create an account",
  request: "Send verification code", code: "Code from your email", changeEmail: "Change address or request a new code",
  sent: "A code valid for ten minutes has been sent to", invalidCode: "Code expired or incorrect, or account already registered.",
  restricted: "This address cannot register on this instance.",
  emailOff: "Email registration is disabled on this instance.",
  subtitle: "Register with a method available on this instance.",
  or: "or",
  fullName: "Full name",
  emailLabel: "Email",
  passwordLabel: "Password (at least 12 characters)",
  creatingAccount: "Creating account…",
  submit: "Submit",
  signIn: "Sign in",
  backToHome: "Back to home",
  termsPrefix: "By creating an account, you agree to our ",
  termsLink: "Terms & Conditions",
  termsMiddle: " and our ",
  privacyLink: "Privacy Policy",
  termsSuffix: ".",
  errorRegister: "Registration failed. Use Google to create an account.",
  errorNetwork: "Network error. Try again or use Google.",
};

type RegisterPageProps = {
  title?: string;
  emailEnabled?: boolean;
  googleEnabled?: boolean;
  logoSrc?: string | null;
  callbackUrl?: string | null;
  /** Si false, affiche le formulaire en carte centrée (modèle par défaut). */
  useSplitLayout?: boolean;
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 12 }} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function RegisterPage({
  title = "Blueprint Modular",
  emailEnabled = true,
  googleEnabled = true,
  logoSrc = null,
  callbackUrl = null,
  useSplitLayout = false,
}: RegisterPageProps) {
  const { locale } = useI18n();
  const S = locale === "en" ? en : fr;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleGoogleSignUp = () => {
    setError(null);
    void signIn("google", { callbackUrl: callbackUrl ?? "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(challenge
          ? { email: email.trim(), name: fullName.trim() || undefined, password, code, id: challenge }
          : { email: email.trim(), locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 202 && data.id) {
        setChallenge(data.id);
        return;
      }
      if (res.status === 201) {
        window.location.href = callbackUrl ? "/login?callbackUrl=" + encodeURIComponent(callbackUrl) : "/login";
        return;
      }
      setError(res.status === 403 ? S.restricted : data.error === "invalid_code" ? S.invalidCode : S.errorRegister);
    } catch {
      setError(S.errorNetwork);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
      <div className={styles.formBlock}>
        {logoSrc && !logoError && (
          <div className={styles.logo}>
            <Image
              src={logoSrc}
              alt=""
              width={120}
              height={48}
              priority
              unoptimized={logoSrc?.startsWith("data:")}
              onError={() => setLogoError(true)}
            />
          </div>
        )}
        <h1 className={styles.title}>{S.heading}</h1>
        <p className={styles.subtitle}>{S.subtitle}</p>

        {error && <div className={styles.error} role="alert">{error}</div>}

        {googleEnabled && <div className={styles.methods}>
          <button type="button" className={`${styles.methodButton} ${styles.methodButtonGoogle}`} onClick={handleGoogleSignUp}>
            <GoogleIcon /> Google
          </button>
        </div>}
        {googleEnabled && emailEnabled && <div className={styles.divider}><span>{S.or}</span></div>}

        {emailEnabled ? <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="register-name">{S.fullName}</label>
            <input
              id="register-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jean Dupont"
              maxLength={100}
              autoComplete="name"
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="register-email">{S.emailLabel}</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              readOnly={Boolean(challenge)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="register-password">{S.passwordLabel}</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={256}
              disabled={loading}
            />
          </div>
          {challenge && <div className={styles.formGroup}>
            <p role="status">{S.sent} {email}.</p>
            <label htmlFor="register-code">{S.code}</label>
            <input id="register-code" value={code} onChange={e => setCode(e.target.value)} required
              inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" maxLength={8} />
            <button type="button" disabled={loading} onClick={() => { setChallenge(""); setCode(""); setError(null); }}>
              {S.changeEmail}
            </button>
          </div>}
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !email.trim() || !password}
              style={{ flex: "1 1 100%" }}
            >
              {loading ? S.creatingAccount : challenge ? S.submit : S.request}
            </button>
          </div>
        </form> : <p>{S.emailOff}</p>}

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href={callbackUrl ? "/login?callbackUrl=" + encodeURIComponent(callbackUrl) : "/login"} className={styles.footerLink}>
              {S.signIn}
            </Link>
            <span className={styles.footerSep}>·</span>
            <Link href="/" className={styles.footerLink}>
              {S.backToHome}
            </Link>
          </div>
          <p className={styles.terms}>
            {S.termsPrefix}
            <Link href="/terms">{S.termsLink}</Link>
            {S.termsMiddle}
            <Link href="/privacy">{S.privacyLink}</Link>
            {S.termsSuffix}
          </p>
        </footer>
      </div>
  );

  if (!useSplitLayout) {
    return (
      <div className={styles.centeredWrap}>
        <div className={styles.centeredCard}>{formContent}</div>
      </div>
    );
  }
  return (
    <AuthSplitLayout ratio="40" rightOverlay={true}>
      {formContent}
    </AuthSplitLayout>
  );
}
