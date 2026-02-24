import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Guide d'utilisation et référence des composants BPM.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
