"use client";

import { Tabs, CodeBlock } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

function DocContent() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{t.aboutHeading}</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {t.aboutBody}
      </p>
      <CodeBlock code={t.aboutCode} language="python" />
    </>
  );
}

function SimuContent() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>{t.previewIntro}</p>
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        <h3 className="text-sm font-semibold m-0 mb-3" style={{ color: "var(--bpm-text-primary)" }}>{t.previewCount(2)}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3 p-2 rounded-lg" style={{ background: "var(--bpm-sidebar-bg)" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "var(--bpm-accent-cyan)", color: "#fff" }}>AM</span>
            <div>
              <strong style={{ color: "var(--bpm-text-primary)" }}>Alice Martin</strong>
              <span className="ml-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>{t.previewDate1}</span>
              <p className="m-0 mt-1" style={{ color: "var(--bpm-text-primary)" }}>{locale === "en" ? "Good progress on the deliverable." : "Bonne avancée sur le livrable."}</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 rounded-lg" style={{ background: "var(--bpm-sidebar-bg)" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "#e67e22", color: "#fff" }}>BL</span>
            <div>
              <strong style={{ color: "var(--bpm-text-primary)" }}>Bob Leroy</strong>
              <span className="ml-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>{t.previewDate2}</span>
              <p className="m-0 mt-1" style={{ color: "var(--bpm-text-primary)" }}>{locale === "en" ? "Thanks, I’m finalizing the docs." : "Merci, je finalise la doc."}</p>
            </div>
          </div>
        </div>
        <div className="border-t pt-3 mt-3" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--bpm-text-secondary)" }}>{t.previewNewComment}</p>
          <p className="text-xs m-0" style={{ color: "var(--bpm-text-secondary)" }}>{t.previewNewHint}</p>
        </div>
      </div>
    </>
  );
}

export default function CommentairesModulePage() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={t.breadcrumbComments}
        title={t.title}
        description={t.description}
        category={t.category}
        links={[{ href: "/modules/commentaires/simulateur", label: t.openSimulator }]}
      />
      <Tabs tabs={[{ label: t.tabDocumentation, content: <DocContent /> }, { label: t.tabSimulator, content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
