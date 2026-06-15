"use client";

import { useState } from "react";
import { Badge, Button, Card, Input, Message, Tabs, useToast } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, inlineCode, type AuthJournalEntry, type JournalEventKey } from "./strings";

interface DemoAccount {
  email: string;
  password: string;
  nom: string;
  role: "admin" | "membre";
}

/** Annuaire de démonstration — la « base utilisateurs » du bac à sable. */
const INITIAL_ACCOUNTS: DemoAccount[] = [
  { email: "alice.martin@acme.fr", password: "demo1234", nom: "Alice Martin", role: "admin" },
  { email: "bob.durand@acme.fr", password: "demo1234", nom: "Bob Durand", role: "membre" },
];

/** Domaines autorisés (whitelist) du bac à sable. */
const WHITELIST = ["acme.fr", "nordis.fr"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initials(nom: string): string {
  return nom
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Bac à sable d'authentification : tout est simulé en état local
 * (aucun appel NextAuth, la vraie session de l'app n'est jamais touchée).
 */
export default function AuthSimulateur() {
  const { showToast } = useToast();
  const { locale } = useI18n();
  const s = STR[locale].sim;
  const [accounts, setAccounts] = useState<DemoAccount[]>(INITIAL_ACCOUNTS);
  const [session, setSession] = useState<DemoAccount | null>(null);
  // Journal structuré : les entrées sont résolues dans la locale courante au rendu.
  const [journal, setJournal] = useState<AuthJournalEntry[]>([
    { kind: "seed", key: "seed1" },
    { kind: "seed", key: "seed2" },
  ]);

  // Connexion
  const [email, setEmail] = useState("alice.martin@acme.fr");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Inscription
  const [regNom, setRegNom] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState<string | null>(null);

  // Mot de passe oublié
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [resetCodeInput, setResetCodeInput] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);

  const log = (key: JournalEventKey, mail: string) =>
    setJournal((prev) => [{ kind: "event", key, mail } as AuthJournalEntry, ...prev].slice(0, 8));

  const renderJournalEntry = (entry: AuthJournalEntry): string =>
    entry.kind === "seed"
      ? s.journalSeeds[entry.key]
      : `${s.journalEvents[entry.key](entry.mail)} ${s.journalJustNow}`;

  const whitelisted = (mail: string) => WHITELIST.some((d) => mail.toLowerCase().endsWith(`@${d}`));

  const whitelistLabel = WHITELIST.map((d) => "@" + d).join(", ");

  const handleLogin = () => {
    const mail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(mail)) {
      setLoginError(s.errors.invalidEmail);
      return;
    }
    if (!whitelisted(mail)) {
      setLoginError(s.errors.domainNotAllowed(whitelistLabel));
      log("refusedDomain", mail);
      return;
    }
    const account = accounts.find((a) => a.email === mail);
    if (!account) {
      setLoginError(s.errors.unknownAccount);
      log("refusedUnknown", mail);
      return;
    }
    if (account.password !== password) {
      setLoginError(s.errors.wrongPassword);
      log("refusedPassword", mail);
      return;
    }
    setLoginError(null);
    setSession(account);
    setPassword("");
    log("loginOk", mail);
    showToast(s.toasts.welcome(account.nom), "success", 4000, s.toasts.welcomeTitle, "Auth", null);
  };

  const handleRegister = () => {
    const mail = regEmail.trim().toLowerCase();
    if (!regNom.trim()) {
      setRegError(s.errors.fullNameRequired);
      return;
    }
    if (!EMAIL_RE.test(mail)) {
      setRegError(s.errors.invalidEmail);
      return;
    }
    if (!whitelisted(mail)) {
      setRegError(s.errors.regDomainLimited(whitelistLabel));
      log("regRefusedDomain", mail);
      return;
    }
    if (accounts.some((a) => a.email === mail)) {
      setRegError(s.errors.accountExists);
      return;
    }
    if (regPassword.length < 8) {
      setRegError(s.errors.passwordTooShort);
      return;
    }
    setRegError(null);
    const account: DemoAccount = { email: mail, password: regPassword, nom: regNom.trim(), role: "membre" };
    setAccounts((prev) => [...prev, account]);
    setSession(account);
    setRegNom("");
    setRegEmail("");
    setRegPassword("");
    log("accountCreated", mail);
    showToast(s.toasts.accountCreated(account.nom), "success", 5000, s.toasts.accountCreatedTitle, "Auth", null);
  };

  const handleResetRequest = () => {
    const mail = resetEmail.trim().toLowerCase();
    if (!accounts.some((a) => a.email === mail)) {
      setResetError(s.errors.unknownResetEmail);
      return;
    }
    setResetError(null);
    // Code « envoyé par e-mail » — affiché ici car le bac à sable n'envoie rien.
    setResetCode("493 217");
    setResetDone(false);
    log("resetCodeSent", mail);
    showToast(s.toasts.codeSent(mail), "info", 5000, s.toasts.codeSentTitle, "Auth", null);
  };

  const handleResetConfirm = () => {
    if (resetCodeInput.replace(/\s/g, "") !== "493217") {
      setResetError(s.errors.wrongCode);
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError(s.errors.newPasswordTooShort);
      return;
    }
    const mail = resetEmail.trim().toLowerCase();
    setAccounts((prev) => prev.map((a) => (a.email === mail ? { ...a, password: resetNewPassword } : a)));
    setResetError(null);
    setResetDone(true);
    setResetCode(null);
    setResetCodeInput("");
    setResetNewPassword("");
    log("passwordReset", mail);
    showToast(s.toasts.passwordUpdated, "success", 5000, s.toasts.passwordUpdatedTitle, "Auth", null);
  };

  const handleLogout = () => {
    if (!session) return;
    log("signedOut", session.email);
    showToast(s.toasts.goodbye(session.nom), "info", 3000, s.toasts.goodbyeTitle, "Auth", null);
    setSession(null);
  };

  const loginTab = (
    <div className="max-w-md">
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {inlineCode(s.demoHint)}
      </p>
      <Input label={s.emailLabel} type="email" value={email} onChange={setEmail} placeholder="prenom.nom@acme.fr" />
      <div className="mt-3">
        <Input label={s.passwordLabel} type="password" value={password} onChange={setPassword} placeholder="demo1234" />
      </div>
      {loginError && (
        <div className="mt-3">
          <Message type="error">{loginError}</Message>
        </div>
      )}
      <Button className="mt-4" onClick={handleLogin}>
        {s.signIn}
      </Button>
    </div>
  );

  const registerTab = (
    <div className="max-w-md">
      <Input label={s.fullNameLabel} value={regNom} onChange={setRegNom} placeholder="Claire Petit" />
      <div className="mt-3">
        <Input label={s.emailLabel} type="email" value={regEmail} onChange={setRegEmail} placeholder="claire.petit@acme.fr" />
      </div>
      <div className="mt-3">
        <Input label={s.regPasswordLabel} type="password" value={regPassword} onChange={setRegPassword} />
      </div>
      {regError && (
        <div className="mt-3">
          <Message type="error">{regError}</Message>
        </div>
      )}
      <Button className="mt-4" onClick={handleRegister}>
        {s.createAccount}
      </Button>
    </div>
  );

  const resetTab = (
    <div className="max-w-md">
      <Input label={s.resetEmailLabel} type="email" value={resetEmail} onChange={setResetEmail} placeholder="alice.martin@acme.fr" />
      <Button className="mt-4" variant="secondary" onClick={handleResetRequest}>
        {s.sendCode}
      </Button>
      {resetCode && (
        <div className="mt-4 space-y-3">
          <Message type="info">{s.codeSentInfo(resetCode)}</Message>
          <Input label={s.codeReceivedLabel} value={resetCodeInput} onChange={setResetCodeInput} placeholder="000 000" />
          <Input label={s.newPasswordLabel} type="password" value={resetNewPassword} onChange={setResetNewPassword} />
          <Button onClick={handleResetConfirm}>{s.resetButton}</Button>
        </div>
      )}
      {resetDone && (
        <div className="mt-3">
          <Message type="success">{s.resetDone}</Message>
        </div>
      )}
      {resetError && (
        <div className="mt-3">
          <Message type="error">{resetError}</Message>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card variant="outlined" title={s.sessionPanelTitle}>
        {session ? (
          <div className="flex flex-wrap items-center gap-4">
            <span
              className="inline-flex items-center justify-center rounded-full font-semibold"
              style={{
                width: 44,
                height: 44,
                background: "var(--bpm-accent-cyan)",
                color: "#04303a",
              }}
            >
              {initials(session.nom)}
            </span>
            <div className="flex-1 min-w-[180px]">
              <div style={{ color: "var(--bpm-text-primary)", fontWeight: 600 }}>{session.nom}</div>
              <div className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {session.email}
              </div>
            </div>
            <Badge variant={session.role === "admin" ? "primary" : "default"}>
              {session.role === "admin" ? s.badgeAdmin : s.badgeMember}
            </Badge>
            <Button variant="secondary" onClick={handleLogout}>
              {s.signOut}
            </Button>
          </div>
        ) : (
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.noSession}
          </p>
        )}
      </Card>

      <Card variant="outlined" title={s.flowsPanelTitle}>
        <Tabs
          tabs={[
            { label: s.tabLogin, content: loginTab },
            { label: s.tabRegister, content: registerTab },
            { label: s.tabReset, content: resetTab },
          ]}
          defaultTab={0}
        />
      </Card>

      <Card variant="outlined" title={s.journalPanelTitle}>
        <ul className="m-0 pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {journal.map((entry, i) => (
            <li key={i}>{renderJournalEntry(entry)}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
