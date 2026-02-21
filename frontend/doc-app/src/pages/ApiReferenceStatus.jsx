import CodeBlock from 'bpm/CodeBlock';
import Spinner from 'bpm/Spinner';
import Panel from 'bpm/Panel';

const mapping = [
  ['st.spinner()', 'bpm.spinner()'],
  ['st.progress()', 'bpm.progress()'],
  ['st.status()', 'bpm.status()'],
  ['st.toast()', 'bpm.toast()'],
  ['st.balloons()', 'bpm.balloons()'],
  ['st.snow()', 'bpm.snow()'],
  ['st.exception()', 'bpm.exception()'],
];

export default function ApiReferenceStatus() {
  return (
    <>
      <h1>Statut & Feedback</h1>
      <p className="bpm-doc-lead">
        Indicateurs de chargement et notifications : <code>bpm.spinner</code>, <code>bpm.progress</code>, <code>bpm.toast</code>, etc.
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
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Spinner />
        <span>Chargement…</span>
      </div>
      <Panel variant="error" title="Exception" style={{ marginTop: '1rem' }}>
        Message d&apos;erreur (équivalent <code>bpm.exception()</code>).
      </Panel>

      <h2>Code</h2>
      <CodeBlock language="python">{`import bpm

with bpm.spinner("Chargement..."):
    time.sleep(2)
bpm.progress(0.5, "50 %")
with bpm.status("Traitement en cours"):
    do_work()
bpm.toast("Succès !", type="success")
bpm.balloons()
bpm.snow()
bpm.exception(e)`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
