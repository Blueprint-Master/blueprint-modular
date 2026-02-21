import CodeBlock from 'bpm/CodeBlock';

const mapping = [
  ['st.connection()', 'bpm.connection()'],
  ['st.secrets', 'bpm.secrets'],
  ['st.context', 'bpm.context'],
  ['st.user', 'bpm.user'],
];

export default function ApiReferenceConnection() {
  return (
    <>
      <h1>Connexion aux données</h1>
      <p className="bpm-doc-lead">
        Connexions, secrets et contexte : <code>bpm.connection</code>, <code>bpm.secrets</code>, <code>bpm.context</code>, <code>bpm.user</code>.
      </p>

      <h2>Mapping Streamlit → BPM</h2>
      <table>
        <thead>
          <tr><th>Streamlit</th><th>BPM</th></tr>
        </thead>
        <tbody>
          {mapping.map(([st, bpm]) => (
            <tr key={st}><td>{st}</td><td><code>{bpm}</code></td></tr>
          ))}
        </tbody>
      </table>

      <h2>Exemples</h2>
      <CodeBlock language="python">{`import bpm

conn = bpm.connection("ma_connexion")
data = conn.query("SELECT * FROM table")

api_key = bpm.secrets["api_key"]
bpm.context  # contexte d'exécution
bpm.user     # utilisateur courant`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
