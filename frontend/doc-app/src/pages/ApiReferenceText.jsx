import CodeBlock from 'bpm/CodeBlock';

const mapping = [
  ['st.write()', 'bpm.write()'],
  ['st.markdown()', 'bpm.markdown()'],
  ['st.text()', 'bpm.text()'],
  ['st.title()', 'bpm.title()'],
  ['st.header()', 'bpm.header()'],
  ['st.subheader()', 'bpm.subheader()'],
  ['st.caption()', 'bpm.caption()'],
  ['st.code()', 'bpm.code()'],
  ['st.latex()', 'bpm.latex()'],
  ['st.badge()', 'bpm.badge()'],
  ['st.html()', 'bpm.html()'],
];

export default function ApiReferenceText() {
  return (
    <>
      <h1>Texte & Affichage</h1>
      <p className="bpm-doc-lead">
        Composants d'affichage de texte : <code>bpm.write</code>, <code>bpm.markdown</code>, <code>bpm.title</code>, <code>bpm.code</code>, etc.
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

bpm.title("Mon titre")
bpm.header("Section")
bpm.subheader("Sous-section")
bpm.markdown("Du **gras** et du *italique*.")
bpm.caption("Légende discrète")
bpm.code("def hello():\\n    print('Hello')", language="python")
bpm.latex(r"E = mc^2")
bpm.badge("Nouveau")
bpm.html("<p>Contenu HTML</p>")`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
