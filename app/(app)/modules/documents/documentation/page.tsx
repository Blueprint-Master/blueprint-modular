"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { strings } from "../strings";

export default function DocumentsDocumentationPage() {
  const { locale } = useI18n();
  const t = strings(locale).doc;
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{t.bcModules}</Link> → <Link href="/modules/documents">{t.bcAnalysis}</Link> → {t.bcDocumentation}
        </nav>
        <h1>{t.title}</h1>
        <p className="doc-description">
          {t.description}
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.introHtml.lead1}<strong>{t.introHtml.leadStrong1}</strong>{t.introHtml.lead2}<code>{t.introHtml.leadCode1}</code>{t.introHtml.lead3}<code>{t.introHtml.leadCode2}</code>{t.introHtml.lead4}<strong>{t.introHtml.leadStrong2}</strong>{t.introHtml.lead5}<strong>{t.introHtml.leadStrong3}</strong>{t.introHtml.lead6}<strong>{t.introHtml.leadStrong4}</strong>{t.introHtml.lead7}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.howTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.howHtml.p1}<strong>{t.howHtml.p1Strong1}</strong>{t.howHtml.p2}<strong>{t.howHtml.p2Strong}</strong>{t.howHtml.p3}<strong>{t.howHtml.p3Strong}</strong>{t.howHtml.p4}<code>{t.howHtml.pCode1}</code>{t.howHtml.p5}<code>{t.howHtml.pCode2}</code>{t.howHtml.p6}<code>{t.howHtml.pCode3}</code>{t.howHtml.p7}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>{t.statusLiStrong}</strong>{t.statusLi}</li>
        <li><strong>{t.alertLiStrong}</strong>{t.alertLi}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.installTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.installHtml.p1}<code>{t.installHtml.pCode1}</code>{t.installHtml.p2}<code>{t.installHtml.pCode2}</code>{t.installHtml.p3}<code>{t.installHtml.pCode3}</code>{t.installHtml.p4}<code>{t.installHtml.pCode4}</code>{t.installHtml.p5}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.cmdSummaryTitle}
      </h3>
      <CodeBlock
        code={t.cmdSummaryCode}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.cmdSummaryAfterHtml.p1}<code>{t.cmdSummaryAfterHtml.pCode1}</code>{t.cmdSummaryAfterHtml.p2}<code>{t.cmdSummaryAfterHtml.pCode2}</code>{t.cmdSummaryAfterHtml.p3}<code>{t.cmdSummaryAfterHtml.pCode3}</code>{t.cmdSummaryAfterHtml.p4}<code>{t.cmdSummaryAfterHtml.pCode4}</code>{t.cmdSummaryAfterHtml.p5}<code>{t.cmdSummaryAfterHtml.pCode5}</code>{t.cmdSummaryAfterHtml.p6}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.aiTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.aiHtml.p1}<strong>{t.aiHtml.pStrong1}</strong>{t.aiHtml.p2}<code>{t.aiHtml.pCode1}</code>{t.aiHtml.p3}<strong>{t.aiHtml.pStrong2}</strong>{t.aiHtml.p4}<code>{t.aiHtml.pCode2}</code>{t.aiHtml.p5}
      </p>
      <CodeBlock
        code={t.aiCode}
        language="bash"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.storageTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{t.storageHtml.pStrong1}</strong>{t.storageHtml.p1}<code>{t.storageHtml.pCode1}</code>{t.storageHtml.p2}<strong>{t.storageHtml.pStrong2}</strong>{t.storageHtml.p3}<code>{t.storageHtml.pCode2}</code>{t.storageHtml.p4}<code>{t.storageHtml.pCode3}</code>{t.storageHtml.p5}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.loadTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{t.loadHtml.pStrong1}</strong>{t.loadHtml.p1}<code>{t.loadHtml.pCode1}</code>{t.loadHtml.p2}<code>{t.loadHtml.pCode2}</code>{t.loadHtml.p3}<strong>{t.loadHtml.pStrong2}</strong>{t.loadHtml.p4}<code>{t.loadHtml.pCode3}</code>{t.loadHtml.p5}<code>{t.loadHtml.pCode4}</code>{t.loadHtml.p6}<code>{t.loadHtml.pCode5}</code>{t.loadHtml.p7}<code>{t.loadHtml.pCode6}</code>{t.loadHtml.p8}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.envTitle}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>{t.envLi.databaseUrlStrong}</code>{t.envLi.databaseUrl}</li>
        <li><code>{t.envLi.anthropicStrong}</code>{t.envLi.anthropic}</li>
        <li><code>{t.envLi.aiServerStrong}</code>, <code>{t.envLi.aiServerStrong2}</code>{t.envLi.aiServer}<code>{t.envLi.aiServerCode1}</code>{t.envLi.aiServer2}<code>{t.envLi.aiServerCode2}</code>{t.envLi.aiServer3}</li>
        <li><strong>{t.envLi.formatsStrong}</strong>{t.envLi.formats}</li>
        <li><strong>{t.envLi.maxSizeStrong}</strong>{t.envLi.maxSize}<code>{t.envLi.maxSizeCode1}</code>{t.envLi.maxSize2}</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{t.dbProdHtml.pStrong}</strong>{t.dbProdHtml.p1}<code>{t.dbProdHtml.pCode1}</code>{t.dbProdHtml.p2}<code>{t.dbProdHtml.pCode2}</code>{t.dbProdHtml.p3}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.apiTitle}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>GET /api/documents</code>{t.apiLi.list}</li>
        <li><code>POST /api/documents</code>{t.apiLi.upload}<code>{t.apiLi.uploadCode}</code>{t.apiLi.upload2}</li>
        <li><code>GET /api/documents/[id]</code>{t.apiLi.detail}</li>
        <li><code>DELETE /api/documents/[id]</code>{t.apiLi.delete}</li>
      </ul>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/documents" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          {t.backToAnalysis}
        </Link>
        <a href="https://docs.blueprint-modular.com/modules/analyse-document.html" target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          docs.blueprint-modular.com
        </a>
      </nav>
    </div>
  );
}
