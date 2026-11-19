"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function VeilleDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/veille">{s.moduleName}</Link> → {s.docBreadcrumb}
        </nav>
        <h1>{s.docTitle}</h1>
        <p className="doc-description">{s.docDescription}</p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.intro1}
        <strong>{s.introStrongApp}</strong>
        {s.intro2}
        <code>pip install blueprint-modular-veille</code>
        {s.introNor}
        <code>npm install blueprint-modular-veille</code>
        {s.intro3}
        <strong>{s.introStrongInstall}</strong>
        {s.intro4}
        <strong>{s.introStrongWorks}</strong>
        {s.intro5}
        <strong>{s.introStrongConfigure}</strong>
        {s.intro6}
        <code>/modules/veille</code>
        {s.intro7}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.howHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.how1}
        <code>/modules/veille</code>
        {s.how2}
        <code>bpm.*</code>
        {s.how3}
        <code>bpm.metricRow</code>
        {s.how4}
        <code>bpm.table</code>
        {s.how5}
        <code>bpm.badge</code>
        {s.how6}
        <code>bpm.anomalyAlert</code>
        {s.how7}
        <code>bpm.activityFeed</code>
        {s.how8}
        <code>bpm.input</code> + <code>bpm.selectbox</code> + <code>bpm.button</code>
        {s.how9}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.installHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.installBody}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.commandsHeading}
      </h3>
      <CodeBlock code={s.bashSnippet} language="bash" />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.envNote1}
        <code>DATABASE_URL</code>
        {s.envNoteIn}
        <code>.env</code>
        {s.envNote2}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.loadHeading}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{s.loadStrongLoad}</strong>
        {s.load1}
        <code>npm install</code>
        {s.loadAnd}
        <code>prisma migrate deploy</code>
        {s.load2}
        <strong>{s.loadStrongUse}</strong>
        {s.load3}
        <code>/modules/veille</code>
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">
        {locale === "fr" ? "Collecter les sources de votre application" : "Collect sources for your application"}
      </h2>
      <p className="mb-4 text-sm">
        {locale === "fr"
          ? "Le paquet Python blueprint-modular inclut le collecteur bpm.watch. Choisissez une base SQLite persistante par application ou organisation. Enregistrez les URL autorisées par votre équipe, puis planifiez la commande poll. Chaque source conserve son dernier succès et sa dernière erreur."
          : "The blueprint-modular Python package includes bpm.watch. Choose a persistent SQLite database per application or organization. Register the URLs approved by your team and schedule the poll command. Each source records its last success and error."}
      </p>
      <CodeBlock language="bash" code={`python -m bpm.watch --db watch.sqlite add industry feed https://example.org/feed.xml
python -m bpm.watch --db watch.sqlite add capacity json https://example.org/metrics/capacity --threshold 90
python -m bpm.watch --db watch.sqlite add terms page https://example.org/terms
python -m bpm.watch --db watch.sqlite poll
python -m bpm.watch --db watch.sqlite sources
python -m bpm.watch --db watch.sqlite items
python -m bpm.watch --db watch.sqlite alerts`} />
      <p className="my-4 text-sm">
        {locale === "fr"
          ? 'Les flux RSS et Atom utilisent les identifiants des articles. Les pages web conservent les versions distinctes du texte visible. Une API JSON peut renvoyer un objet ou une liste d’objets. Pour activer un seuil, elle doit renvoyer un objet tel que {"value": 92}. Une alerte est émise à chaque passage au seuil ou au-dessus après une observation inférieure. Le premier relevé déclenche aussi une alerte s’il atteint le seuil.'
          : 'RSS and Atom use article identifiers. Web pages retain distinct versions of visible text. JSON APIs may return an object or an array of objects. Threshold sources must return an object such as {"value": 92}. An alert is recorded when the value reaches or exceeds the threshold after being below it, including a first observation at or above the threshold.'}
      </p>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/veille" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.backToModule}
        </Link>
      </nav>
    </div>
  );
}
