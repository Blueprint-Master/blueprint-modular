"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  category: "Navigation",
  description: (
    <>
      Décorateur qui enregistre une fonction comme contenu de la barre latérale. La fonction peut appeler d&apos;autres composants BPM (liens, titres, boutons, etc.) pour constituer le contenu de la sidebar.
    </>
  ),
  usageTitle: "Usage",
  usage: (
    <>
      Décorez une fonction avec <code>@bpm.sidebar</code>. Lors de l&apos;exécution de l&apos;app (<code>bpm run app.py</code>), le moteur de rendu peut récupérer cette fonction via <code>bpm.get_registered(&quot;sidebar&quot;)</code> et afficher son contenu dans une colonne latérale.
    </>
  ),
  examples: "Exemples",
  thElement: "Élément",
  rowDecoratorDesc: (
    <>Décorateur à appliquer à une fonction sans arguments. La fonction est enregistrée sous le nom &quot;sidebar&quot;.</>
  ),
  rowGetRegisteredDesc: (
    <>Retourne la fonction enregistrée (ou <code>None</code>). Le moteur de rendu l&apos;appelle pour obtenir les nœuds à afficher dans la sidebar.</>
  ),
  layoutTitle: "Intégration layout",
  layout: (
    <>
      Le CLI BPM (<code>bpm run app.py</code>) et les frontends qui consomment les nœuds peuvent vérifier la présence d&apos;une sidebar enregistrée et générer une mise en page à deux colonnes : sidebar (contenu de la fonction décorée) + zone principale (contenu du script).
    </>
  ),
};
const en: typeof fr = {
  breadcrumb: "Components",
  category: "Navigation",
  description: (
    <>
      Decorator that registers a function as the sidebar content. The function can call other BPM components (links, titles, buttons, etc.) to build the sidebar content.
    </>
  ),
  usageTitle: "Usage",
  usage: (
    <>
      Decorate a function with <code>@bpm.sidebar</code>. When the app runs (<code>bpm run app.py</code>), the renderer can retrieve this function via <code>bpm.get_registered(&quot;sidebar&quot;)</code> and display its content in a side column.
    </>
  ),
  examples: "Examples",
  thElement: "Element",
  rowDecoratorDesc: (
    <>Decorator to apply to a function with no arguments. The function is registered under the name &quot;sidebar&quot;.</>
  ),
  rowGetRegisteredDesc: (
    <>Returns the registered function (or <code>None</code>). The renderer calls it to get the nodes to display in the sidebar.</>
  ),
  layoutTitle: "Layout integration",
  layout: (
    <>
      The BPM CLI (<code>bpm run app.py</code>) and the frontends that consume the nodes can check for a registered sidebar and generate a two-column layout: sidebar (content of the decorated function) + main area (script content).
    </>
  ),
};
const L = { fr, en } as const;

export default function DocSidebarPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const { prev, next } = getPrevNext("sidebar");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.sidebar
        </div>
        <h1>bpm.sidebar</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.usageTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {t.usage}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.examples}
      </h2>
      <CodeBlock
        code={`@bpm.sidebar
def my_sidebar():
    bpm.title("Menu", level=3)
    bpm.write("Accueil")
    bpm.write("Paramètres")
    bpm.button("Déconnexion")`}
        language="python"
      />
      <CodeBlock
        code={`# Enregistrement : la fonction est appelée au chargement de l'app
# Le layout (CLI / frontend) utilise bpm.get_registered("sidebar") pour
# récupérer la fonction et afficher ses nœuds dans la barre latérale.`}
        language="python"
      />

      <table className="props-table mt-6">
        <thead>
          <tr>
            <th>{t.thElement}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>@bpm.sidebar</code></td>
            <td>{t.rowDecoratorDesc}</td>
          </tr>
          <tr>
            <td><code>bpm.get_registered(&quot;sidebar&quot;)</code></td>
            <td>{t.rowGetRegisteredDesc}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.layoutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {t.layout}
      </p>

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
