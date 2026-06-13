"use client";

import Link from "next/link";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";
import { CodeBlock, Tabs } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type NotificationTestType } from "./strings";

export default function NotificationModulePage() {
  const { addNotification } = useNotificationHistory();
  const { locale } = useI18n();
  const s = STR[locale];

  const addTestNotification = (type: NotificationTestType) => {
    const payload = {
      message: s.moduleTestMessage(s.typeLabels[type]),
      type,
      title: s.testTitle,
      pageName: s.modulePageName,
    };
    const level = getNotificationLevel(payload);
    addNotification({ ...payload, level });
  };

  const documentationContent = (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.aboutHeading}</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {s.aboutBefore}<Link href="/settings" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.settingsPath}</Link>{s.aboutAfter}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.implementHeading}</h2>
      <p className="mb-3" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {s.implementIntro1}<strong style={{ color: "var(--bpm-text-primary)" }}>{s.implementStrongContext}</strong>{s.implementIntro2}<strong style={{ color: "var(--bpm-text-primary)" }}>{s.implementStrongBell}</strong>{s.implementIntro3}
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <li>{s.implementLi1a}<code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>NotificationHistoryProvider</code>{s.implementLi1b}<code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>NotificationProviders</code>{s.implementLi1c}</li>
        <li>{s.implementLi2a}<code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>useNotificationHistory()</code>{s.implementLi2b}<code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>addNotification</code>{s.implementLi2c}</li>
        <li>{s.implementLi3a}<code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>addNotification(&#123; message, type?, title?, pageName? &#125;)</code>{s.implementLi3b}<code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>getNotificationLevel</code>{s.implementLi3c}</li>
      </ul>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {s.mainFilesLabel}<code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>contexts/NotificationHistoryContext.tsx</code>, <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>lib/notificationLevels.ts</code>, <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>components/NotificationBell.tsx</code>.
      </p>
      <div className="mb-6">
        <CodeBlock
          code={`import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";

function MyComponent() {
  const { addNotification } = useNotificationHistory();

  const handleSave = () => {
    addNotification({
      message: "Enregistrement réussi.",
      type: "success",
      title: "Sauvegarde",
      pageName: "Mon écran",
    });
    // Niveau déduit automatiquement (ex. 2 pour success)
  };

  const handleError = () => {
    const payload = { message: "Échec.", type: "error" as const, title: "Erreur", pageName: null };
    addNotification({ ...payload, level: getNotificationLevel(payload) });
  };

  return <button onClick={handleSave}>Sauvegarder</button>;
}`}
          language="tsx"
        />
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.levelsHeading}</h2>
      <ul className="list-disc pl-5 mb-0 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level1Name}</strong>{s.level1Desc}</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level2Name}</strong>{s.level2Desc}</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level3Name}</strong>{s.level3Desc}</li>
      </ul>
    </>
  );

  const simulateurContent = (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.testBellHeading}</h2>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {s.testBellIntroShort}
      </p>
      <div
        className="p-6 rounded-xl border mb-6"
        style={{
          background: "var(--bpm-bg-secondary)",
          borderColor: "var(--bpm-border)",
        }}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addTestNotification("info")}
            className="px-3 py-2 rounded-lg text-sm font-medium border transition"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            {s.btnInfo}
          </button>
          <button
            type="button"
            onClick={() => addTestNotification("success")}
            className="px-3 py-2 rounded-lg text-sm font-medium border transition"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            {s.btnSuccess}
          </button>
          <button
            type="button"
            onClick={() => addTestNotification("warning")}
            className="px-3 py-2 rounded-lg text-sm font-medium border transition"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            {s.btnWarning}
          </button>
          <button
            type="button"
            onClick={() => addTestNotification("error")}
            className="px-3 py-2 rounded-lg text-sm font-medium border transition"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            {s.btnError}
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.levelsHeading}</h2>
      <ul className="list-disc pl-5 mb-0 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level1Name}</strong>{s.level1Desc}</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level2Name}</strong>{s.level2Desc}</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level3Name}</strong>{s.level3Desc}</li>
      </ul>
    </>
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → bpm.notification</div>
        <h1>bpm.notification</h1>
        <p className="doc-description">
          {s.moduleDescription}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{s.badgeModule}</span>
          <span className="doc-reading-time">{s.readingTime}</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/notification/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            {s.simulatorLinkLabel}
          </Link>
        </p>
      </div>

      <Tabs
        tabs={[
          { label: s.tabDocumentation, content: documentationContent },
          { label: s.tabSimulator, content: simulateurContent },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
