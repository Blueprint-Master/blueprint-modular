import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paramètres",
  description:
    "Paramètres Blueprint Modular — configurez votre thème, vos clés API, vos notifications et votre profil.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
