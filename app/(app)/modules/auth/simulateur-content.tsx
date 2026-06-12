"use client";

import { useState } from "react";
import { Badge, Button, Input, Message, Panel, Tabs, useToast } from "@/components/bpm";

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
  const [accounts, setAccounts] = useState<DemoAccount[]>(INITIAL_ACCOUNTS);
  const [session, setSession] = useState<DemoAccount | null>(null);
  const [journal, setJournal] = useState<string[]>([
    "Connexion réussie — alice.martin@acme.fr (il y a 2 h)",
    "Tentative refusée — intrus@exemple.com : domaine hors whitelist (hier)",
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

  const log = (line: string) => setJournal((prev) => [`${line} (à l'instant)`, ...prev].slice(0, 8));

  const whitelisted = (mail: string) => WHITELIST.some((d) => mail.toLowerCase().endsWith(`@${d}`));

  const handleLogin = () => {
    const mail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(mail)) {
      setLoginError("Adresse e-mail invalide.");
      return;
    }
    if (!whitelisted(mail)) {
      setLoginError(`Domaine non autorisé — whitelist : ${WHITELIST.map((d) => "@" + d).join(", ")}.`);
      log(`Tentative refusée — ${mail} : domaine hors whitelist`);
      return;
    }
    const account = accounts.find((a) => a.email === mail);
    if (!account) {
      setLoginError("Aucun compte pour cette adresse. Créez-en un dans l'onglet Inscription.");
      log(`Tentative refusée — ${mail} : compte inconnu`);
      return;
    }
    if (account.password !== password) {
      setLoginError("Mot de passe incorrect. (Comptes de démo : demo1234)");
      log(`Tentative refusée — ${mail} : mot de passe incorrect`);
      return;
    }
    setLoginError(null);
    setSession(account);
    setPassword("");
    log(`Connexion réussie — ${mail}`);
    showToast(`Bienvenue, ${account.nom}.`, "success", 4000, "Connexion réussie", "Auth", null);
  };

  const handleRegister = () => {
    const mail = regEmail.trim().toLowerCase();
    if (!regNom.trim()) {
      setRegError("Indiquez votre nom complet.");
      return;
    }
    if (!EMAIL_RE.test(mail)) {
      setRegError("Adresse e-mail invalide.");
      return;
    }
    if (!whitelisted(mail)) {
      setRegError(`Inscription limitée aux domaines : ${WHITELIST.map((d) => "@" + d).join(", ")}.`);
      log(`Inscription refusée — ${mail} : domaine hors whitelist`);
      return;
    }
    if (accounts.some((a) => a.email === mail)) {
      setRegError("Un compte existe déjà pour cette adresse.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Mot de passe : 8 caractères minimum.");
      return;
    }
    setRegError(null);
    const account: DemoAccount = { email: mail, password: regPassword, nom: regNom.trim(), role: "membre" };
    setAccounts((prev) => [...prev, account]);
    setSession(account);
    setRegNom("");
    setRegEmail("");
    setRegPassword("");
    log(`Compte créé — ${mail}`);
    showToast(`Compte créé pour ${account.nom} — vous êtes connecté.`, "success", 5000, "Inscription réussie", "Auth", null);
  };

  const handleResetRequest = () => {
    const mail = resetEmail.trim().toLowerCase();
    if (!accounts.some((a) => a.email === mail)) {
      setResetError("Adresse inconnue de l'annuaire de démo.");
      return;
    }
    setResetError(null);
    // Code « envoyé par e-mail » — affiché ici car le bac à sable n'envoie rien.
    setResetCode("493 217");
    setResetDone(false);
    log(`Code de réinitialisation envoyé — ${mail}`);
    showToast(`Code envoyé à ${mail} (affiché dans la démo).`, "info", 5000, "Réinitialisation", "Auth", null);
  };

  const handleResetConfirm = () => {
    if (resetCodeInput.replace(/\s/g, "") !== "493217") {
      setResetError("Code incorrect — reprenez celui affiché ci-dessus.");
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError("Nouveau mot de passe : 8 caractères minimum.");
      return;
    }
    const mail = resetEmail.trim().toLowerCase();
    setAccounts((prev) => prev.map((a) => (a.email === mail ? { ...a, password: resetNewPassword } : a)));
    setResetError(null);
    setResetDone(true);
    setResetCode(null);
    setResetCodeInput("");
    setResetNewPassword("");
    log(`Mot de passe réinitialisé — ${mail}`);
    showToast("Mot de passe mis à jour — reconnectez-vous.", "success", 5000, "Réinitialisation réussie", "Auth", null);
  };

  const handleLogout = () => {
    if (!session) return;
    log(`Déconnexion — ${session.email}`);
    showToast(`À bientôt, ${session.nom}.`, "info", 3000, "Déconnexion", "Auth", null);
    setSession(null);
  };

  const loginTab = (
    <div className="max-w-md">
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Comptes de démo : <code>alice.martin@acme.fr</code> ou <code>bob.durand@acme.fr</code> —
        mot de passe <code>demo1234</code>. Essayez aussi un domaine hors whitelist pour voir le refus.
      </p>
      <Input label="Adresse e-mail" type="email" value={email} onChange={setEmail} placeholder="prenom.nom@acme.fr" />
      <div className="mt-3">
        <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="demo1234" />
      </div>
      {loginError && (
        <div className="mt-3">
          <Message type="error">{loginError}</Message>
        </div>
      )}
      <Button className="mt-4" onClick={handleLogin}>
        Se connecter
      </Button>
    </div>
  );

  const registerTab = (
    <div className="max-w-md">
      <Input label="Nom complet" value={regNom} onChange={setRegNom} placeholder="Claire Petit" />
      <div className="mt-3">
        <Input label="Adresse e-mail" type="email" value={regEmail} onChange={setRegEmail} placeholder="claire.petit@acme.fr" />
      </div>
      <div className="mt-3">
        <Input label="Mot de passe (8 caractères min.)" type="password" value={regPassword} onChange={setRegPassword} />
      </div>
      {regError && (
        <div className="mt-3">
          <Message type="error">{regError}</Message>
        </div>
      )}
      <Button className="mt-4" onClick={handleRegister}>
        Créer le compte
      </Button>
    </div>
  );

  const resetTab = (
    <div className="max-w-md">
      <Input label="Adresse e-mail du compte" type="email" value={resetEmail} onChange={setResetEmail} placeholder="alice.martin@acme.fr" />
      <Button className="mt-4" variant="secondary" onClick={handleResetRequest}>
        Envoyer le code
      </Button>
      {resetCode && (
        <div className="mt-4 space-y-3">
          <Message type="info">{`Code envoyé par e-mail (démo) : ${resetCode}`}</Message>
          <Input label="Code reçu" value={resetCodeInput} onChange={setResetCodeInput} placeholder="000 000" />
          <Input label="Nouveau mot de passe" type="password" value={resetNewPassword} onChange={setResetNewPassword} />
          <Button onClick={handleResetConfirm}>Réinitialiser le mot de passe</Button>
        </div>
      )}
      {resetDone && (
        <div className="mt-3">
          <Message type="success">Mot de passe mis à jour — testez-le dans l'onglet Connexion.</Message>
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
      <Panel variant="info" title="Session simulée">
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
              {session.role === "admin" ? "Administrateur" : "Membre"}
            </Badge>
            <Button variant="secondary" onClick={handleLogout}>
              Se déconnecter
            </Button>
          </div>
        ) : (
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            Personne n&apos;est connecté dans le bac à sable. Utilisez les onglets ci-dessous —
            la vraie session de l&apos;application n&apos;est jamais modifiée.
          </p>
        )}
      </Panel>

      <Panel variant="info" title="Flux d'authentification (bac à sable)">
        <Tabs
          tabs={[
            { label: "Connexion", content: loginTab },
            { label: "Inscription", content: registerTab },
            { label: "Mot de passe oublié", content: resetTab },
          ]}
          defaultTab={0}
        />
      </Panel>

      <Panel variant="info" title="Journal des événements">
        <ul className="m-0 pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {journal.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
