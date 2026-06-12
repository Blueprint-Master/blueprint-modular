import { createElement, type ReactNode } from "react";

/**
 * Chaînes bilingues du module Auth (page module, simulateur, documentation).
 * Parité FR/EN garantie par le type `const en: typeof fr`.
 */
const fr = {
  module: {
    loading: "Chargement…",
    description:
      "Gestion de la session et de la connexion (Google ou e-mail). Whitelist et protection des routes.",
    simulatorLink: "Simulateur (tester les 3 modèles)",
    aboutTitle: "À propos",
    aboutText:
      "Le module auth utilise NextAuth (providers Google, credentials). La session est disponible dans toute l'app ; les pages protégées redirigent vers la page de connexion si l'utilisateur n'est pas connecté.",
    templatesTitle: "Modèles de page de connexion",
    templatesIntroBefore: "Par défaut, l'app utilise le ",
    templatesIntroStrong: "modèle carte centrée",
    templatesIntroAfter: ". Trois variantes sont documentées ci-dessous.",
    card1Title: "1. Modèle carte centrée (par défaut)",
    card1Desc:
      "Carte centrée, titre + sous-titre, choix E-mail ou Google, formulaire email avec Retour / Se connecter, footer avec lien accueil et Connexion.",
    card1Li1: "Composants `LoginPage`, `RegisterPage` avec `useSplitLayout=false`",
    card1Li2: "Styles `AuthForm.module.css`",
    loginLink: "Connexion",
    registerLink: "Inscription",
    card2Title: "2. Modèle split",
    card2Desc:
      "Layout en deux panneaux : à gauche le formulaire, à droite une image de fond (équipe, collaboration) avec overlay type carte de réunion.",
    card2Li1: "Composants `LoginPage`, `RegisterPage`, `AuthSplitLayout`",
    card2Li2: "Paramètre `?layout=split`",
    card2Link: "Aperçu login",
    card3Title: "3. Modèle minimal (Google seul)",
    card3Desc:
      "Une seule option : bouton « Se connecter avec Google », titre court et lien « Retour à l'accueil ». Idéal pour les apps qui n'utilisent que OAuth.",
    card3Li1: "Pas de formulaire e-mail / mot de passe",
    card3Li2: "Même composant `LoginPage` avec `showEmailOption=false`",
    card3Link: "Aperçu",
    sessionTitle: "Session active",
    userFallback: "Utilisateur",
    signOut: "Se déconnecter",
  },

  sim: {
    sessionPanelTitle: "Session simulée",
    flowsPanelTitle: "Flux d'authentification (bac à sable)",
    journalPanelTitle: "Journal des événements",
    tabLogin: "Connexion",
    tabRegister: "Inscription",
    tabReset: "Mot de passe oublié",
    badgeAdmin: "Administrateur",
    badgeMember: "Membre",
    signOut: "Se déconnecter",
    noSession:
      "Personne n'est connecté dans le bac à sable. Utilisez les onglets ci-dessous — la vraie session de l'application n'est jamais modifiée.",
    demoHint:
      "Comptes de démo : `alice.martin@acme.fr` ou `bob.durand@acme.fr` — mot de passe `demo1234`. Essayez aussi un domaine hors whitelist pour voir le refus.",
    emailLabel: "Adresse e-mail",
    passwordLabel: "Mot de passe",
    signIn: "Se connecter",
    fullNameLabel: "Nom complet",
    regPasswordLabel: "Mot de passe (8 caractères min.)",
    createAccount: "Créer le compte",
    resetEmailLabel: "Adresse e-mail du compte",
    sendCode: "Envoyer le code",
    codeSentInfo: (code: string) => `Code envoyé par e-mail (démo) : ${code}`,
    codeReceivedLabel: "Code reçu",
    newPasswordLabel: "Nouveau mot de passe",
    resetButton: "Réinitialiser le mot de passe",
    resetDone: "Mot de passe mis à jour — testez-le dans l'onglet Connexion.",
    errors: {
      invalidEmail: "Adresse e-mail invalide.",
      domainNotAllowed: (list: string) => `Domaine non autorisé — whitelist : ${list}.`,
      unknownAccount: "Aucun compte pour cette adresse. Créez-en un dans l'onglet Inscription.",
      wrongPassword: "Mot de passe incorrect. (Comptes de démo : demo1234)",
      fullNameRequired: "Indiquez votre nom complet.",
      regDomainLimited: (list: string) => `Inscription limitée aux domaines : ${list}.`,
      accountExists: "Un compte existe déjà pour cette adresse.",
      passwordTooShort: "Mot de passe : 8 caractères minimum.",
      unknownResetEmail: "Adresse inconnue de l'annuaire de démo.",
      wrongCode: "Code incorrect — reprenez celui affiché ci-dessus.",
      newPasswordTooShort: "Nouveau mot de passe : 8 caractères minimum.",
    },
    toasts: {
      welcome: (nom: string) => `Bienvenue, ${nom}.`,
      welcomeTitle: "Connexion réussie",
      accountCreated: (nom: string) => `Compte créé pour ${nom} — vous êtes connecté.`,
      accountCreatedTitle: "Inscription réussie",
      codeSent: (mail: string) => `Code envoyé à ${mail} (affiché dans la démo).`,
      codeSentTitle: "Réinitialisation",
      passwordUpdated: "Mot de passe mis à jour — reconnectez-vous.",
      passwordUpdatedTitle: "Réinitialisation réussie",
      goodbye: (nom: string) => `À bientôt, ${nom}.`,
      goodbyeTitle: "Déconnexion",
    },
    journalSeeds: {
      seed1: "Connexion réussie — alice.martin@acme.fr (il y a 2 h)",
      seed2: "Tentative refusée — intrus@exemple.com : domaine hors whitelist (hier)",
    },
    journalEvents: {
      loginOk: (mail: string) => `Connexion réussie — ${mail}`,
      refusedDomain: (mail: string) => `Tentative refusée — ${mail} : domaine hors whitelist`,
      refusedUnknown: (mail: string) => `Tentative refusée — ${mail} : compte inconnu`,
      refusedPassword: (mail: string) => `Tentative refusée — ${mail} : mot de passe incorrect`,
      regRefusedDomain: (mail: string) => `Inscription refusée — ${mail} : domaine hors whitelist`,
      accountCreated: (mail: string) => `Compte créé — ${mail}`,
      resetCodeSent: (mail: string) => `Code de réinitialisation envoyé — ${mail}`,
      passwordReset: (mail: string) => `Mot de passe réinitialisé — ${mail}`,
      signedOut: (mail: string) => `Déconnexion — ${mail}`,
    },
    journalJustNow: "(à l'instant)",
  },

  simPage: {
    breadcrumbSim: "Simulateur",
    title: "Simulateur — Auth",
    description:
      "Jouez les flux complets dans le bac à sable : connexion (comptes de démo, whitelist de domaines, erreurs), inscription, mot de passe oublié — sans toucher la vraie session. Les trois modèles de page restent consultables en bas.",
    templatesTitle: "Modèles de page de connexion",
    card1Title: "1. Carte centrée (par défaut)",
    card1Desc: "Formulaire dans une carte centrée, option Google + e-mail.",
    card2Title: "2. Modèle split",
    card2Desc: "Formulaire à gauche, image à droite (équipe, collaboration).",
    card3Title: "3. Google seul",
    card3Desc: "Un seul bouton « Google », pas de formulaire e-mail.",
    previewLogin: "Aperçu connexion",
    previewRegister: "Aperçu inscription",
    backToModule: "← Retour au module Auth",
  },

  doc: {
    breadcrumbDoc: "Documentation",
    title: "Documentation – Auth",
    description:
      "Implémentation, choix du modèle de page de connexion, et utilisation du module Auth (NextAuth, Google, e-mail, whitelist).",
    introBefore: "Les modules Blueprint Modular font partie de l'",
    introStrong: "application Next.js",
    introAfter:
      ". Il n'y a pas de package séparé par module (pas de `pip install blueprint-modular-auth` ni `npm install blueprint-modular-auth`) : on installe l'application une fois, puis on configure les variables d'environnement (NextAuth, Google, whitelist). Cette documentation décrit comment implémenter Auth, comment choisir le modèle de page (carte centrée, split, Google seul), les lignes de code pour charger et utiliser le module, et le paramétrage (variables d'environnement).",
    implTitle: "Implémentation",
    implBefore: "Le module Auth repose sur ",
    implStrong: "NextAuth",
    implAfter:
      " (providers Google et credentials). La session est stockée en JWT et disponible côté serveur (`getServerSession`) et côté client (`useSession`). Les pages protégées redirigent vers `/login` si l'utilisateur n'est pas connecté.",
    loadTitle: "Charger le module (côté app)",
    loadLi1:
      "Route API NextAuth : `app/api/auth/[...nextauth]/route.ts` qui exporte le handler avec `authOptions`.",
    loadLi2:
      "Provider de session : envelopper l'app avec `SessionProvider` (via `AuthProvider`) dans le layout racine.",
    loadLi3: "Configuration : `lib/auth.ts` (authOptions, whitelist, callbacks).",
    exampleApiRoute: "Exemple — route API NextAuth :",
    exampleLayout: "Exemple — layout racine (charger la session côté client) :",
    codeApiRoute: `import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`,
    codeLayout: `import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// Dans app/layout.tsx :
<AuthProvider>
  {children}
</AuthProvider>`,
    dbTitle: "Base de données",
    dbText:
      "Le module Auth s'appuie sur les tables `User` et `ApiKey` (schéma Prisma). En production, `DATABASE_URL` doit être défini. Pour la liste des structures BDD et prérequis par module, voir `docs/DATABASE.md` dans le dépôt.",
    envTitle: "Variables d'environnement",
    envIntro: "À définir dans `.env` ou votre hébergeur :",
    envLi1: "`DATABASE_URL` — Connexion PostgreSQL (obligatoire pour la persistance des utilisateurs).",
    envLi2: "`GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` — pour la connexion Google.",
    envLi3: "`NEXTAUTH_SECRET` — secret pour signer les JWT (obligatoire en production).",
    envLi4: "`NEXTAUTH_URL` — URL de l'app (ex. `https://app.blueprint-modular.com`).",
    envLi5:
      "`AUTHORIZED_EMAILS` (optionnel) — liste d'emails autorisés, séparés par des virgules (whitelist). Si défini, seuls ces emails peuvent se connecter (Google ou e-mail).",
    envLi6:
      "`CREDENTIALS_DEMO_PASSWORD` (optionnel) — mot de passe unique pour le provider credentials (connexion e-mail de démo).",
    choiceTitle: "Choix du modèle de page de connexion",
    choiceBefore:
      "Trois variantes sont disponibles. Par défaut, les routes `/login` et `/register` utilisent le ",
    choiceStrong: "modèle carte centrée",
    choiceAfter:
      ". Vous pouvez activer le layout split ou le mode Google seul via les paramètres d'URL ou les props des composants.",
    tableTemplate: "Modèle",
    tableUrl: "URL / paramètres",
    tableUsage: "Usage",
    row1Name: "Carte centrée",
    row1Url: "`/login`, `/register` (défaut)",
    row1Usage: "Formulaire dans une carte centrée, option Google + e-mail.",
    row2Name: "Split",
    row2Url: "`?layout=split`",
    row2UsageBefore: "Formulaire à gauche, image à droite (ex. ",
    row2UsageAfter: ").",
    row3Name: "Google seul",
    row3Url: "`?showEmailOption=false`",
    row3UsageBefore: "Un seul bouton « Google », pas de formulaire e-mail (ex. ",
    row3UsageAfter: ").",
    snippetsTitle: "Lignes de code pour utiliser Auth",
    pagesLabel: "Pages de connexion et d'inscription (routes) :",
    pagesText:
      "Créez `app/(auth)/login/page.tsx` et `app/(auth)/register/page.tsx` qui rendent les composants `LoginPage` et `RegisterPage` avec les props souhaitées (titre, sous-titre, layout, option e-mail).",
    codeLoginRoute: `// app/(auth)/login/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginPage } from "@/components/auth";

export default async function LoginPageRoute({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const useSplitLayout = params?.layout === "split";
  const showEmailOption = params?.showEmailOption !== "false";

  return (
    <LoginPage
      title="Blueprint Modular"
      subtitle={showEmailOption ? "Connexion sécurisée (Google ou e-mail)" : "Connexion avec Google"}
      logoSrc="/img/logo-bpm-nom.jpg"
      callbackUrl={params?.callbackUrl ? decodeURIComponent(params.callbackUrl) : null}
      showEmailOption={showEmailOption}
      useSplitLayout={useSplitLayout}
    />
  );
}`,
    serverLabel: "Session côté serveur (pages, API) :",
    codeServer: `import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <div>Bonjour, {session.user?.name}</div>;
}`,
    clientLabel: "Session côté client (composants) :",
    codeClient: `"use client";
import { useSession, signOut } from "next-auth/react";

export function MonComposant() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Chargement…</p>;
  if (!session) return <p>Non connecté</p>;
  return (
    <div>
      <p>Connecté : {session.user?.email}</p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Se déconnecter</button>
    </div>
  );
}`,
    redirectLabel: "Redirection après connexion :",
    redirectText:
      'NextAuth utilise `pages.signIn: "/login"` dans `authOptions`. Pour rediriger vers une URL après login, passez `callbackUrl` en query (ex. `/login?callbackUrl=/dashboard`) ou utilisez `signIn(..., { callbackUrl: "/dashboard" })`.',
    whitelistTitle: "Whitelist (AUTHORIZED_EMAILS)",
    whitelistText:
      "Si la variable `AUTHORIZED_EMAILS` est définie (liste d'emails séparés par des virgules), seuls ces utilisateurs peuvent se connecter, que ce soit via Google ou le provider credentials. Utile pour restreindre l'accès à une équipe ou un environnement de démo.",
    backToModule: "← Retour au module Auth",
  },
};

const en: typeof fr = {
  module: {
    loading: "Loading…",
    description:
      "Session and sign-in management (Google or email). Whitelist and route protection.",
    simulatorLink: "Simulator (try the 3 templates)",
    aboutTitle: "About",
    aboutText:
      "The auth module uses NextAuth (Google and credentials providers). The session is available throughout the app; protected pages redirect to the sign-in page if the user is not signed in.",
    templatesTitle: "Sign-in page templates",
    templatesIntroBefore: "By default, the app uses the ",
    templatesIntroStrong: "centered card template",
    templatesIntroAfter: ". Three variants are documented below.",
    card1Title: "1. Centered card template (default)",
    card1Desc:
      "Centered card, title + subtitle, Email or Google choice, email form with Back / Sign in, footer with a home link and Sign in.",
    card1Li1: "`LoginPage` and `RegisterPage` components with `useSplitLayout=false`",
    card1Li2: "`AuthForm.module.css` styles",
    loginLink: "Sign in",
    registerLink: "Sign up",
    card2Title: "2. Split template",
    card2Desc:
      "Two-panel layout: the form on the left, a background image (team, collaboration) on the right with a meeting-card style overlay.",
    card2Li1: "`LoginPage`, `RegisterPage` and `AuthSplitLayout` components",
    card2Li2: "`?layout=split` parameter",
    card2Link: "Preview sign-in",
    card3Title: "3. Minimal template (Google only)",
    card3Desc:
      "A single option: a “Sign in with Google” button, a short title and a “Back to home” link. Ideal for apps that only use OAuth.",
    card3Li1: "No email / password form",
    card3Li2: "Same `LoginPage` component with `showEmailOption=false`",
    card3Link: "Preview",
    sessionTitle: "Active session",
    userFallback: "User",
    signOut: "Sign out",
  },

  sim: {
    sessionPanelTitle: "Simulated session",
    flowsPanelTitle: "Authentication flows (sandbox)",
    journalPanelTitle: "Event log",
    tabLogin: "Sign in",
    tabRegister: "Sign up",
    tabReset: "Forgot password",
    badgeAdmin: "Administrator",
    badgeMember: "Member",
    signOut: "Sign out",
    noSession:
      "No one is signed in within the sandbox. Use the tabs below — the application's real session is never modified.",
    demoHint:
      "Demo accounts: `alice.martin@acme.fr` or `bob.durand@acme.fr` — password `demo1234`. Also try a domain outside the whitelist to see it rejected.",
    emailLabel: "Email address",
    passwordLabel: "Password",
    signIn: "Sign in",
    fullNameLabel: "Full name",
    regPasswordLabel: "Password (8 characters min.)",
    createAccount: "Create account",
    resetEmailLabel: "Account email address",
    sendCode: "Send code",
    codeSentInfo: (code: string) => `Code sent by email (demo): ${code}`,
    codeReceivedLabel: "Received code",
    newPasswordLabel: "New password",
    resetButton: "Reset password",
    resetDone: "Password updated — try it in the Sign in tab.",
    errors: {
      invalidEmail: "Invalid email address.",
      domainNotAllowed: (list: string) => `Domain not allowed — whitelist: ${list}.`,
      unknownAccount: "No account for this address. Create one in the Sign up tab.",
      wrongPassword: "Incorrect password. (Demo accounts: demo1234)",
      fullNameRequired: "Please enter your full name.",
      regDomainLimited: (list: string) => `Sign-up is limited to these domains: ${list}.`,
      accountExists: "An account already exists for this address.",
      passwordTooShort: "Password must be at least 8 characters.",
      unknownResetEmail: "Address not found in the demo directory.",
      wrongCode: "Incorrect code — use the one shown above.",
      newPasswordTooShort: "New password must be at least 8 characters.",
    },
    toasts: {
      welcome: (nom: string) => `Welcome, ${nom}.`,
      welcomeTitle: "Signed in",
      accountCreated: (nom: string) => `Account created for ${nom} — you are signed in.`,
      accountCreatedTitle: "Sign-up successful",
      codeSent: (mail: string) => `Code sent to ${mail} (shown in the demo).`,
      codeSentTitle: "Password reset",
      passwordUpdated: "Password updated — sign in again.",
      passwordUpdatedTitle: "Reset successful",
      goodbye: (nom: string) => `See you soon, ${nom}.`,
      goodbyeTitle: "Signed out",
    },
    journalSeeds: {
      seed1: "Signed in — alice.martin@acme.fr (2 h ago)",
      seed2: "Attempt rejected — intrus@exemple.com: domain not on whitelist (yesterday)",
    },
    journalEvents: {
      loginOk: (mail: string) => `Signed in — ${mail}`,
      refusedDomain: (mail: string) => `Attempt rejected — ${mail}: domain not on whitelist`,
      refusedUnknown: (mail: string) => `Attempt rejected — ${mail}: unknown account`,
      refusedPassword: (mail: string) => `Attempt rejected — ${mail}: incorrect password`,
      regRefusedDomain: (mail: string) => `Sign-up rejected — ${mail}: domain not on whitelist`,
      accountCreated: (mail: string) => `Account created — ${mail}`,
      resetCodeSent: (mail: string) => `Reset code sent — ${mail}`,
      passwordReset: (mail: string) => `Password reset — ${mail}`,
      signedOut: (mail: string) => `Signed out — ${mail}`,
    },
    journalJustNow: "(just now)",
  },

  simPage: {
    breadcrumbSim: "Simulator",
    title: "Simulator — Auth",
    description:
      "Play through the full flows in the sandbox: sign-in (demo accounts, domain whitelist, errors), sign-up, forgot password — without touching the real session. The three page templates remain available below.",
    templatesTitle: "Sign-in page templates",
    card1Title: "1. Centered card (default)",
    card1Desc: "Form in a centered card, Google + email option.",
    card2Title: "2. Split template",
    card2Desc: "Form on the left, image on the right (team, collaboration).",
    card3Title: "3. Google only",
    card3Desc: "A single “Google” button, no email form.",
    previewLogin: "Preview sign-in",
    previewRegister: "Preview sign-up",
    backToModule: "← Back to the Auth module",
  },

  doc: {
    breadcrumbDoc: "Documentation",
    title: "Documentation – Auth",
    description:
      "Implementation, choosing the sign-in page template, and using the Auth module (NextAuth, Google, email, whitelist).",
    introBefore: "Blueprint Modular modules are part of the ",
    introStrong: "Next.js application",
    introAfter:
      ". There is no separate package per module (no `pip install blueprint-modular-auth` or `npm install blueprint-modular-auth`): you install the application once, then configure the environment variables (NextAuth, Google, whitelist). This documentation covers how to implement Auth, how to choose the page template (centered card, split, Google only), the lines of code to load and use the module, and the configuration (environment variables).",
    implTitle: "Implementation",
    implBefore: "The Auth module is built on ",
    implStrong: "NextAuth",
    implAfter:
      " (Google and credentials providers). The session is stored as a JWT and is available server-side (`getServerSession`) and client-side (`useSession`). Protected pages redirect to `/login` if the user is not signed in.",
    loadTitle: "Loading the module (app side)",
    loadLi1:
      "NextAuth API route: `app/api/auth/[...nextauth]/route.ts`, which exports the handler with `authOptions`.",
    loadLi2:
      "Session provider: wrap the app with `SessionProvider` (via `AuthProvider`) in the root layout.",
    loadLi3: "Configuration: `lib/auth.ts` (authOptions, whitelist, callbacks).",
    exampleApiRoute: "Example — NextAuth API route:",
    exampleLayout: "Example — root layout (load the session client-side):",
    codeApiRoute: `import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`,
    codeLayout: `import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// In app/layout.tsx:
<AuthProvider>
  {children}
</AuthProvider>`,
    dbTitle: "Database",
    dbText:
      "The Auth module relies on the `User` and `ApiKey` tables (Prisma schema). In production, `DATABASE_URL` must be set. For the list of database structures and prerequisites per module, see `docs/DATABASE.md` in the repository.",
    envTitle: "Environment variables",
    envIntro: "Set these in `.env` or in your hosting provider:",
    envLi1: "`DATABASE_URL` — PostgreSQL connection (required to persist users).",
    envLi2: "`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — for Google sign-in.",
    envLi3: "`NEXTAUTH_SECRET` — secret used to sign JWTs (required in production).",
    envLi4: "`NEXTAUTH_URL` — the app URL (e.g. `https://app.blueprint-modular.com`).",
    envLi5:
      "`AUTHORIZED_EMAILS` (optional) — comma-separated list of allowed emails (whitelist). If set, only these emails can sign in (Google or email).",
    envLi6:
      "`CREDENTIALS_DEMO_PASSWORD` (optional) — single password for the credentials provider (demo email sign-in).",
    choiceTitle: "Choosing the sign-in page template",
    choiceBefore:
      "Three variants are available. By default, the `/login` and `/register` routes use the ",
    choiceStrong: "centered card template",
    choiceAfter:
      ". You can enable the split layout or the Google-only mode via URL parameters or component props.",
    tableTemplate: "Template",
    tableUrl: "URL / parameters",
    tableUsage: "Usage",
    row1Name: "Centered card",
    row1Url: "`/login`, `/register` (default)",
    row1Usage: "Form in a centered card, Google + email option.",
    row2Name: "Split",
    row2Url: "`?layout=split`",
    row2UsageBefore: "Form on the left, image on the right (e.g. ",
    row2UsageAfter: ").",
    row3Name: "Google only",
    row3Url: "`?showEmailOption=false`",
    row3UsageBefore: "A single “Google” button, no email form (e.g. ",
    row3UsageAfter: ").",
    snippetsTitle: "Lines of code to use Auth",
    pagesLabel: "Sign-in and sign-up pages (routes):",
    pagesText:
      "Create `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx` that render the `LoginPage` and `RegisterPage` components with the desired props (title, subtitle, layout, email option).",
    codeLoginRoute: `// app/(auth)/login/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginPage } from "@/components/auth";

export default async function LoginPageRoute({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const useSplitLayout = params?.layout === "split";
  const showEmailOption = params?.showEmailOption !== "false";

  return (
    <LoginPage
      title="Blueprint Modular"
      subtitle={showEmailOption ? "Secure sign-in (Google or email)" : "Sign in with Google"}
      logoSrc="/img/logo-bpm-nom.jpg"
      callbackUrl={params?.callbackUrl ? decodeURIComponent(params.callbackUrl) : null}
      showEmailOption={showEmailOption}
      useSplitLayout={useSplitLayout}
    />
  );
}`,
    serverLabel: "Server-side session (pages, API):",
    codeServer: `import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <div>Hello, {session.user?.name}</div>;
}`,
    clientLabel: "Client-side session (components):",
    codeClient: `"use client";
import { useSession, signOut } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Loading…</p>;
  if (!session) return <p>Not signed in</p>;
  return (
    <div>
      <p>Signed in: {session.user?.email}</p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
    </div>
  );
}`,
    redirectLabel: "Redirect after sign-in:",
    redirectText:
      'NextAuth uses `pages.signIn: "/login"` in `authOptions`. To redirect to a URL after login, pass `callbackUrl` as a query parameter (e.g. `/login?callbackUrl=/dashboard`) or use `signIn(..., { callbackUrl: "/dashboard" })`.',
    whitelistTitle: "Whitelist (AUTHORIZED_EMAILS)",
    whitelistText:
      "If the `AUTHORIZED_EMAILS` variable is set (comma-separated list of emails), only those users can sign in, whether via Google or the credentials provider. Useful for restricting access to a team or a demo environment.",
    backToModule: "← Back to the Auth module",
  },
};

export const STR = { fr, en } as const;

export type AuthStrings = typeof fr;
export type JournalEventKey = keyof typeof fr.sim.journalEvents;
export type JournalSeedKey = keyof typeof fr.sim.journalSeeds;

/** Entrée structurée du journal — résolue dans la locale courante au rendu. */
export type AuthJournalEntry =
  | { kind: "seed"; key: JournalSeedKey }
  | { kind: "event"; key: JournalEventKey; mail: string };

/**
 * Rend les segments entre accents graves (`code`) comme éléments <code>.
 * Exemple : "Composants `LoginPage` avec `useSplitLayout=false`".
 */
export function inlineCode(text: string, className?: string): ReactNode {
  const parts = text.split("`");
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? createElement("code", { key: i, className }, part) : part
  );
}
