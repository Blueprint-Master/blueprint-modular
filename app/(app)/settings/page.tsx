"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/bpm/Button";
import { Panel } from "@/components/bpm/Panel";

type ApiKeyRow = { id: string; provider: string; keyMasked: string; isActive: boolean; createdAt: string };

const PROVIDERS = ["OpenAI", "Anthropic", "Google", "Groq", "Other"];

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch("/api/settings/api-keys")
      .then((r) => (r.ok ? r.json() : []))
      .then(setKeys)
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const addKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider.trim() || !keyValue.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.trim(), key: keyValue.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur");
      }
      setProvider("");
      setKeyValue("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const deleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch {
      setError("Suppression échouée");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--bpm-accent)" }}>
        Paramètres
      </h1>
      <p className="mb-8" style={{ color: "var(--bpm-text-secondary)" }}>
        Préférences et clés API (chiffrées).
      </p>

      {error && (
        <Panel variant="error" title="Erreur" className="mb-4">
          {error}
        </Panel>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
          Clés API
        </h2>
        <form onSubmit={addKey} className="flex flex-wrap gap-4 items-end mb-4">
          <label className="block">
            <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Fournisseur</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              required
              className="px-3 py-2 rounded border"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            >
              <option value="">Choisir...</option>
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Clé (secrète)</span>
            <input
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="sk-..."
              className="px-3 py-2 rounded border"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </label>
          <Button type="submit" disabled={saving}>
            {saving ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
        {loading ? (
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Chargement...</p>
        ) : keys.length === 0 ? (
          <Panel variant="info" title="Aucune clé">
            Ajoutez une clé pour utiliser l&apos;IA (OpenAI, Anthropic, etc.).
          </Panel>
        ) : (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
              >
                <span style={{ color: "var(--bpm-text-primary)" }}>{k.provider}</span>
                <span className="text-sm font-mono" style={{ color: "var(--bpm-text-secondary)" }}>{k.keyMasked}</span>
                <Button variant="outline" onClick={() => deleteKey(k.id)}>Supprimer</Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
