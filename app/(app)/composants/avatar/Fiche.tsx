"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type AvatarSize = "small" | "medium" | "large";
type AvatarVariant = "default" | "sidebar";

const fr = {
  components: "Composants",
  category: "Affichage de données",
  descriptionPre: "Avatar utilisateur (initiales ou image). Option ",
  descriptionPost: " pour afficher nom, sous-titre et bouton de déconnexion dans une sidebar.",
  copy: "Copier",
  thDefault: "Défaut",
  thDescription: "Description",
  showLogoutCheckbox: "Afficher bouton déconnexion",
  initialsPlaceholder: "ex. JD",
  namePlaceholder: "Nom",
  subtitlePlaceholder: "ex. email",
  descSrcPre: "URL de l’image (si absent, affiche ",
  descSrcPost: ").",
  descAlt: "Texte alternatif de l’image.",
  descInitials: "Initiales affichées quand pas d’image.",
  descSize: "Taille de l’avatar.",
  descVariantPre: " : bloc avec nom, sous-titre et option déconnexion.",
  descName: "Nom à côté de l’avatar (variant sidebar).",
  descSubtitle: "Sous-titre sous le nom, ex. email (variant sidebar).",
  descOnLogout: "Callback déconnexion ; si fourni, affiche le bouton (variant sidebar).",
  descLogoutLabel: "Libellé du bouton de déconnexion.",
  examples: "Exemples",
  sandboxHint: "Tester en direct dans le sandbox :",
  openSandbox: "Ouvrir dans le sandbox",
};

const en: typeof fr = {
  components: "Components",
  category: "Data display",
  descriptionPre: "User avatar (initials or image). Option ",
  descriptionPost: " to display name, subtitle and a logout button in a sidebar.",
  copy: "Copy",
  thDefault: "Default",
  thDescription: "Description",
  showLogoutCheckbox: "Show logout button",
  initialsPlaceholder: "e.g. JD",
  namePlaceholder: "Name",
  subtitlePlaceholder: "e.g. email",
  descSrcPre: "Image URL (if absent, displays ",
  descSrcPost: ").",
  descAlt: "Alternative text for the image.",
  descInitials: "Initials displayed when there is no image.",
  descSize: "Size of the avatar.",
  descVariantPre: " : block with name, subtitle and optional logout.",
  descName: "Name next to the avatar (sidebar variant).",
  descSubtitle: "Subtitle below the name, e.g. email (sidebar variant).",
  descOnLogout: "Logout callback; if provided, displays the button (sidebar variant).",
  descLogoutLabel: "Label of the logout button.",
  examples: "Examples",
  sandboxHint: "Test it live in the sandbox:",
  openSandbox: "Open in the sandbox",
};

const L = { fr, en } as const;

export default function DocAvatarPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [variant, setVariant] = useState<AvatarVariant>("default");
  const [size, setSize] = useState<AvatarSize>("medium");
  const [initials, setInitials] = useState("JD");
  const [name, setName] = useState("Jean Dupont");
  const [subtitle, setSubtitle] = useState("jean.dupont@example.com");
  const [showLogout, setShowLogout] = useState(true);
  const [logoutLabel, setLogoutLabel] = useState("Se déconnecter");

  const { prev, next } = getPrevNext("avatar");

  const parts: string[] = [];
  if (initials.trim()) parts.push(`initials="${initials.trim().replace(/"/g, '\\"')}"`);
  if (size !== "medium") parts.push(`size="${size}"`);
  if (variant === "sidebar") {
    parts.push('variant="sidebar"');
    if (name.trim()) parts.push(`name="${name.trim().replace(/"/g, '\\"')}"`);
    if (subtitle.trim()) parts.push(`subtitle="${subtitle.trim().replace(/"/g, '\\"')}"`);
    if (showLogout) parts.push("on_logout=...");
    if (showLogout && logoutLabel !== "Se déconnecter") parts.push(`logout_label="${logoutLabel.replace(/"/g, '\\"')}"`);
  }
  const pythonCode = `bpm.avatar(${parts.join(", ")})`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.components}</Link> → bpm.avatar
        </div>
        <h1>bpm.avatar</h1>
        <p className="doc-description">
          {t.descriptionPre}<code>variant=&quot;sidebar&quot;</code>{t.descriptionPost}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="max-w-xs">
            <Avatar
              variant={variant}
              size={size}
              initials={initials.trim() || undefined}
              name={variant === "sidebar" ? (name.trim() || undefined) : undefined}
              subtitle={variant === "sidebar" ? (subtitle.trim() || undefined) : undefined}
              onLogout={variant === "sidebar" && showLogout ? () => {} : undefined}
              logoutLabel={logoutLabel}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as AvatarVariant)}>
              <option value="default">default</option>
              <option value="sidebar">sidebar</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as AvatarSize)}>
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>initials</label>
            <input
              type="text"
              value={initials}
              onChange={(e) => setInitials(e.target.value)}
              placeholder={t.initialsPlaceholder}
            />
          </div>
          {variant === "sidebar" && (
            <>
              <div className="sandbox-control-group">
                <label>name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                />
              </div>
              <div className="sandbox-control-group">
                <label>subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={t.subtitlePlaceholder}
                />
              </div>
              <div className="sandbox-control-group">
                <label>
                  <input
                    type="checkbox"
                    checked={showLogout}
                    onChange={(e) => setShowLogout(e.target.checked)}
                  />{" "}
                  {t.showLogoutCheckbox}
                </label>
              </div>
              {showLogout && (
                <div className="sandbox-control-group">
                  <label>logoutLabel</label>
                  <input
                    type="text"
                    value={logoutLabel}
                    onChange={(e) => setLogoutLabel(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              Copier
            </button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Props (React)</h2>
      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thDescription}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>src</code></td>
            <td><code>string | null</code></td>
            <td>—</td>
            <td>{t.descSrcPre}<code>initials</code>{t.descSrcPost}</td>
          </tr>
          <tr>
            <td><code>alt</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.descAlt}</td>
          </tr>
          <tr>
            <td><code>initials</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.descInitials}</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>small | medium | large</code></td>
            <td>medium</td>
            <td>{t.descSize}</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>default | sidebar</code></td>
            <td>default</td>
            <td><code>sidebar</code>{t.descVariantPre}</td>
          </tr>
          <tr>
            <td><code>name</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.descName}</td>
          </tr>
          <tr>
            <td><code>subtitle</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.descSubtitle}</td>
          </tr>
          <tr>
            <td><code>onLogout</code></td>
            <td><code>() =&gt; void</code></td>
            <td>—</td>
            <td>{t.descOnLogout}</td>
          </tr>
          <tr>
            <td><code>logoutLabel</code></td>
            <td><code>string</code></td>
            <td>Se déconnecter</td>
            <td>{t.descLogoutLabel}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.avatar(initials="JD", size="medium")\nbpm.avatar(initials="RC", size="large")'} language="python" />
      <CodeBlock code={'# Dans une sidebar\nbpm.avatar(\n    variant="sidebar",\n    initials="JD",\n    name="Jean Dupont",\n    subtitle="jean.dupont@example.com",\n    on_logout=lambda: ...\n)'} language="python" />

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          {t.sandboxHint}
        </p>
        <Link href="/sandbox?component=avatar" className="doc-cta inline-block">
          {t.openSandbox}
        </Link>
      </div>

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
