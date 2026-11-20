"use client";

import { useState, useEffect } from "react";
import { newsletterHeaderUrl } from "@/lib/newsletter-header";
import Link from "next/link";
import { Button, Card, Input } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function NewsletterParametresPage() {
  const { locale } = useI18n();
  const str = STR[locale];
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"saved" | "error" | "conflict" | null>(null);

  useEffect(() => {
    fetch("/api/newsletter/settings", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setRevision(data.revision);
        else setMessage("error");
        if (data?.headerImageUrl) setHeaderImageUrl(data.headerImageUrl);
        setLoading(false);
      })
      .catch(() => { setMessage("error"); setLoading(false); });
  }, []);

  const previewUrl = newsletterHeaderUrl(headerImageUrl);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/newsletter/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headerImageUrl: headerImageUrl.trim() || null, revision }),
        credentials: "include",
      });
      if (res.ok) { setRevision((await res.json()).revision); setMessage("saved"); }
      else if (res.status === 409) setMessage("conflict");
      else setMessage("error");
    } catch {
      setMessage("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="doc-page">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">{str.moduleName}</Link> → {str.settingsBreadcrumb}
        </div>
        <p style={{ color: "var(--bpm-text-secondary)" }}>{str.settingsLoading}</p>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">{str.moduleName}</Link> → {str.settingsBreadcrumb}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {str.settingsTitle}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {str.settingsDescription}
        </p>
      </div>

      <Card variant="outlined" title={str.settingsPanelTitle}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {str.imageUrlLabel}
            </label>
            <Input
              type="text"
              value={headerImageUrl}
              onChange={setHeaderImageUrl}
              placeholder={str.imageUrlPlaceholder}
              aria-label={str.imageUrlAria}
            />
          </div>
          {previewUrl && (
            <div>
              <span className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
                {str.previewLabel}
              </span>
              <div
                className="rounded-lg border overflow-hidden bg-center bg-cover bg-no-repeat"
                style={{
                  borderColor: "var(--bpm-border)",
                  height: 120,
                  backgroundImage: `url(${JSON.stringify(previewUrl)})`,
                }}
                role="img"
                aria-label={str.previewAria}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={saving || revision === null || message === "conflict"}>
              {saving ? str.saving : str.save}
            </Button>
            {(message === "conflict" || (message === "error" && revision === null)) && <p role="alert">
              {message === "conflict" && (locale === "en" ? "The header changed in another session. " : "La photo a changé dans une autre session. ")}
              <button className="underline" type="button" onClick={() => window.location.reload()}>{locale === "en" ? "Reload" : "Recharger"}</button>
            </p>}
            {message === "saved" && (
              <span className="text-sm" style={{ color: "var(--bpm-accent-mint)" }}>
                {str.savedMessage}
              </span>
            )}
            {message === "error" && (
              <span className="text-sm" style={{ color: "var(--bpm-accent)" }}>
                {str.saveError}
              </span>
            )}
          </div>
        </form>
      </Card>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
          {str.backToModule}
        </Link>
      </nav>
    </div>
  );
}
