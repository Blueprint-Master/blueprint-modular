import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sandbox",
  description:
    "Sandbox Blueprint Modular — testez et composez vos pages en temps réel avec les composants BPM, par code ou par IA.",
};

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
