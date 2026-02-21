import { Link } from 'react-router-dom';
import CodeBlock from 'bpm/CodeBlock';

export default function GetStartedInstallation() {
  return (
    <>
      <h1>Installation</h1>
      <p className="bpm-doc-lead">Installez Blueprint Modular et lancez votre première commande.</p>

      <h2>Prérequis</h2>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li><strong>Python 3.9+</strong></li>
        <li>Optionnel : environnement virtuel (<code>python -m venv .venv</code>)</li>
      </ul>

      <h2>Installation</h2>
      <CodeBlock language="bash">pip install blueprint-modular</CodeBlock>

      <h2>Lancer une app</h2>
      <CodeBlock language="bash">bpm run app.py</CodeBlock>
      <p>L'app est servie en local (par défaut sur un port configurable).</p>

      <h2>Scaffolder une app vide (optionnel)</h2>
      <CodeBlock language="bash">bpm init</CodeBlock>
      <p>Génère une structure minimale (ex. <code>app.py</code>) pour démarrer.</p>

      <p><strong>Suivant :</strong> <Link to="/get-started/installation" style={{ color: 'var(--bpm-doc-accent)' }}>Fundamentals</Link> — Comment fonctionne BPM.</p>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
