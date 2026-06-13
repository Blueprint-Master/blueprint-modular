"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function AssetManagerDocumentationPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const td = t.documentation;
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{t.common.breadcrumbModules}</Link> → <Link href="/modules/asset-manager">{t.common.moduleTitle}</Link> → {td.breadcrumbDocumentation}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{td.title}</h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {td.intro}
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {td.uxHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {td.uxPara1}<code>#F5F5F7</code>{td.uxPara2}<strong>{td.uxStrongBreadcrumb}</strong>{td.uxPara3}<strong>{td.uxStrongTabs}</strong>{td.uxPara4}<strong>{td.uxStrongFilters}</strong>{td.uxPara5}<strong>{td.uxStrongEmpty}</strong>{td.uxPara6}<strong>{td.uxStrongDashboard}</strong>{td.uxPara7}
      </p>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {td.configPara1}<strong>{td.configStrongFile}</strong> (<code>lib/asset-manager/config/</code>){td.configPara2}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {td.domainConfigHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {td.domainConfigPara1}<code>lib/asset-manager/config/</code>{td.domainConfigPara2}<code>domain.it.json</code>, <code>domain.maintenance.json</code>{td.domainConfigPara3}<code>domain_id</code>, <code>asset_types</code> {td.domainConfigPara4}<code>statuses</code>, <code>ticket_categories</code>, <code>priorities</code>, <code>numbering</code>{td.domainConfigPara5}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {td.apiHeading}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>GET /api/asset-manager/config</code> — {td.apiConfigList}</li>
        <li><code>GET /api/asset-manager/config/[domainId]</code> — {td.apiConfigDomain}</li>
        <li><code>GET /api/asset-manager/assets?domainId=it</code> — {td.apiAssetsList}</li>
        <li><code>POST /api/asset-manager/assets</code> — {td.apiAssetsCreate}</li>
        <li><code>GET /api/asset-manager/assets/[id]</code> — {td.apiAssetsDetail}</li>
        <li><code>PUT /api/asset-manager/assets/[id]</code> — {td.apiAssetsUpdate}</li>
        <li><code>DELETE /api/asset-manager/assets/[id]</code> — {td.apiAssetsDelete}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {td.itsmHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {td.itsmPara1}<strong>docs/ASSET_MANAGER_ITSM_COMPLEMENTS.md</strong>{td.itsmPara2}(<code>20260227100000_asset_manager_phase2_phase3</code>){td.itsmPara3}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {td.databaseHeading}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {td.databasePara1}<code>Asset</code>, <code>AssetAttribute</code>, <code>AssetMovement</code>, <code>Ticket</code>, <code>Assignment</code>, <code>AssetContract</code>, <code>KnowledgeArticle</code>, <code>ChangeRequest</code>, <code>CIRelation</code>, <code>AuditLog</code>, <code>Permission</code>{td.databasePara2}<code>lib/asset-manager/config/domain.*.json</code>{td.databasePara3}<code>docs/DATABASE.md</code>{td.databasePara4}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {td.newDomainHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {td.newDomainPara1}<code>domain.it.json</code>{td.newDomainPara2}<code>domain.[votre_domaine].json</code>{td.newDomainPara3}<code>domain_id</code>{td.newDomainPara4}<code>asset_types</code>, <code>statuses</code>, <code>ticket_categories</code>, <code>priorities</code> {td.newDomainPara5}<code>numbering</code>{td.newDomainPara6}<code>lib/asset-manager/get-domain-config.ts</code> (<code>KNOWN_DOMAINS</code>){td.newDomainPara7}
      </p>
      <CodeBlock
        code={`// get-domain-config.ts
const KNOWN_DOMAINS = ["it", "maintenance", "votre_domaine"] as const;`}
        language="typescript"
      />

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>
          {td.backToModule}
        </Link>
      </nav>
    </div>
  );
}
