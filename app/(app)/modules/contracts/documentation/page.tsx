"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function ContractsDocumentationPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const d = t.doc;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{t.page.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/contracts">{t.page.title}</Link> → {d.breadcrumbCurrent}
        </nav>
        <h1>{d.title}</h1>
        <p className="doc-description">{d.description}</p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {d.introP1a}<strong>{d.introAppLink}</strong>{d.introP1b}<code>pip install blueprint-modular-contracts</code>{d.introP1c}<code>npm install blueprint-modular-contracts</code>{d.introP1d}<strong>{d.introHowInstall}</strong>{d.introP1e}<strong>{d.introHowWorks}</strong>{d.introP1f}<strong>{d.introHowConfigure}</strong>{d.introP1g}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.howTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {d.howP1a}<strong>{d.howUpload}</strong>{d.howP1b}<strong>{d.howAnalyze}</strong>{d.howP1c}<strong>{d.howConsult}</strong>{d.howP1d}<code>extracted_data</code>{d.howP1e}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>{d.howLiWorkspaceLabel}</strong>{d.howLiWorkspaceA}<code>service1</code>{d.howLiWorkspaceB}<code>service2</code>{d.howLiWorkspaceC}</li>
        <li><strong>{d.howLiTypeLabel}</strong>{d.howLiTypeA}<code>supplier</code>{d.howLiTypeSupplier}<code>cgv</code>{d.howLiTypeCgv}<code>other</code>{d.howLiTypeOther}</li>
        <li><strong>{d.howLiStatusLabel}</strong>{d.howLiStatusA}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.installTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {d.installP1a}<code>mammoth</code>{d.installP1b}<code>pdf-parse</code>{d.installP1c}<code>lib/ai/vllm-client</code>{d.installP1d}<code>lib/ai/contract-analyzer</code>{d.installP1e}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.cmdSummaryTitle}
      </h3>
      <CodeBlock
        code={`# 1. Dépendances Node et base PostgreSQL
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy

# 2. Serveur IA pour l&apos;analyse des contrats (Ollama)
ollama serve
ollama pull qwen3:8b

# 3. Lancer l&apos;app
npm run dev

# 4. Ouvrir le module Base contractuelle
# http://localhost:3000/modules/contracts`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {d.envP1a}<code>.env</code>{d.envP1b}<code>DATABASE_URL</code>{d.envP1c}<code>AI_SERVER_URL</code>{d.envP1d}<code>http://localhost:11434</code>{d.envP1e}<code>AI_MODEL</code>{d.envP1f}<code>qwen3:8b</code>{d.envP1g}<code>AI_MOCK=true</code>{d.envP1h}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.aiServerTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {d.aiServerP1a}<code>lib/ai/vllm-client</code>{d.aiServerP1b}
      </p>
      <CodeBlock
        code={`# Lancer Ollama et télécharger le modèle (ex. Qwen3)
ollama serve
ollama pull qwen3:8b`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {d.aiServerP2a}<code>.env</code>{d.aiServerP2b}<code>AI_SERVER_URL=http://localhost:11434</code>{d.aiServerP2c}<code>AI_MODEL=qwen3:8b</code>{d.aiServerP2d}<code>AI_MOCK=true</code>{d.aiServerP2e}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.storageTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{d.storageDbLabel}</strong>{d.storageP1a}<code>Contract</code>{d.storageP1b}<strong>{d.storageFilesLabel}</strong>{d.storageP1c}<code>uploads/contracts/[userId]/[contractId].[ext]</code>{d.storageP1d}<code>uploads/</code>{d.storageP1e}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.useTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{d.useLoadLabel}</strong>{d.useP1a}<code>npm install</code>{d.useP1b}<code>prisma migrate deploy</code>{d.useP1c}<strong>{d.useUseLabel}</strong>{d.useP1d}<code>/modules/contracts</code>{d.useP1e}<code>POST /api/contracts</code>{d.useP1f}<code>file</code>{d.useP1g}<code>workspace</code>{d.useP1h}<code>contractType</code>{d.useP1i}<code>GET /api/contracts</code>{d.useP1j}<code>workspace</code>{d.useP1k}<code>contractType</code>{d.useP1l}<code>status</code>{d.useP1m}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.envVarsTitle}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>DATABASE_URL</code>{d.envLiDatabase}</li>
        <li><code>AI_SERVER_URL</code>{d.envLiAiServerA}<code>AI_MODEL</code>{d.envLiAiServerB}<code>http://localhost:11434</code>{d.envLiAiServerC}<code>qwen3:8b</code>{d.envLiAiServerD}</li>
        <li><code>AI_MOCK</code>{d.envLiMockA}<code>true</code>{d.envLiMockB}</li>
        <li><strong>{d.envLiWorkspaceLabel}</strong>{d.envLiWorkspaceA}<code>workspace</code>{d.envLiWorkspaceB}<code>service1</code>{d.envLiWorkspaceC}</li>
        <li><strong>{d.envLiTypeLabel}</strong>{d.envLiTypeA}<code>contractType</code>{d.envLiTypeB}<code>other</code>{d.envLiTypeC}</li>
        <li><strong>{d.envLiSizeLabel}</strong>{d.envLiSizeA}<code>app/api/contracts/route.ts</code>{d.envLiSizeB}<code>client_max_body_size</code>{d.envLiSizeC}</li>
        <li><strong>{d.envLiFormatsLabel}</strong>{d.envLiFormatsA}</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{d.envDbProdLabel}</strong>{d.envDbProdA}<code>Contract</code>{d.envDbProdB}<code>docs/DATABASE.md</code>{d.envDbProdC}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.apiTitle}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>GET /api/contracts</code>{d.apiLiListA}<code>workspace</code>{d.apiLiListB}<code>contractType</code>{d.apiLiListC}<code>status</code>{d.apiLiListD}</li>
        <li><code>POST /api/contracts</code>{d.apiLiPostA}<code>file</code>{d.apiLiPostB}<code>workspace</code>{d.apiLiPostC}<code>contractType</code>{d.apiLiPostD}</li>
        <li><code>GET /api/contracts/[id]</code>{d.apiLiDetailA}</li>
        <li><code>POST /api/contracts/[id]/reanalyze</code>{d.apiLiReanalyzeA}</li>
        <li><code>GET /api/contracts/search</code>{d.apiLiSearchA}</li>
      </ul>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/contracts" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          {d.backToRepository}
        </Link>
        <a href="https://docs.blueprint-modular.com/" target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          docs.blueprint-modular.com
        </a>
      </nav>
    </div>
  );
}
