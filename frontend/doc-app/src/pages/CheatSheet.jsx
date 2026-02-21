import CodeBlock from 'bpm/CodeBlock';

export default function CheatSheet() {
  return (
    <>
      <h1>Cheat sheet</h1>
      <p className="bpm-doc-lead">Toutes les fonctions BPM en un coup d'œil. Copier-collable.</p>

      <CodeBlock language="python">{`import bpm

# Texte
bpm.title("Mon titre")
bpm.markdown("Du **markdown**")
bpm.metric("Valeur", 142500, delta=3200)

# Layout
col1, col2 = bpm.columns(2)
with bpm.sidebar:
    bpm.select("Page", ["Accueil", "Données"])

# Inputs
val = bpm.toggle("Activer")
date = bpm.date_input("Date")

# Panels
bpm.panel("Info", variant="info")
bpm.panel("Attention", variant="warning")

# Status
with bpm.spinner("Chargement..."):
    time.sleep(2)
bpm.toast("Terminé !")`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
