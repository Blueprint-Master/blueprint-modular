import Link from "next/link";
import { CodeBlock, Metric } from "@/components/bpm";
import type { Dictionary } from "@/lib/i18n";

export function GetStarted({ dict }: { dict: Dictionary }) {
  const install = dict.home.install;
  const codeDemo = dict.home.codeDemo;
  const demo = dict.homeDemo;
  const sampleCode = `import bpm\n\nbpm.metric("${demo.revenue}", 142500, delta=3200)`;

  return (
    <section className="site-section site-section-bordered">
      <div className="site-container">
        <h2>{install.title}</h2>
        <ol className="site-steps">
          {install.steps.map((step) => (
            <li className="site-step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        {/* Code → rendu : un seul appel produit un vrai composant */}
        <h3 className="site-showcase-subtitle">{codeDemo.title}</h3>
        <p className="site-section-body">{codeDemo.body}</p>
        <div className="site-split">
          <div>
            <span className="site-pane-label">{dict.common.code}</span>
            <CodeBlock code={sampleCode} language="python" />
          </div>
          <div>
            <span className="site-pane-label">{dict.common.rendered}</span>
            <div className="site-demo-panel">
              <Metric label={demo.revenue} value="142 500 €" delta={3200} />
            </div>
          </div>
        </div>

        <div className="site-hero-actions">
          <Link href="/docs/getting-started" className="site-cta-primary">
            {install.cta}
          </Link>
          <a href="/llms.txt" className="site-cta-secondary site-mono">
            {dict.home.agents.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
