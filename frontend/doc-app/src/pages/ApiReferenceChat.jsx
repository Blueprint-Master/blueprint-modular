import CodeBlock from 'bpm/CodeBlock';

const mapping = [
  ['st.chat_message()', 'bpm.chat.message()'],
  ['st.chat_input()', 'bpm.chat.input()'],
  ['st.write_stream()', 'bpm.write_stream()'],
];

export default function ApiReferenceChat() {
  return (
    <>
      <h1>Chat (Oliver)</h1>
      <p className="bpm-doc-lead">
        Interface de chat : <code>bpm.chat.message</code>, <code>bpm.chat.input</code>, <code>bpm.write_stream</code>.
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

with bpm.chat.message("user"):
    bpm.write("Message de l'utilisateur")
with bpm.chat.message("assistant"):
    bpm.write("Réponse de l'assistant")

if prompt := bpm.chat.input("Votre message"):
    with bpm.chat.message("assistant"):
        bpm.write_stream(generate_response(prompt))`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
