"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { CodeBlock } from "@/components/bpm";
import { STR } from "../strings";

export default function MultiLangueDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/multi-langue">{s.moduleTitle}</Link> → {s.breadcrumbDocumentation}
        </nav>
        <h1>{s.docPageTitle}</h1>
        <p className="doc-description">{s.docPageDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.structureTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.structure1}
        <code>domaine.section.cle</code>
        {s.structure2}
        <strong>{s.structureRefLang}</strong>
        {s.structure3}
      </p>
      <CodeBlock
        code={`{
  "fr": {
    "app.titre": "Suivi des commandes",
    "nav.commandes": "Commandes",
    "commandes.statut.expediee": "Expédiée",
    "commandes.total": "Total des commandes",
    "action.valider": "Valider la commande",
    "message.bienvenue": "Bonjour, {prenom}",
    "commandes.nombre": "{count} commande|{count} commandes"
  },
  "en": { "app.titre": "Order tracking", "...": "..." },
  "es": { "app.titre": "Seguimiento de pedidos", "...": "..." }
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.interpolationTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.interp1}
        <code>t(&quot;message.bienvenue&quot;, {"{ prenom: \"Camille\" }"})</code>
        {s.interp2}
      </p>
      <CodeBlock
        code={`function applyVars(raw: string, vars: Record<string, string>): string {
  let out = raw;
  for (const [name, value] of Object.entries(vars)) {
    out = out.split(\`{\${name}}\`).join(value);
  }
  return out;
}`}
        language="typescript"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.pluralsTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.plural1}
        <code>one|other</code>
        {s.plural2}
        <code>Intl.PluralRules(locale).select(count)</code>
        {s.plural3}
        <code>{"{count}"}</code>
        {s.plural4}
        <code>Intl.NumberFormat</code>.
      </p>
      <CodeBlock
        code={`// "commandes.nombre": "{count} commande|{count} commandes"
const rule = new Intl.PluralRules("fr-FR").select(3); // "other"
const [one, other] = raw.split("|");
const text = (rule === "one" ? one : other).replace("{count}", "3");
// → "3 commandes" (FR) / "3 orders" (EN) / "3 pedidos" (ES)`}
        language="typescript"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.formatsTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.formats1}
        <strong>{s.formatsStrong}</strong>
        {s.formats2}
        <code>Intl</code>
        {s.formats3}
      </p>
      <CodeBlock
        code={`new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(1234.56)
// → "1 234,56 €"
new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(1234.56)
// → "€1,234.56"
new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(1234.56)
// → "1234,56 €"

const d = new Date("2026-06-10T09:30:00"); // littéral ISO figé → déterministe
new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d) // "10 juin 2026"
new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(d) // "June 10, 2026"
new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(d) // "10 de junio de 2026"`}
        language="typescript"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.fallbackSectionTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.fallbackItems.map((item) => (
          <li key={item.term}>
            <strong>{item.term}</strong>
            {item.text}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.productionTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.prod1}
        <code>Accept-Language</code>
        {s.prod2}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/multi-langue/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.openSimulator}
        </Link>
      </p>
    </div>
  );
}
