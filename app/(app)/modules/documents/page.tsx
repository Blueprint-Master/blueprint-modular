"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/bpm/Button";
import { Panel } from "@/components/bpm/Panel";

type Doc = {
  id: string;
  filename: string;
  mimeType: string;
  analysisStatus: string;
  supplier: string | null;
  client: string | null;
  contractDate: string | null;
  createdAt: string;
};

export default function DocumentsModulePage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/documents")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Unauthorized"))))
      .then(setDocs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const onUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input?.files?.length) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", input.files[0]);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      load();
      input.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--bpm-accent)" }}>
        Analyse de Documents
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Upload PDF, extraction IA, tableau structuré.
      </p>

      {error && (
        <Panel variant="error" title="Erreur" className="mb-4">
          {error}
        </Panel>
      )}

      <form onSubmit={onUpload} className="mb-8 flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Fichier PDF
          </span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="block w-full text-sm"
            style={{ color: "var(--bpm-text-primary)" }}
          />
        </label>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Envoi..." : "Envoyer"}
        </Button>
      </form>

      {loading && <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement...</p>}
      {!loading && docs.length === 0 && (
        <Panel variant="info" title="Aucun document">
          Envoyez un PDF pour lancer l&apos;analyse.
        </Panel>
      )}
      {!loading && docs.length > 0 && (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--bpm-border)" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "var(--bpm-bg-secondary)" }}>
              <tr>
                <th className="text-left p-3" style={{ color: "var(--bpm-text-secondary)" }}>Fichier</th>
                <th className="text-left p-3" style={{ color: "var(--bpm-text-secondary)" }}>Statut</th>
                <th className="text-left p-3" style={{ color: "var(--bpm-text-secondary)" }}>Date</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--bpm-text-primary)" }}>
              {docs.map((d) => (
                <tr key={d.id} className="border-t" style={{ borderColor: "var(--bpm-border)" }}>
                  <td className="p-3">{d.filename}</td>
                  <td className="p-3">{d.analysisStatus}</td>
                  <td className="p-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
