import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

/** Liste d'emails autorisés (optionnel). Si défini, seuls ces emails peuvent se connecter (Google ou credentials). */
export const AUTHORIZED_EMAILS: string[] = process.env.AUTHORIZED_EMAILS
  ? process.env.AUTHORIZED_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  : [];

export function isEmailAuthorized(email: string | null | undefined): boolean {
  if (!email) return false;
  if (AUTHORIZED_EMAILS.length === 0) return true;
  return AUTHORIZED_EMAILS.includes(email.trim().toLowerCase());
}

/** NextAuthOptions + trustHost (support runtime derrière proxy, types v4 incomplets) */
type AuthOptions = NextAuthOptions & { trustHost?: boolean };

export const authOptions: AuthOptions = {
  trustHost: true,
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "E-mail",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email.trim().toLowerCase();
        if (AUTHORIZED_EMAILS.length > 0 && !AUTHORIZED_EMAILS.includes(email)) return null;
        const demoPassword = process.env.CREDENTIALS_DEMO_PASSWORD;
        if (demoPassword && credentials.password === demoPassword) {
          return { id: email, email, name: email, image: null } as { id: string; email: string; name: string; image: string | null };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && AUTHORIZED_EMAILS.length > 0) {
        const email = user.email?.trim().toLowerCase();
        if (!email || !AUTHORIZED_EMAILS.includes(email)) return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};

export type Role = "OWNER" | "ADMIN" | "USER";

export function requireRole(role: Role): Role[] {
  const order: Role[] = ["USER", "ADMIN", "OWNER"];
  const i = order.indexOf(role);
  return order.slice(i);
}

export function canEdit(_user: { role?: string }, _resource: unknown): boolean {
  return true;
}

export function canContributeToWiki(user: { role?: string }): boolean {
  const r = user.role ?? "USER";
  return r === "OWNER" || r === "ADMIN";
}
