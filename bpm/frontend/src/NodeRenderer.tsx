import React from 'react'

interface Node {
  type: string
  props: Record<string, unknown>
}

interface Props {
  node: Node
  onAction: (action: string, payload: unknown) => void
}

export function NodeRenderer({ node, onAction }: Props) {
  const { type, props } = node

  switch (type) {
    case 'title':
      return React.createElement(
        `h${props.level || 1}`,
        { className: `bpm-title-level-${props.level || 1}` },
        String(props.text)
      )

    case 'write':
    case 'markdown':
      return <div className="bpm-markdown" dangerouslySetInnerHTML={{ __html: String(props.text) }} />

    case 'header':
      return <h2 className="bpm-title-level-2">{String(props.text)}</h2>

    case 'subheader':
      return <h3 className="bpm-title-level-3">{String(props.text)}</h3>

    case 'caption':
      return <p style={{ color: 'var(--bpm-text-secondary)', fontSize: '0.875rem' }}>{String(props.text)}</p>

    case 'metric': {
      const delta = props.delta as number | undefined
      const isPos = delta !== undefined && delta >= 0
      return (
        <div className="bpm-metric-card">
          <div className="bpm-metric-label">{String(props.label)}</div>
          <div className="bpm-metric-value">{String(props.value)}</div>
          {delta !== undefined && (
            <div className={`bpm-metric-delta ${isPos ? 'positive' : 'negative'}`}>
              {isPos ? '▲' : '▼'} {Math.abs(delta).toLocaleString()}
            </div>
          )}
        </div>
      )
    }

    case 'table': {
      const rows = (props.rows as Record<string, unknown>[]) || []
      if (!rows.length) return <div className="bpm-empty">Aucune donnée</div>
      const cols = Object.keys(rows[0])
      return (
        <div className="bpm-table-wrapper">
          <div className="bpm-table-container">
            <table className="bpm-table bpm-table-striped bpm-table-hover">
              <thead>
                <tr>
                  {cols.map(c => <th key={c} className="bpm-table-th">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {cols.map(c => <td key={c}>{String(row[c] ?? '')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    case 'button':
      return (
        <button
          className="btn-primary"
          onClick={() => onAction('button_click', { key: props.key })}
        >
          {String(props.label)}
        </button>
      )

    case 'panel':
      return (
        <div className={`bpm-panel bpm-panel-${props.variant || 'info'}`}>
          <div className="font-semibold">{String(props.title)}</div>
          {props.body && <div>{String(props.body)}</div>}
        </div>
      )

    case 'divider':
      return (
        <div className="bpm-divider-wrap">
          <span className="bpm-divider-line" />
          {props.label && <span className="bpm-divider-label">{String(props.label)}</span>}
          <span className="bpm-divider-line" />
        </div>
      )

    case 'input':
      return (
        <div className="bpm-input-wrap">
          {props.label && <label className="bpm-input-label">{String(props.label)}</label>}
          <input
            className="bpm-input"
            type={String(props.type || 'text')}
            placeholder={String(props.placeholder || '')}
            defaultValue={String(props.value || '')}
            onChange={e => onAction('input_change', { key: props.key, value: e.target.value })}
          />
        </div>
      )

    case 'toggle':
      return (
        <label className="bpm-toggle-wrap">
          <span>{String(props.label)}</span>
          <input
            type="checkbox"
            defaultChecked={Boolean(props.value)}
            onChange={e => onAction('toggle_change', { key: props.key, value: e.target.checked })}
          />
        </label>
      )

    case 'ai_response':
      return (
        <div className="bpm-ai-response">
          <div className="bpm-ai-response-label">⚡ Réponse IA</div>
          <div className="bpm-ai-response-content">{String(props.content)}</div>
        </div>
      )

    default:
      return <div style={{ color: 'var(--bpm-text-secondary)', fontSize: '0.8rem' }}>[{type}]</div>
  }
}
