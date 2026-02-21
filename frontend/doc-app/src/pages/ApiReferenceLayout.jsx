import CodeBlock from 'bpm/CodeBlock';
import Tabs from 'bpm/Tabs';
import Expander from 'bpm/Expander';

const mapping = [
  ['st.sidebar', 'bpm.sidebar'],
  ['st.columns()', 'bpm.columns()'],
  ['st.tabs()', 'bpm.tabs()'],
  ['st.expander()', 'bpm.expander()'],
  ['st.popover()', 'bpm.popover()'],
  ['st.container()', 'bpm.container()'],
  ['st.empty()', 'bpm.empty()'],
  ['st.form()', 'bpm.form()'],
  ['st.space()', 'bpm.space()'],
];

export default function ApiReferenceLayout() {
  return (
    <>
      <h1>Layout</h1>
      <p className="bpm-doc-lead">
        Organisation de la page : <code>bpm.sidebar</code>, <code>bpm.columns</code>, <code>bpm.tabs</code>, <code>bpm.expander</code>, etc.
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
      <p><strong>Tabs</strong></p>
      <Tabs
        tabs={[
          { label: 'Onglet 1', content: <p>Contenu de l&apos;onglet 1.</p> },
          { label: 'Onglet 2', content: <p>Contenu de l&apos;onglet 2.</p> },
        ]}
      />
      <p style={{ marginTop: '1rem' }}><strong>Expander</strong></p>
      <Expander title="Voir plus" defaultExpanded={false}>
        <p>Contenu repliable. Équivalent à <code>bpm.expander()</code>.</p>
      </Expander>
      <p style={{ marginTop: '1rem' }}><strong>Container</strong></p>
      <div style={{ padding: '1rem', border: '1px solid var(--bpm-doc-border)', borderRadius: 8 }}>
        Équivalent <code>bpm.container()</code> — bloc conteneur.
      </div>

      <h2>Code</h2>
      <CodeBlock language="python">{`import bpm

with bpm.sidebar:
    bpm.write("Menu latéral")

col1, col2 = bpm.columns(2)
with col1:
    bpm.write("Colonne 1")
with col2:
    bpm.write("Colonne 2")

tab1, tab2 = bpm.tabs(["Onglet 1", "Onglet 2"])
with tab1:
    bpm.write("Contenu 1")
with tab2:
    bpm.write("Contenu 2")

with bpm.expander("Détails"):
    bpm.write("Contenu repliable")
with bpm.popover("Options"):
    bpm.button("Action")
bpm.container()  # zone nommée
bpm.empty()       # placeholder pour mise à jour
with bpm.form("mon_form"):
    bpm.input("Champ")
    bpm.button("Envoyer")
bpm.space(2)      # espace vertical`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
