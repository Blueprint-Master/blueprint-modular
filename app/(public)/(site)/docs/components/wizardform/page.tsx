"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { WizardForm, CodeBlock } from "@/components/bpm";
import type { WizardStep } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "var(--bpm-radius-sm)",
  border: "1px solid var(--bpm-border)",
  background: "var(--bpm-surface)",
  color: "var(--bpm-text-primary)",
  fontSize: 14,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  color: "var(--bpm-text-primary)",
};

export default function DocWizardFormPage() {
  const [submitLabel, setSubmitLabel] = useState("Créer le compte");
  const [showSummary, setShowSummary] = useState(true);
  const [withCancel, setWithCancel] = useState(true);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [completed, setCompleted] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const resetWizard = () => {
    setNom("");
    setEmail("");
    setTelephone("");
    setVille("");
    setCompleted(false);
    setResetKey((k) => k + 1);
  };

  const steps: WizardStep[] = [
    {
      title: "Identité",
      description: "Nom et adresse e-mail",
      validate: () => {
        if (!nom.trim()) return "Le nom complet est obligatoire.";
        if (!email.includes("@")) return "L'adresse e-mail est invalide.";
        return true;
      },
      content: (
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="wiz-nom">Nom complet</label>
            <input
              id="wiz-nom"
              type="text"
              style={fieldStyle}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Sophie Leroy"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="wiz-email">Adresse e-mail</label>
            <input
              id="wiz-email"
              type="email"
              style={fieldStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sophie.leroy@exemple.fr"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Coordonnées",
      description: "Téléphone et ville",
      validate: () => {
        if (!telephone.trim()) return "Le numéro de téléphone est obligatoire.";
        return true;
      },
      content: (
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="wiz-tel">Téléphone</label>
            <input
              id="wiz-tel"
              type="tel"
              style={fieldStyle}
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="wiz-ville">Ville</label>
            <input
              id="wiz-ville"
              type="text"
              style={fieldStyle}
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Lyon"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Récapitulatif",
      description: "Vérification avant création",
      content: (
        <dl style={{ margin: 0, fontSize: 14, color: "var(--bpm-text-primary)" }}>
          <dt style={{ fontWeight: 600 }}>Nom</dt>
          <dd style={{ margin: "0 0 8px", color: "var(--bpm-text-secondary)" }}>{nom || "—"}</dd>
          <dt style={{ fontWeight: 600 }}>E-mail</dt>
          <dd style={{ margin: "0 0 8px", color: "var(--bpm-text-secondary)" }}>{email || "—"}</dd>
          <dt style={{ fontWeight: 600 }}>Téléphone</dt>
          <dd style={{ margin: "0 0 8px", color: "var(--bpm-text-secondary)" }}>{telephone || "—"}</dd>
          <dt style={{ fontWeight: 600 }}>Ville</dt>
          <dd style={{ margin: 0, color: "var(--bpm-text-secondary)" }}>{ville || "—"}</dd>
        </dl>
      ),
    },
  ];

  const parts = [
    "    steps=[",
    '        {"title": "Identité", "content": identity_form, "validate": validate_identity},',
    '        {"title": "Coordonnées", "content": contact_form, "validate": validate_contact},',
    '        {"title": "Récapitulatif", "content": summary_view},',
    "    ],",
    "    on_complete=handle_complete,",
  ];
  if (withCancel) parts.push("    on_cancel=handle_cancel,");
  if (submitLabel && submitLabel !== "Terminer") parts.push(`    submit_label="${submitLabel}",`);
  if (showSummary) parts.push("    show_summary=True,");
  const pythonCode = `bpm.wizardForm(\n${parts.join("\n")}\n)`;
  const { prev, next } = getPrevNext("wizardform");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.wizardForm
        </div>
        <h1>bpm.wizardForm</h1>
        <p className="doc-description">
          Formulaire multi-étapes avec stepper et validation : navigation Précédent /
          Suivant, validation par étape, récapitulatif final optionnel.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            {completed ? (
              <div
                style={{
                  border: "1px solid var(--bpm-success)",
                  borderRadius: "var(--bpm-radius)",
                  padding: 16,
                  background: "color-mix(in srgb, var(--bpm-success) 12%, var(--bpm-surface))",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: "var(--bpm-text-primary)" }}>
                  Compte créé pour {nom || "le nouvel utilisateur"}.
                </p>
                <p style={{ margin: "6px 0 12px", fontSize: 13, color: "var(--bpm-text-secondary)" }}>
                  Un e-mail de confirmation a été envoyé à {email || "l'adresse fournie"}.
                </p>
                <button type="button" onClick={resetWizard}>Recommencer la démo</button>
              </div>
            ) : (
              <WizardForm
                key={resetKey}
                steps={steps}
                onComplete={() => setCompleted(true)}
                onCancel={withCancel ? resetWizard : undefined}
                submitLabel={submitLabel || "Terminer"}
                showSummary={showSummary}
              />
            )}
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>submitLabel (bouton final)</label>
            <input
              type="text"
              value={submitLabel}
              onChange={(e) => setSubmitLabel(e.target.value)}
              placeholder="Terminer"
            />
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={showSummary}
                onChange={(e) => setShowSummary(e.target.checked)}
              />{" "}
              showSummary (récapitulatif automatique sur la dernière étape)
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={withCancel}
                onChange={(e) => setWithCancel(e.target.checked)}
              />{" "}
              onCancel (bouton Annuler — réinitialise la démo)
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>steps</code></td><td><code>&#123; title, description?, content, validate? &#125;[]</code></td><td>—</td><td>Oui</td><td>Étapes de l&apos;assistant. <code>validate()</code> retourne <code>true</code>, <code>false</code> ou un message d&apos;erreur (string) qui bloque le passage à l&apos;étape suivante.</td></tr>
          <tr><td><code>onComplete</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback appelé quand la dernière étape est validée.</td></tr>
          <tr><td><code>onCancel</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Affiche un bouton « Annuler » et reçoit le clic.</td></tr>
          <tr><td><code>submitLabel</code></td><td><code>string</code></td><td>&quot;Terminer&quot;</td><td>Non</td><td>Libellé du bouton de la dernière étape.</td></tr>
          <tr><td><code>showSummary</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Affiche sur la dernière étape un récapitulatif des étapes précédentes au-dessus de son contenu.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={`bpm.wizardForm(
    steps=[
        {"title": "Identité", "content": identity_form},
        {"title": "Coordonnées", "content": contact_form},
        {"title": "Récapitulatif", "content": summary_view},
    ],
    on_complete=handle_complete,
)`}
        language="python"
      />
      <CodeBlock
        code={`bpm.wizardForm(
    steps=[
        {"title": "Projet", "content": project_form, "validate": validate_project},
        {"title": "Budget", "content": budget_form, "validate": validate_budget},
        {"title": "Confirmation", "content": confirm_view},
    ],
    on_complete=create_project,
    on_cancel=close_modal,
    submit_label="Lancer le projet",
    show_summary=True,
)`}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
