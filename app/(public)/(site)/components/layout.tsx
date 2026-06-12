import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://blueprint-modular.com/components" },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
