import { LocaleSwitch } from "@/components/LocaleSwitch";

/**
 * Layout des pages d'authentification (login, register, forgot-password).
 * Affiche la bascule FR/EN en position fixe (haut-droite) sur chaque surface
 * d'auth, qui n'a pas de chrome global propre.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 50,
        }}
      >
        <LocaleSwitch />
      </div>
      {children}
    </>
  );
}
