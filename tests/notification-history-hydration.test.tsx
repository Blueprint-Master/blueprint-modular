// @vitest-environment jsdom
import React, { act, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { NotificationHistoryProvider, useNotificationHistory } from "../contexts/NotificationHistoryContext";

function History({ addOnMount }: { addOnMount?: boolean }) {
  const { notifications, addNotification } = useNotificationHistory();
  useEffect(() => {
    if (addOnMount) addNotification({ message: "New" });
  }, [addOnMount, addNotification]);
  return <output>{notifications.map((n) => n.message).join(",")}</output>;
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

it.each([false, true])("hydrates saved notifications and preserves early writes (add on mount = %s)", async (addOnMount) => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const ui = <NotificationHistoryProvider><History addOnMount={addOnMount} /></NotificationHistoryProvider>;
  const container = document.createElement("div");
  container.innerHTML = renderToString(ui);
  const serverNode = container.firstChild;
  localStorage.setItem("notification_history", JSON.stringify([{
    id: 1, timestamp: "2026-11-19T08:00:00Z", message: "Saved", title: null, type: "info", level: 1,
  }]));
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(container, ui, { onRecoverableError }); });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.firstChild).toBe(serverNode);
    expect(container.textContent).toBe(addOnMount ? "New,Saved" : "Saved");
  } finally {
    await act(async () => root?.unmount());
  }
});
