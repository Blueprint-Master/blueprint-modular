"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, inlineCode } from "../strings";

export default function AuthDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale].doc;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link>
          {" → "}
          <Link href="/modules/auth">Auth</Link>
          {" → "}
          {s.breadcrumbDoc}
        </nav>
        <h1>{s.title}</h1>
        <p className="doc-description">
          {s.description}
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.introBefore}<strong>{s.introStrong}</strong>{inlineCode(s.introAfter)}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.implTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.implBefore}<strong>{s.implStrong}</strong>{inlineCode(s.implAfter)}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.loadTitle}
      </h3>
      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{inlineCode(s.loadLi1)}</li>
        <li>{inlineCode(s.loadLi2)}</li>
        <li>{inlineCode(s.loadLi3)}</li>
      </ul>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{s.exampleApiRoute}</p>
      <CodeBlock code={s.codeApiRoute} language="typescript" />

      <p className="mb-2 mt-4 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{s.exampleLayout}</p>
      <CodeBlock code={s.codeLayout} language="typescript" />

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.dbTitle}
      </h3>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {inlineCode(s.dbText)}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.envTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {inlineCode(s.envIntro)}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{inlineCode(s.envLi1)}</li>
        <li>{inlineCode(s.envLi2)}</li>
        <li>{inlineCode(s.envLi3)}</li>
        <li>{inlineCode(s.envLi4)}</li>
        <li>{inlineCode(s.envLi5)}</li>
        <li>{inlineCode(s.envLi6)}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.choiceTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {inlineCode(s.choiceBefore)}<strong>{s.choiceStrong}</strong>{inlineCode(s.choiceAfter)}
      </p>

      <table className="w-full border-collapse text-sm mb-6" style={{ borderColor: "var(--bpm-border)" }}>
        <thead>
          <tr>
            <th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{s.tableTemplate}</th>
            <th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{s.tableUrl}</th>
            <th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{s.tableUsage}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><strong>{s.row1Name}</strong></td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{inlineCode(s.row1Url)}</td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{s.row1Usage}</td>
          </tr>
          <tr>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><strong>{s.row2Name}</strong></td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{inlineCode(s.row2Url)}</td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{s.row2UsageBefore}<Link href="/login?layout=split" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>/login?layout=split</Link>{s.row2UsageAfter}</td>
          </tr>
          <tr>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><strong>{s.row3Name}</strong></td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{inlineCode(s.row3Url)}</td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{s.row3UsageBefore}<Link href="/login?showEmailOption=false" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>/login?showEmailOption=false</Link>{s.row3UsageAfter}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.snippetsTitle}
      </h2>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{s.pagesLabel}</p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {inlineCode(s.pagesText)}
      </p>
      <CodeBlock code={s.codeLoginRoute} language="typescript" />

      <p className="mb-2 mt-6 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{s.serverLabel}</p>
      <CodeBlock code={s.codeServer} language="typescript" />

      <p className="mb-2 mt-6 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{s.clientLabel}</p>
      <CodeBlock code={s.codeClient} language="typescript" />

      <p className="mb-2 mt-6 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{s.redirectLabel}</p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {inlineCode(s.redirectText)}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.whitelistTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {inlineCode(s.whitelistText)}
      </p>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/auth" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.backToModule}
        </Link>
      </nav>
    </div>
  );
}
