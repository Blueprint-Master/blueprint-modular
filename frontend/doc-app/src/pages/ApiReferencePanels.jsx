import CodeBlock from 'bpm/CodeBlock';
import Panel from 'bpm/Panel';

export default function ApiReferencePanels() {
  return (
    <>
      <h1>Panels (BPM natif)</h1>
      <p className="bpm-doc-lead">
        Panneaux d&apos;information et d&apos;alerte BPM. Équivalents à <code>st.info()</code>, <code>st.warning()</code>, <code>st.error()</code>, <code>st.success()</code>.
      </p>

      <h2>Mapping Streamlit → BPM</h2>
      <table>
        <thead>
          <tr><th>Streamlit</th><th>BPM</th></tr>
        </thead>
        <tbody>
          <tr><td>st.info()</td><td><code>bpm.panel(..., variant=&quot;info&quot;)</code></td></tr>
          <tr><td>st.warning()</td><td><code>bpm.panel(..., variant=&quot;warning&quot;)</code></td></tr>
          <tr><td>st.error()</td><td><code>bpm.panel(..., variant=&quot;error&quot;)</code></td></tr>
          <tr><td>st.success()</td><td><code>bpm.panel(..., variant=&quot;success&quot;)</code></td></tr>
        </tbody>
      </table>

      <h2>Exemples (composants BPM)</h2>
      <Panel variant="info" title="Info">Message informatif. Équivalent à <code>st.info()</code>.</Panel>
      <Panel variant="warning" title="Attention" style={{ marginTop: '0.75rem' }}>Message d&apos;avertissement.</Panel>
      <Panel variant="error" title="Erreur" style={{ marginTop: '0.75rem' }}>Message d&apos;erreur.</Panel>
      <Panel variant="success" title="Succès" style={{ marginTop: '0.75rem' }}>Opération réussie.</Panel>

      <h2>Code</h2>
      <CodeBlock language="python">{`import bpm

bpm.panel("Message informatif.", variant="info")
bpm.panel("Attention : vérifiez les données.", variant="warning")
bpm.panel("Une erreur s'est produite.", variant="error")
bpm.panel("Sauvegarde effectuée.", variant="success")`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
