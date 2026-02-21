import { Link } from 'react-router-dom';
import Panel from 'bpm/Panel';
import Button from 'bpm/Button';
import CodeBlock from 'bpm/CodeBlock';

const apiRefLinks = [
  { href: '/api-reference/text', label: 'Texte & Affichage' },
  { href: '/api-reference/data', label: 'Données' },
  { href: '/api-reference/charts', label: 'Graphiques' },
  { href: '/api-reference/inputs', label: 'Inputs / Widgets' },
  { href: '/api-reference/layout', label: 'Layout' },
  { href: '/api-reference/panels', label: 'Panels' },
  { href: '/api-reference/media', label: 'Médias' },
  { href: '/api-reference/status', label: 'Statut & Feedback' },
  { href: '/api-reference/chat', label: 'Chat (Oliver)' },
  { href: '/api-reference/config', label: 'Performance & Config' },
  { href: '/api-reference/connection', label: 'Connexion aux données' },
];

export default function Components() {
  return (
    <>
      <h1>Catalogue des composants</h1>
      <p className="bpm-doc-lead">
        Briques prêtes à l&apos;emploi. Équivalents BPM des composants Streamlit — mapping complet dans l&apos;<strong>API Reference</strong>.
      </p>

      <h2>Pages API Reference (mapping Streamlit → BPM)</h2>
      <ul style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
        {apiRefLinks.map(({ href, label }) => (
          <li key={href}>
            <Link to={href} style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none', fontSize: '0.95rem' }}>{label}</Link>
          </li>
        ))}
      </ul>

      <p>
        Les composants BPM sont disponibles dans le dossier <code>bpm/</code> de ce repo.
        Exemple d&apos;utilisation :
      </p>
      <CodeBlock language="javascript">{`import { Button, Panel, Metric } from './bpm';

<Button variant="primary" onClick={() => {}}>Valider</Button>
<Panel variant="info">Message informatif.</Panel>`}</CodeBlock>

      <h2>Exemples rendus (composants BPM)</h2>
      <Panel variant="info" title="Info">Ce bloc est un <code>Panel</code> BPM (variant info).</Panel>
      <Panel variant="warning" title="Attention">Variant warning.</Panel>
      <Panel variant="success">Variant success.</Panel>
      <div style={{ marginTop: '1rem' }}>
        <Button variant="primary" onClick={() => {}}>Bouton primary</Button>
        <Button variant="secondary" onClick={() => {}} style={{ marginLeft: '0.5rem' }}>Secondary</Button>
      </div>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
