"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { str } from "../strings";

export default function IADocumentationPage() {
  const { locale } = useI18n();
  const t = str(locale).doc;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/ia">{t.breadcrumbIa}</Link> → {t.breadcrumbDocumentation}
        </nav>
        <h1>{t.title}</h1>
        <p className="doc-description">{t.description}</p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.intro}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.howItWorksTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.howItWorksBody}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{t.howItWorksProviders}</li>
        <li>{t.howItWorksVoice}</li>
        <li>{t.howItWorksStreaming}</li>
        <li>{t.howItWorksPrompts}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.implementationTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.implementationBody}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.loadUseTitle}
      </h2>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{t.loadLabel}</p>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.loadBody}
      </p>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{t.useLabel}</p>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.useBody}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.installTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.installBody}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.installStep1Title}
      </h3>
      <CodeBlock
        code={`npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.installStep1Note}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.installStep2Title}
      </h3>
      <CodeBlock
        code={`# Installer Ollama : https://ollama.com/download

# Lancer le serveur et télécharger le modèle :
ollama serve
ollama pull qwen3:8b

# Optionnel — autre modèle :
ollama pull mistral:7b`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.installStep2Note}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.installStep3Title}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.installStep3Body}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.summaryTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.summaryBody}
      </p>
      <CodeBlock
        code={`# 1. Dépendances Node et schéma Prisma
npm install
npx prisma generate --schema=prisma/schema.prisma

# 2. Base PostgreSQL
npx prisma migrate deploy

# 3. Serveur Ollama (terminal dédié ou arrière-plan)
ollama serve
ollama pull qwen3:8b

# 4. Lancer l&apos;app
npm run dev

# 5. Ouvrir l&apos;assistant IA
# http://localhost:3000/modules/ia`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.summaryNote}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.chooseModelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.chooseModelBody}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{t.chooseModelOllama}</li>
        <li>{t.chooseModelClaude}</li>
        <li>{t.chooseModelMock}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.envTitle}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{t.envServerUrl}</li>
        <li>{t.envModel}</li>
        <li>{t.envModelOverride}</li>
        <li>{t.envMock}</li>
        <li>{t.envTimeout}</li>
        <li>{t.envRetries}</li>
        <li>{t.envAnthropicKey}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.dollarTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.dollarBody}
      </p>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{t.dollarHowLabel}</p>
      <ol className="list-decimal pl-6 mb-4 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{t.dollarStep1}</li>
        <li>{t.dollarStep2}</li>
        <li>{t.dollarStep3}</li>
        <li>{t.dollarStep4}</li>
      </ol>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{t.dollarTokensLabel}</p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{t.dollarTokenWiki}</li>
        <li>{t.dollarTokenDoc}</li>
        <li>{t.dollarTokenMetric}</li>
        <li>{t.dollarTokenData}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.storageTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.storageBody}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.apiTitle}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{t.apiChat}</li>
        <li>{t.apiListConversations}</li>
        <li>{t.apiCreateConversation}</li>
        <li>{t.apiDeleteConversation}</li>
        <li>{t.apiMessages}</li>
        <li>{t.apiHealth}</li>
        <li>{t.apiProviders}</li>
        <li>{t.apiTranscribe}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.exampleTitle}
      </h2>
      <CodeBlock
        code={`// Le composant AIChat récupère le contexte des modules sélectionnés puis appelle l'API :
const moduleIds = moduleRegistry.getAllModules().map((m) => m.moduleId);
const { text: contextFromModules } = await moduleRegistry.buildContext(moduleIds);

const res = await fetch("/api/ai/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: userMessage,
    provider_name: "vllm",
    conversation_history: recentMessages,
    discussion_id: currentDiscussionId ?? undefined,
    context_from_modules: contextFromModules?.trim() || undefined,
  }),
  credentials: "include",
});`}
        language="typescript"
      />

      <nav className="doc-pagination mt-10">
        <Link href="/modules/ia" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          {t.backToModule}
        </Link>
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {t.externalDocsLabel}{" "}
          <a
            href="https://docs.blueprint-modular.com/modules/ia.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            docs.blueprint-modular.com
          </a>
        </span>
      </nav>
    </div>
  );
}
