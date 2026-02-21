import CodeBlock from 'bpm/CodeBlock';

const mapping = [
  ['st.line_chart()', 'bpm.chart.line()'],
  ['st.bar_chart()', 'bpm.chart.bar()'],
  ['st.area_chart()', 'bpm.chart.area()'],
  ['st.scatter_chart()', 'bpm.chart.scatter()'],
  ['st.map()', 'bpm.chart.map()'],
  ['st.plotly_chart()', 'bpm.chart.plotly()'],
  ['st.altair_chart()', 'bpm.chart.altair()'],
  ['st.pyplot()', 'bpm.chart.pyplot()'],
];

export default function ApiReferenceCharts() {
  return (
    <>
      <h1>Graphiques</h1>
      <p className="bpm-doc-lead">
        Graphiques et visualisations : <code>bpm.chart.line</code>, <code>bpm.chart.bar</code>, <code>bpm.chart.plotly</code>, etc.
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
import pandas as pd

df = pd.DataFrame({"x": range(10), "y": [i**2 for i in range(10)]})
bpm.chart.line(df, x="x", y="y")
bpm.chart.bar(df, x="x", y="y")
bpm.chart.area(df, x="x", y="y")
bpm.chart.scatter(df, x="x", y="y")
bpm.chart.map(df, lat="lat", lon="lon")

# Bibliothèques externes
bpm.chart.plotly(fig)
bpm.chart.altair(chart)
bpm.chart.pyplot(fig)`}</CodeBlock>

      <p style={{ marginTop: '3rem', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--bpm-doc-muted)', borderTop: '1px solid var(--bpm-doc-border)' }}>
        <a href="https://github.com/remigit55/blueprint-modular" style={{ color: 'var(--bpm-doc-accent)', textDecoration: 'none' }}>Voir sur GitHub</a>
      </p>
    </>
  );
}
