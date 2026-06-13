"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function NotificationDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/notification">{s.moduleName}</Link> → {s.breadcrumbDocumentation}
        </nav>
        <h1>{s.docTitle}</h1>
        <p className="doc-description">
          {s.docDescription}
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docIntro1}<strong>{s.docIntroStrongApp}</strong>{s.docIntro2}<code>pip install blueprint-modular-notification</code>{s.docIntro3}<code>npm install blueprint-modular-notification</code>{s.docIntro4}<strong>{s.docIntroStrongNoDep}</strong>{s.docIntro5}<strong>{s.docIntroStrongInstall}</strong>{s.docIntro6}<strong>{s.docIntroStrongHow}</strong>{s.docIntro7}<strong>{s.docIntroStrongConfig}</strong>{s.docIntro8}<code>useNotificationHistory</code>, <code>addNotification</code>{s.docIntro9}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.howHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.how1}<strong>{s.howStrongContext}</strong>{s.how2}<code>NotificationHistoryContext</code>{s.how3}<strong>{s.howStrongBell}</strong>{s.how4}<strong>{s.howStrongLevel}</strong>{s.how5}<code>getNotificationLevel</code>{s.how6}<strong>{s.settingsPath}</strong>{s.how7}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>{s.level1Name}</strong>{s.level1Desc}.</li>
        <li><strong>{s.level2Name}</strong>{s.level2Desc}.</li>
        <li><strong>{s.level3Name}</strong>{s.level3Desc}.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.installHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.installP}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.cmdHeading}
      </h3>
      <CodeBlock
        code={`# Depuis la racine du projet
npm install
npm run dev

# L&apos;app est déjà enveloppée avec NotificationProviders (app/layout.tsx).
# Ouvrir l&apos;app puis utiliser la cloche dans le header pour voir l&apos;historique.`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.afterCmd1}<code>NotificationProviders</code>{s.afterCmd2}<code>app/layout.tsx</code>{s.afterCmd3}<code>NotificationHistoryProvider</code>{s.afterCmd4}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docImplHeading}
      </h2>
      <p className="mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docImplIntro1}<code>NotificationHistoryProvider</code>{s.docImplIntro2}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{s.docImplLi1a}<code>useNotificationHistory()</code>{s.docImplLi1b}<code>addNotification</code>{s.docImplLi1c}</li>
        <li>{s.docImplLi2a}<code>addNotification(&#123; message, type?, title?, pageName? &#125;)</code>{s.docImplLi2b}<code>getNotificationLevel</code>{s.docImplLi2c}<code>level</code>{s.docImplLi2d}</li>
      </ul>
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
  };

  const handleError = () => {
    const payload = { message: "Échec.", type: "error" as const, title: "Erreur", pageName: null };
    addNotification({ ...payload, level: getNotificationLevel(payload) });
  };

  return <button onClick={handleSave}>Sauvegarder</button>;
}`}
        language="tsx"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.configHeading}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>{s.cfg1Strong}</strong>{s.cfg1a}<Link href="/settings" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.settingsPath}</Link>{s.cfg1b}</li>
        <li><strong>{s.cfg2Strong}</strong>{s.cfg2a}<code>lib/notificationLevels.ts</code>{s.cfg2b}&quot;Paramètre sauvegardé&quot;{s.cfg2c}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.filesHeading}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>contexts/NotificationHistoryContext.tsx</code>{s.file1Desc1}<code>useNotificationHistory</code>{s.file1Desc2}</li>
        <li><code>lib/notificationLevels.ts</code> — <code>getNotificationLevel</code>, <code>NOTIFICATION_LEVEL_LABELS</code>.</li>
        <li><code>components/NotificationBell.tsx</code>{s.file3Desc}</li>
        <li><code>components/NotificationProviders.tsx</code>{s.file4Desc1}<code>app/layout.tsx</code>{s.file4Desc2}</li>
      </ul>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/notification" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.backToModule}
        </Link>
      </nav>
    </div>
  );
}
