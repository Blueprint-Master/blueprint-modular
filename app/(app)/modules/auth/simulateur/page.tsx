"use client";

import Link from "next/link";
import AuthSimulateur from "../simulateur-content";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

const cardStyle = {
  background: "var(--bpm-bg-primary)",
  borderColor: "var(--bpm-border)",
};
const linkStyle = { color: "var(--bpm-accent-cyan)" };

function ModelCard({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="p-5 rounded-xl border" style={cardStyle}>
      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {title}
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {description}
      </p>
      <div className="flex flex-wrap gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
            style={{ ...linkStyle, borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AuthSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale].simPage;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link>
          {" → "}
          <Link href="/modules/auth">Auth</Link>
          {" → "}
          {s.breadcrumbSim}
        </div>
        <h1>{s.title}</h1>
        <p className="doc-description">
          {s.description}
        </p>
      </div>

      <AuthSimulateur />

      <h2 className="text-lg font-semibold mt-10 mb-3" style={{ color: "var(--bpm-text-primary)" }}>
        {s.templatesTitle}
      </h2>
      <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        <ModelCard
          title={s.card1Title}
          description={s.card1Desc}
          links={[
            { href: "/login", label: s.previewLogin },
            { href: "/register", label: s.previewRegister },
          ]}
        />
        <ModelCard
          title={s.card2Title}
          description={s.card2Desc}
          links={[
            { href: "/login?layout=split", label: s.previewLogin },
            { href: "/register?layout=split", label: s.previewRegister },
          ]}
        />
        <ModelCard
          title={s.card3Title}
          description={s.card3Desc}
          links={[{ href: "/login?showEmailOption=false", label: s.previewLogin }]}
        />
      </div>

      <nav className="doc-pagination">
        <Link href="/modules/auth" className="text-sm font-medium hover:underline" style={linkStyle}>
          {s.backToModule}
        </Link>
      </nav>
    </div>
  );
}
