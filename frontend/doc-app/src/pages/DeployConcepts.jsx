import { Link } from 'react-router-dom';
import CodeBlock from 'bpm/CodeBlock';

export default function DeployConcepts() {
  return (
    <>
      <h1>Concepts</h1>
      <p className="bpm-doc-lead">Comment une app Blueprint Modular fonctionne en production.</p>

      <h2>Architecture</h2>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li><strong>Processus Python</strong> : exécute votre script (<code>bpm run app.py</code> ou équivalent).</li>
        <li><strong>Serveur HTTP</strong> : BPM sert l'UI et les assets.</li>
        <li><strong>Reverse proxy (optionnel)</strong> : Nginx pour SSL, domaine.</li>
      </ul>

      <h2>Variables d'environnement</h2>
      <p>Utilisez des variables d'environnement pour la configuration. Les secrets : <code>bpm.secrets</code> ou variables injectées.</p>
      <CodeBlock language="python">{`import os
port = int(os.environ.get("BPM_PORT", 8501))`}</CodeBlock>

      <p><strong>Suivant :</strong> <Link to="/deploy/concepts" style={{ color: 'var(--bpm-doc-accent)' }}>Platforms</Link> — VPS, Docker, Nginx.</p>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
