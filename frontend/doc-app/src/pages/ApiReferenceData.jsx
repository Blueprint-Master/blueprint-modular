import CodeBlock from 'bpm/CodeBlock';
import Metric from 'bpm/Metric';
import Table from 'bpm/Table';
const mapping = [
  ['st.dataframe()', 'bpm.dataframe()'],
  ['st.table()', 'bpm.table()'],
  ['st.metric()', 'bpm.metric()'],
  ['st.json()', 'bpm.json()'],
];

const sampleData = [
  { nom: 'Alice', score: 92, ville: 'Paris' },
  { nom: 'Bob', score: 87, ville: 'Lyon' },
  { nom: 'Claire', score: 95, ville: 'Marseille' },
];

export default function ApiReferenceData() {
  return (
    <>
      <h1>Données</h1>
      <p className="bpm-doc-lead">
        Affichage de données tabulaires et métriques : <code>bpm.dataframe</code>, <code>bpm.table</code>, <code>bpm.metric</code>, <code>bpm.json</code>.
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

      <h2>Exemples (composants BPM)</h2>
      <p><strong>Metric</strong></p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <Metric label="CA" value="124 500 €" delta={3200} deltaType="normal" />
        <Metric label="Taux" value="12,3 %" delta={-0.5} deltaType="inverse" />
      </div>

      <p><strong>Table</strong></p>
      <Table columns={[{ key: 'nom', label: 'Nom' }, { key: 'score', label: 'Score' }, { key: 'ville', label: 'Ville' }]} data={sampleData} />

      <h2>Code</h2>
      <CodeBlock language="python">{`import bpm
import pandas as pd

df = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]})
bpm.dataframe(df)
bpm.table(df)

bpm.metric(label="Revenus", value="45 200 €", delta=1200)
bpm.json({"cle": "valeur", "nested": {"a": 1}})`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
