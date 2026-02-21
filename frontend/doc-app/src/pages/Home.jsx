import { Link } from 'react-router-dom';
import CodeBlock from 'bpm/CodeBlock';
import Panel from 'bpm/Panel';

export default function Home() {
  return (
    <>
      <h1>Blueprint Modular</h1>
      <p className="bpm-doc-lead">
        <strong>Briques prêtes à l'emploi.</strong> Importez depuis <code>bpm</code>, le reste est déjà fait.
      </p>

      <h2>Installation</h2>
      <CodeBlock language="bash">pip install blueprint-modular</CodeBlock>
      <p>Prérequis : Python 3.9+</p>
      <CodeBlock language="python">{`import bpm

bpm.metric("Valeur", 142500, delta=3.2)
bpm.table(df)`}</CodeBlock>
      <p>Exemple minimal : après <code>bpm run app.py</code>, votre interface est servie.</p>

      <hr />

      <h2>Commencer</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem' }}>Get started</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--bpm-doc-muted)' }}>
            Installation, fondamentaux et premier tutoriel.
          </p>
          <Link to="/get-started/installation" style={{ display: 'inline-block', marginTop: '0.5rem', background: 'var(--bpm-doc-bleu-profond)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Commencer →
          </Link>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem' }}>Components</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--bpm-doc-muted)' }}>
            Catalogue des composants BPM (Button, Panel, Table, etc.).
          </p>
          <Link to="/components" style={{ display: 'inline-block', marginTop: '0.5rem', background: 'var(--bpm-doc-bleu-profond)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Voir le catalogue →
          </Link>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem' }}>Deploy</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--bpm-doc-muted)' }}>
            Concepts et plateformes (VPS, Docker, Nginx).
          </p>
          <Link to="/deploy/concepts" style={{ display: 'inline-block', marginTop: '0.5rem', background: 'var(--bpm-doc-bleu-profond)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Déployer →
          </Link>
        </div>
      </div>

      <hr />
      <h2>What's new</h2>
      <p>Consultez le changelog des composants pour les dernières mises à jour.</p>
      <Panel variant="info" title="Info">
        Cette section sera alimentée par le changelog du package blueprint-modular.
      </Panel>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
