"use client";

import Link from "next/link";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type NotificationTestType } from "../strings";

const cardStyle = {
  background: "var(--bpm-bg-secondary)",
  borderColor: "var(--bpm-border)",
};
const linkStyle = { color: "var(--bpm-accent-cyan)" };

export default function NotificationSimulateurPage() {
  const { addNotification } = useNotificationHistory();
  const { locale } = useI18n();
  const s = STR[locale];

  const addTestNotification = (type: NotificationTestType) => {
    const payload = {
      message: s.simulatorTestMessage(s.typeLabels[type]),
      type,
      title: s.testTitle,
      pageName: s.simulatorPageName,
    };
    const level = getNotificationLevel(payload);
    addNotification({ ...payload, level });
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link>
          {" → "}
          <Link href="/modules/notification">{s.moduleName}</Link>
          {" → "}
          {s.breadcrumbSimulator}
        </div>
        <h1>{s.simulatorTitle}</h1>
        <p className="doc-description">
          {s.simulatorDescription}
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.testBellHeading}
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.simulatorIntroBefore}
        <Link href="/settings" className="font-medium underline" style={linkStyle}>
          {s.settingsPath}
        </Link>
        {s.simulatorIntroAfter}
      </p>
      <div className="p-6 rounded-xl border mb-8" style={cardStyle}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addTestNotification("info")}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
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
            className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
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
            className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
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
            className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
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

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.levelsHeading}
      </h2>
      <ul className="list-disc pl-6 mb-8 space-y-1 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level1Name}</strong>{s.level1Desc}</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level2Name}</strong>{s.level2Desc}</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>{s.level3Name}</strong>{s.level3Desc}</li>
      </ul>

      <nav className="doc-pagination">
        <Link href="/modules/notification" className="text-sm font-medium hover:underline" style={linkStyle}>
          {s.backToModule}
        </Link>
      </nav>
    </div>
  );
}
