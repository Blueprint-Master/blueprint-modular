import CodeBlock from 'bpm/CodeBlock';
import Button from 'bpm/Button';
import Selectbox from 'bpm/Selectbox';
import NumberInput from 'bpm/NumberInput';
import DateInput from 'bpm/DateInput';
import ColorPicker from 'bpm/ColorPicker';

const mapping = [
  ['st.button()', 'bpm.button()'],
  ['st.download_button()', 'bpm.download_button()'],
  ['st.link_button()', 'bpm.link_button()'],
  ['st.checkbox()', 'bpm.checkbox()'],
  ['st.toggle()', 'bpm.toggle()'],
  ['st.radio()', 'bpm.radio()'],
  ['st.selectbox()', 'bpm.select()'],
  ['st.multiselect()', 'bpm.multiselect()'],
  ['st.slider()', 'bpm.slider()'],
  ['st.select_slider()', 'bpm.select_slider()'],
  ['st.text_input()', 'bpm.input()'],
  ['st.number_input()', 'bpm.number_input()'],
  ['st.text_area()', 'bpm.textarea()'],
  ['st.date_input()', 'bpm.date_input()'],
  ['st.time_input()', 'bpm.time_input()'],
  ['st.datetime_input()', 'bpm.datetime_input()'],
  ['st.file_uploader()', 'bpm.file_uploader()'],
  ['st.camera_input()', 'bpm.camera_input()'],
  ['st.color_picker()', 'bpm.color_picker()'],
  ['st.feedback()', 'bpm.feedback()'],
  ['st.pills()', 'bpm.pills()'],
  ['st.segmented_control()', 'bpm.segmented_control()'],
  ['st.data_editor()', 'bpm.data_editor()'],
];

export default function ApiReferenceInputs() {
  return (
    <>
      <h1>Inputs / Widgets</h1>
      <p className="bpm-doc-lead">
        Boutons, champs de saisie, sélecteurs : <code>bpm.button</code>, <code>bpm.select</code>, <code>bpm.input</code>, etc.
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
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <Button variant="primary" onClick={() => {}}>Valider</Button>
        <Button variant="secondary" onClick={() => {}}>Annuler</Button>
      </div>
      <div style={{ marginBottom: '1rem', maxWidth: 280 }}>
        <Selectbox options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]} onChange={() => {}} />
      </div>
      <div style={{ marginBottom: '1rem', maxWidth: 200 }}>
        <NumberInput value={42} onChange={() => {}} />
      </div>
      <div style={{ marginBottom: '1rem', maxWidth: 200 }}>
        <DateInput value="2025-02-21" onChange={() => {}} />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <ColorPicker value="#00A3E0" onChange={() => {}} />
      </div>

      <h2>Code</h2>
      <CodeBlock language="python">{`import bpm

bpm.button("Valider", key="ok")
bpm.download_button("Télécharger", data=bytes, file_name="fichier.csv")
bpm.link_button("Lien", url="https://...")
bpm.checkbox("Accepter", key="cb")
bpm.toggle("Activer", key="tg")
bpm.radio("Choix", options=["A", "B", "C"], key="r")
bpm.select("Option", options=["A", "B"], key="sel")
bpm.multiselect("Plusieurs", options=["X", "Y"], key="ms")
bpm.slider("Valeur", 0, 100, 50, key="sl")
bpm.input("Texte", key="txt")
bpm.number_input("Nombre", value=0, key="num")
bpm.textarea("Commentaire", key="ta")
bpm.date_input("Date", key="dt")
bpm.time_input("Heure", key="tm")
bpm.datetime_input("Date/heure", key="dtm")
bpm.file_uploader("Fichier", key="fu")
bpm.camera_input("Photo", key="cam")
bpm.color_picker("Couleur", key="col")
bpm.feedback("Avis", key="fb")
bpm.pills("Pills", options=["1", "2"], key="pills")
bpm.segmented_control("Seg", options=["A", "B"], key="seg")
bpm.data_editor(df, key="editor")`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
