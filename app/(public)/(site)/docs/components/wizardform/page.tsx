"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { WizardForm, CodeBlock } from "@/components/bpm";
import type { WizardStep } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description:
    "Formulaire multi-étapes avec stepper et validation : navigation Précédent / Suivant, validation par étape, récapitulatif final optionnel.",
  category: "Interaction",
  submitInitial: "Créer le compte",
  identity: {
    title: "Identité",
    description: "Nom et adresse e-mail",
    nameRequired: "Le nom complet est obligatoire.",
    emailInvalid: "L'adresse e-mail est invalide.",
    nameLabel: "Nom complet",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "sophie.leroy@exemple.fr",
  },
  contact: {
    title: "Coordonnées",
    description: "Téléphone et ville",
    phoneRequired: "Le numéro de téléphone est obligatoire.",
    phoneLabel: "Téléphone",
    cityLabel: "Ville",
  },
  summary: {
    title: "Récapitulatif",
    description: "Vérification avant création",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    city: "Ville",
  },
  success: {
    created: (name: string) => `Compte créé pour ${name}.`,
    nameFallback: "le nouvel utilisateur",
    emailSent: (email: string) => `Un e-mail de confirmation a été envoyé à ${email}.`,
    emailFallback: "l'adresse fournie",
    restart: "Recommencer la démo",
  },
  controls: {
    submitLabel: "submitLabel (bouton final)",
    showSummary: "showSummary (récapitulatif automatique sur la dernière étape)",
    onCancel: "onCancel (bouton Annuler — réinitialise la démo)",
  },
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  props: {
    steps: (
      <>
        Étapes de l&apos;assistant. <code>validate()</code> retourne <code>true</code>,{" "}
        <code>false</code> ou un message d&apos;erreur (string) qui bloque le passage à
        l&apos;étape suivante.
      </>
    ),
    onComplete: "Callback appelé quand la dernière étape est validée.",
    onCancel: "Affiche un bouton « Annuler » et reçoit le clic.",
    submitLabel: "Libellé du bouton de la dernière étape.",
    showSummary:
      "Affiche sur la dernière étape un récapitulatif des étapes précédentes au-dessus de son contenu.",
    className: "Classes CSS additionnelles.",
  },
  examples: "Exemples",
};

const en: typeof fr = {
  breadcrumb: "Components",
  description:
    "Multi-step form with stepper and validation: back / next navigation, per-step validation, optional final summary.",
  category: "Interaction",
  submitInitial: "Create account",
  identity: {
    title: "Identity",
    description: "Name and email address",
    nameRequired: "Full name is required.",
    emailInvalid: "The email address is invalid.",
    nameLabel: "Full name",
    emailLabel: "Email address",
    emailPlaceholder: "sophie.leroy@example.com",
  },
  contact: {
    title: "Contact details",
    description: "Phone and city",
    phoneRequired: "The phone number is required.",
    phoneLabel: "Phone",
    cityLabel: "City",
  },
  summary: {
    title: "Summary",
    description: "Review before creation",
    name: "Name",
    email: "Email",
    phone: "Phone",
    city: "City",
  },
  success: {
    created: (name: string) => `Account created for ${name}.`,
    nameFallback: "the new user",
    emailSent: (email: string) => `A confirmation email has been sent to ${email}.`,
    emailFallback: "the address provided",
    restart: "Restart demo",
  },
  controls: {
    submitLabel: "submitLabel (final button)",
    showSummary: "showSummary (automatic summary on the last step)",
    onCancel: "onCancel (cancel button — resets the demo)",
  },
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  props: {
    steps: (
      <>
        Steps of the wizard. <code>validate()</code> returns <code>true</code>,{" "}
        <code>false</code> or an error message (string) that blocks moving to the next step.
      </>
    ),
    onComplete: "Callback fired when the last step is validated.",
    onCancel: "Displays a cancel button and receives the click.",
    submitLabel: "Label of the last step's button.",
    showSummary:
      "On the last step, displays a summary of the previous steps above its content.",
    className: "Additional CSS classes.",
  },
  examples: "Examples",
};

const L = { fr, en };

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
  const { locale } = useI18n();
  const t = L[locale];
  const [submitLabel, setSubmitLabel] = useState(t.submitInitial);
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
      title: t.identity.title,
      description: t.identity.description,
      validate: () => {
        if (!nom.trim()) return t.identity.nameRequired;
        if (!email.includes("@")) return t.identity.emailInvalid;
        return true;
      },
      content: (
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="wiz-nom">{t.identity.nameLabel}</label>
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
            <label style={labelStyle} htmlFor="wiz-email">{t.identity.emailLabel}</label>
            <input
              id="wiz-email"
              type="email"
              style={fieldStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.identity.emailPlaceholder}
            />
          </div>
        </div>
      ),
    },
    {
      title: t.contact.title,
      description: t.contact.description,
      validate: () => {
        if (!telephone.trim()) return t.contact.phoneRequired;
        return true;
      },
      content: (
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="wiz-tel">{t.contact.phoneLabel}</label>
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
            <label style={labelStyle} htmlFor="wiz-ville">{t.contact.cityLabel}</label>
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
      title: t.summary.title,
      description: t.summary.description,
      content: (
        <dl style={{ margin: 0, fontSize: 14, color: "var(--bpm-text-primary)" }}>
          <dt style={{ fontWeight: 600 }}>{t.summary.name}</dt>
          <dd style={{ margin: "0 0 8px", color: "var(--bpm-text-secondary)" }}>{nom || "—"}</dd>
          <dt style={{ fontWeight: 600 }}>{t.summary.email}</dt>
          <dd style={{ margin: "0 0 8px", color: "var(--bpm-text-secondary)" }}>{email || "—"}</dd>
          <dt style={{ fontWeight: 600 }}>{t.summary.phone}</dt>
          <dd style={{ margin: "0 0 8px", color: "var(--bpm-text-secondary)" }}>{telephone || "—"}</dd>
          <dt style={{ fontWeight: 600 }}>{t.summary.city}</dt>
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
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.wizardForm
        </div>
        <h1>bpm.wizardForm</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
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
                  {t.success.created(nom || t.success.nameFallback)}
                </p>
                <p style={{ margin: "6px 0 12px", fontSize: 13, color: "var(--bpm-text-secondary)" }}>
                  {t.success.emailSent(email || t.success.emailFallback)}
                </p>
                <button type="button" onClick={resetWizard}>{t.success.restart}</button>
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
            <label>{t.controls.submitLabel}</label>
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
              {t.controls.showSummary}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={withCancel}
                onChange={(e) => setWithCancel(e.target.checked)}
              />{" "}
              {t.controls.onCancel}
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>steps</code></td><td><code>&#123; title, description?, content, validate? &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.props.steps}</td></tr>
          <tr><td><code>onComplete</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.props.onComplete}</td></tr>
          <tr><td><code>onCancel</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.props.onCancel}</td></tr>
          <tr><td><code>submitLabel</code></td><td><code>string</code></td><td>&quot;Terminer&quot;</td><td>{t.no}</td><td>{t.props.submitLabel}</td></tr>
          <tr><td><code>showSummary</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.props.showSummary}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.props.className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
