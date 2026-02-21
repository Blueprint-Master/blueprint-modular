import CodeBlock from 'bpm/CodeBlock';

const mapping = [
  ['@st.cache_data', '@bpm.cache_data'],
  ['@st.cache_resource', '@bpm.cache_resource'],
  ['st.set_page_config()', 'bpm.set_page_config()'],
  ['st.stop()', 'bpm.stop()'],
  ['st.rerun()', 'bpm.rerun()'],
  ['st.switch_page()', 'bpm.switch_page()'],
  ['@st.dialog', '@bpm.dialog'],
  ['@st.fragment', '@bpm.fragment'],
  ['st.query_params', 'bpm.query_params'],
  ['st.navigation()', 'bpm.navigation()'],
];

export default function ApiReferenceConfig() {
  return (
    <>
      <h1>Performance & Config</h1>
      <p className="bpm-doc-lead">
        Cache, configuration de page, navigation : <code>bpm.cache_data</code>, <code>bpm.set_page_config</code>, <code>bpm.rerun</code>, etc.
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

@bpm.cache_data(ttl=3600)
def load_data():
    return fetch_from_api()

@bpm.cache_resource
def get_model():
    return load_ml_model()

bpm.set_page_config(page_title="Mon app", layout="wide")
if not user_ok:
    bpm.stop()
bpm.rerun()
bpm.switch_page("autre_page")

@bpm.dialog("Modale")
def my_dialog():
    bpm.write("Contenu")
@bpm.fragment
def counter():
    ...

bpm.query_params["id"]
bpm.navigation(...)`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
