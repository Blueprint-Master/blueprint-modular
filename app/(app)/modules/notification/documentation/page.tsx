"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function NotificationDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/notification">Notification</Link> → Documentation
        </nav>
        <h1>Documentation — Notification</h1>
        <p className="doc-description">
          Gérez les alertes applicatives avec 3 niveaux de priorité et un historique complet (cloche dans le header).
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module (pas de <code>pip install blueprint-modular-notification</code> ni <code>npm install blueprint-modular-notification</code>) : on installe l&apos;application une fois. Le module Notification ne requiert <strong>aucune dépendance externe</strong> (pas de base dédiée, pas d&apos;API) : uniquement React (contexte + composants). Cette documentation décrit <strong>comment installer</strong> l&apos;app pour utiliser les notifications, <strong>comment le module fonctionne</strong>, <strong>comment le paramétrer</strong> (filtre d&apos;affichage dans Paramètres, règles de niveau) et comment l&apos;implanter dans votre code (<code>useNotificationHistory</code>, <code>addNotification</code>).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le module Notification
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Notification repose sur un <strong>contexte React</strong> (<code>NotificationHistoryContext</code>) et une <strong>cloche dans le header</strong> déjà intégrée au layout. Les notifications sont stockées dans le navigateur (état React, pas de base de données). Chaque notification a un <strong>niveau</strong> (1 = haute priorité, 2 = moyenne, 3 = basse) déduit automatiquement à partir du type (info, success, warning, error) et du titre/page via <code>getNotificationLevel</code>. Le filtre dans <strong>Paramètres → Général</strong> permet de n&apos;afficher que les niveaux suffisamment prioritaires (ex. uniquement erreurs, ou erreurs + succès).
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Niveau 1</strong> — Haute priorité (ex. erreurs).</li>
        <li><strong>Niveau 2</strong> — Moyenne (ex. succès, avertissements).</li>
        <li><strong>Niveau 3</strong> — Basse (ex. info, paramètres sauvegardés).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Installation et dépendances
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module fait partie de l&apos;application Next.js. Aucune dépendance externe (API, base) n&apos;est requise pour les notifications : uniquement React (contexte + composants). Aucune variable d&apos;environnement spécifique au module Notification.
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Résumé des commandes (installer l&apos;app et utiliser les notifications)
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
        L&apos;app est déjà enveloppée avec <code>NotificationProviders</code> dans <code>app/layout.tsx</code>, qui inclut <code>NotificationHistoryProvider</code>. Aucune variable d&apos;environnement spécifique au module Notification.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment l&apos;implanter dans votre code
      </h2>
      <p className="mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
        Dans tout composant enfant du layout (déjà sous <code>NotificationHistoryProvider</code>) :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>Utiliser <code>useNotificationHistory()</code> pour obtenir <code>addNotification</code>.</li>
        <li>Appeler <code>addNotification(&#123; message, type?, title?, pageName? &#125;)</code>. Le niveau (1–3) est déduit automatiquement via <code>getNotificationLevel</code> si vous ne fournissez pas <code>level</code>.</li>
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
        Paramétrage
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Filtre d&apos;affichage</strong> : dans <Link href="/settings" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>Paramètres → Général</Link>, choisir le niveau minimum à afficher (1 = uniquement haute priorité, 2 = haute + moyenne, 3 = toutes).</li>
        <li><strong>Règles de niveau</strong> : définies dans <code>lib/notificationLevels.ts</code> (LEVEL_RULES). Vous pouvez adapter les règles (ex. titre &quot;Paramètre sauvegardé&quot; → niveau 3) selon vos besoins.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Fichiers principaux
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>contexts/NotificationHistoryContext.tsx</code> — Provider et hook <code>useNotificationHistory</code>.</li>
        <li><code>lib/notificationLevels.ts</code> — <code>getNotificationLevel</code>, <code>NOTIFICATION_LEVEL_LABELS</code>.</li>
        <li><code>components/NotificationBell.tsx</code> — Cloche dans le header et panneau d&apos;historique.</li>
        <li><code>components/NotificationProviders.tsx</code> — Wrapper (NotificationHistoryProvider + toast) utilisé dans <code>app/layout.tsx</code>.</li>
      </ul>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/notification" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module Notification
        </Link>
      </nav>
    </div>
  );
}
