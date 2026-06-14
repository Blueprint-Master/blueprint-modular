"use client";

import { useState } from "react";
import Link from "next/link";
import { NotificationCenter, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import type { NotificationItem } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocNotificationCenterPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Liste de notifications (non lues / lues), marquage lecture et suppression.",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      notifications: "id, title, message, type, timestamp (ISO), read, actionLabel?, onAction?",
      onMarkRead: "Marquer une notification comme lue.",
      onMarkAllRead: "Tout marquer comme lu (bouton en-tête).",
      onDismiss: "Supprimer une notification lue (au survol).",
      maxVisible: "Nombre max affiché avant « Voir les anciennes ».",
      emptyMessage: "Message si liste vide.",
      className: "Classes CSS.",
    },
    examples: "Exemples",
    demo: [
      { title: "Nouveau message", message: "Vous avez reçu un message." },
      { title: "Tâche terminée", message: "Export CSV réussi." },
    ],
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "List of notifications (unread / read), mark as read and dismiss.",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      notifications: "id, title, message, type, timestamp (ISO), read, actionLabel?, onAction?",
      onMarkRead: "Mark a notification as read.",
      onMarkAllRead: "Mark all as read (header button).",
      onDismiss: "Dismiss a read notification (on hover).",
      maxVisible: "Max number shown before “See older”.",
      emptyMessage: "Message when the list is empty.",
      className: "CSS classes.",
    },
    examples: "Examples",
    demo: [
      { title: "New message", message: "You have received a message." },
      { title: "Task completed", message: "CSV export succeeded." },
    ],
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const demoNotifications: NotificationItem[] = [
    {
      id: "1",
      title: t.demo[0].title,
      message: t.demo[0].message,
      timestamp: new Date().toISOString(),
      read: false,
      type: "info",
    },
    {
      id: "2",
      title: t.demo[1].title,
      message: t.demo[1].message,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
      type: "success",
    },
  ];

  const [notifications, setNotifications] = useState<NotificationItem[]>(demoNotifications);
  const [maxVisible, setMaxVisible] = useState(50);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const pyMaxVisible = maxVisible !== 50 ? `, maxVisible=${maxVisible}` : "";
  const pythonCode = `bpm.notificationCenter(notifications=items, onMarkRead=mark_read, onMarkAllRead=mark_all_read${pyMaxVisible})`;
  const { prev, next } = getPrevNext("notificationcenter");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.notificationCenter</div>
        <h1>bpm.notificationCenter</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
            maxVisible={maxVisible}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>maxVisible</label>
            <input type="number" min={5} max={100} value={maxVisible} onChange={(e) => setMaxVisible(Number(e.target.value) || 50)} />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>{t.head.prop}</th>
            <th>{t.head.type}</th>
            <th>{t.head.def}</th>
            <th>{t.head.req}</th>
            <th>{t.head.desc}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>notifications</code></td><td><code>NotificationItem[]</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.notifications}</td></tr>
          <tr><td><code>onMarkRead</code></td><td><code>(id: string) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.onMarkRead}</td></tr>
          <tr><td><code>onMarkAllRead</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.rows.onMarkAllRead}</td></tr>
          <tr><td><code>onDismiss</code></td><td><code>(id: string) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.rows.onDismiss}</td></tr>
          <tr><td><code>maxVisible</code></td><td><code>number</code></td><td>50</td><td>{t.no}</td><td>{t.rows.maxVisible}</td></tr>
          <tr><td><code>emptyMessage</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rows.emptyMessage}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rows.className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.notificationCenter(notifications=notifs, onMarkRead=mark_read, onMarkAllRead=mark_all_read)'} language="python" />
      <CodeBlock code={'bpm.notificationCenter(notifications=notifs, onMarkRead=mark_read, onMarkAllRead=mark_all_read, onDismiss=dismiss)'} language="python" />
      <CodeBlock code={'bpm.notificationCenter(notifications=notifs, onMarkRead=mark_read, onMarkAllRead=mark_all_read, maxVisible=20)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
