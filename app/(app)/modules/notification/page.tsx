"use client";

import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";

export default function NotificationModulePage() {
  const { addNotification } = useNotificationHistory();

  const addTestNotification = (type: "info" | "success" | "warning" | "error") => {
    const payload = {
      message: `Notification de test (${type}) depuis le module bpm.notification.`,
      type,
      title: "Test",
      pageName: "Module Notification",
    };
    const level = getNotificationLevel(payload);
    addNotification({ ...payload, level });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        bpm.notification
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Historique des notifications, cloche dans le header, niveaux 1 (haute) à 3 (basse). Le niveau minimal affiché est configurable dans Paramètres → Général.
      </p>

      <div
        className="max-w-md p-6 rounded-xl border"
        style={{
          background: "var(--bpm-bg-secondary)",
          borderColor: "var(--bpm-border)",
        }}
      >
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
          Tester la cloche
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          Ajoutez une notification de test puis ouvrez la cloche dans le header.
        </p>
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
            Info
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
            Succès
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
            Avertissement
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
            Erreur
          </button>
        </div>
      </div>
    </div>
  );
}
