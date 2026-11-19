"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function NotificationsCibleesDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/notifications-ciblees">{s.moduleName}</Link> → {s.breadcrumbDoc}
        </nav>
        <h1>{s.docTitle}</h1>
        <p className="doc-description">{s.docDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2">
        {locale === "fr" ? "Utiliser le module dans votre application" : "Use the module in your application"}
      </h2>
      <p className="mb-4 text-sm">
        {locale === "fr"
          ? "Déclarez les règles et fournissez les membres des équipes depuis votre annuaire. La boîte interne est persistante. E-mail et SMS passent par vos adaptateurs de livraison via le worker bpm.webhooks (événements notification.email et notification.sms). Un adaptateur absent fait échouer la transaction. Le worker conserve les tentatives et les accusés de réception de l’adaptateur."
          : "Register rules and supply team membership from your own directory. The inbox persists. Email and SMS use your delivery adapters via the bpm.webhooks worker (notification.email and notification.sms events). A missing adapter causes a rollback. The worker records delivery attempts and adapter acknowledgements."}
      </p>
      <CodeBlock language="python" code={`from contextlib import closing
from bpm import targeted_notifications as notifications

with closing(notifications.open_store("team.sqlite")) as db:
    notifications.configure(db, "approvals", "purchase.review", "finance", ["in-app"])
    notifications.notify(db, "purchase-42-review", "purchase.review", "Order 42", "Review requested",
                         teams={"finance": ["user-123", "user-456"]})
    messages = notifications.inbox(db, "user-123", unread_only=True)`} />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.ruleModelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.ruleModel1}
        <code>actif</code>
        {s.ruleModel2} <code>declenchements7j</code> {s.ruleModel3}
      </p>
      <CodeBlock code={s.ruleModelCode} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.eventsTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.eventItems.map((item) => (
          <li key={item.code}>
            <code>{item.code}</code> — {item.desc}
          </li>
        ))}
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.eventsNote1} <strong>{s.eventsNoteStrong}</strong> {s.eventsNote2}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.channelsTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.channelItems.map((item) => (
          <li key={item.name}>
            <strong>{item.name}</strong> — {item.desc}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.antispamTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.antispamItems.map((item) => (
          <li key={item.strong}>
            <strong>{item.strong}</strong> — {item.rest}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.prodTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.prod1} <code>notification_rules</code>
        {s.prod2}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/notifications-ciblees/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.openSimulator}
        </Link>
      </p>
    </div>
  );
}
