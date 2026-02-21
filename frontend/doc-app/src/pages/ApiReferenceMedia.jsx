import CodeBlock from 'bpm/CodeBlock';

const mapping = [
  ['st.image()', 'bpm.image()'],
  ['st.audio()', 'bpm.audio()'],
  ['st.video()', 'bpm.video()'],
  ['st.pdf()', 'bpm.pdf()'],
  ['st.logo()', 'bpm.logo()'],
];

export default function ApiReferenceMedia() {
  return (
    <>
      <h1>Médias</h1>
      <p className="bpm-doc-lead">
        Images, audio, vidéo, PDF, logo : <code>bpm.image</code>, <code>bpm.audio</code>, <code>bpm.video</code>, <code>bpm.pdf</code>, <code>bpm.logo</code>.
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

bpm.image("photo.jpg", caption="Légende")
bpm.audio("son.mp3")
bpm.video("video.mp4")
bpm.pdf("document.pdf")
bpm.logo()`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
