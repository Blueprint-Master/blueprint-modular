import React, { useEffect, useState, useCallback } from 'react'
import { NodeRenderer } from './NodeRenderer'

interface Node {
  type: string
  props: Record<string, unknown>
}

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [appTitle, setAppTitle] = useState('BPM App')

  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch('/api/nodes')
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setNodes(data.nodes || [])
      if (data.title) setAppTitle(data.title)
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNodes()
    // Poll toutes les 500ms pour la réactivité
    const interval = setInterval(fetchNodes, 500)
    return () => clearInterval(interval)
  }, [fetchNodes])

  const handleAction = useCallback(async (action: string, payload: unknown) => {
    await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    })
    fetchNodes()
  }, [fetchNodes])

  if (loading) return (
    <div className="bpm-loading">
      <div className="bpm-spinner" />
    </div>
  )

  if (error) return (
    <div className="bpm-error">
      <h2>Erreur</h2>
      <pre>{error}</pre>
    </div>
  )

  return (
    <div className="bpm-runtime">
      <header className="bpm-runtime-header">
        <span className="bpm-runtime-logo">⚡ BPM</span>
        <span className="bpm-runtime-title">{appTitle}</span>
        <button
          className="bpm-runtime-theme-toggle"
          onClick={() => {
            const html = document.documentElement
            html.setAttribute('data-theme',
              html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
            )
          }}
        >
          🌓
        </button>
      </header>
      <main className="bpm-runtime-main">
        {nodes.map((node, i) => (
          <NodeRenderer key={i} node={node} onAction={handleAction} />
        ))}
      </main>
    </div>
  )
}
