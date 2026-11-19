// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NotificationBell } from "../components/NotificationBell";
import { NotificationHistoryProvider } from "../contexts/NotificationHistoryContext";

const session = vi.hoisted(() => ({ email: "a@example.test" }));
vi.mock("next-auth/react", () => ({
  useSession: () => session.email ? { data: { user: { email: session.email } }, status: "authenticated" }
    : { data: null, status: "unauthenticated" },
}));
const message = { id: "n1", message: "Une tâche vous a été attribuée", title: "Affectation",
  createdAt: "2026-11-19T12:00:00Z", readAt: null, type: "info", level: 3 };
const network = vi.fn<typeof fetch>();
let root: ReturnType<typeof createRoot>;
async function render() {
  await act(async () => root.render(<NotificationHistoryProvider><NotificationBell /></NotificationHistoryProvider>));
}
async function click(button: Element | null) {
  expect(button).toBeTruthy();
  await act(async () => (button as HTMLElement).click());
}
const buttonWith = (name: string) => [...document.querySelectorAll("button")].find(b => b.textContent?.trim() === name) ?? null;
beforeEach(() => {
  session.email = "a@example.test";
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("fetch", network);
  document.body.innerHTML = "<div id='root'></div>";
  root = createRoot(document.querySelector("#root")!);
});
afterEach(async () => {
  await act(async () => root.unmount());
  network.mockReset();
  vi.unstubAllGlobals();
});

it("reads a server assignment and removes it only after the server confirms", async () => {
  let read = false;
  network.mockImplementation(async (url, init) => {
    if (String(url) === "/api/notifications/n1/read" && init?.method === "PATCH") read = true;
    return Response.json(init?.method === "PATCH" ? { ok: true } : { notifications: read ? [] : [message] });
  });
  await render();
  await click(document.querySelector("button[aria-label='Notifications']"));
  expect(document.body.textContent).toContain(message.message);
  expect(document.querySelector(".notification-bell-badge")?.textContent).toBe("1");
  await click(buttonWith("Marquer comme lue"));
  expect(read).toBe(true);
  expect(document.body.textContent).not.toContain(message.message);
  expect(document.querySelector(".notification-bell-badge")).toBeNull();
});

it("distinguishes an outage from an empty inbox, and recovers on retry", async () => {
  network.mockResolvedValue(new Response(null, { status: 503 }));
  await render();
  await click(document.querySelector("button[aria-label='Notifications']"));
  expect(document.body.textContent).toContain("Boîte de réception indisponible");
  network.mockImplementation(async () => Response.json({ notifications: [] }));
  await click(buttonWith("Réessayer"));
  expect(document.body.textContent).toContain("Aucune notification non lue");
});

it("discards a late response from a previous account", async () => {
  let finish!: (r: Response) => void;
  network.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  await render();
  expect(network).toHaveBeenCalled();
  session.email = "b@example.test";
  network.mockImplementation(async () => Response.json({ notifications: [] }));
  await render();
  await act(async () => finish(Response.json({ notifications: [message] })));
  await click(document.querySelector("button[aria-label='Notifications']"));
  expect(document.body.textContent).toContain("Aucune notification non lue");
  expect(document.body.textContent).not.toContain(message.message);
});

it("retains the unread notification when its acknowledgment fails", async () => {
  network.mockImplementation(async (_url, init) => init?.method === "PATCH"
    ? new Response(null, {status: 503}) : Response.json({notifications: [message]}));
  await render();
  await click(document.querySelector("button[aria-label='Notifications']"));
  await click(buttonWith("Marquer comme lue"));
  expect(document.body.textContent).toContain("Lecture non enregistrée");
  expect(document.body.textContent).toContain(message.message);
  expect(document.querySelector(".notification-bell-badge")?.textContent).toBe("1");
});

it("keeps the guest's local history available without requesting an account inbox", async () => {
  session.email = "";
  await render();
  await click(document.querySelector("button[aria-label='Notifications']"));
  expect(network).not.toHaveBeenCalled();
  expect(document.body.textContent).toContain("Aucune notification");
});

it("requests unread items before the server limit and caps the badge", async () => {
  const items = Array.from({length: 100}, (_, index) => ({ ...message, id: String(index) }));
  network.mockImplementation(async (url) => Response.json({
    notifications: String(url) === "/api/notifications?read=false" ? items : [],
  }));
  await render();
  expect(document.querySelector(".notification-bell-badge")?.textContent).toBe("99+");
});

it("removes the account panel at logout, including an inflight acknowledgement", async () => {
  let finish!: (r: Response) => void;
  network.mockImplementation(async (_url, init) => init?.method === "PATCH"
    ? new Promise(resolve => { finish = resolve; }) : Response.json({ notifications: [message] }));
  await render();
  await click(document.querySelector("button[aria-label='Notifications']"));
  await click(buttonWith("Marquer comme lue"));
  session.email = "";
  await render();
  const callsBefore = network.mock.calls.length;
  await act(async () => finish(Response.json({ok: true})));
  expect(network.mock.calls.length).toBe(callsBefore);
  await click(document.querySelector("button[aria-label='Notifications']"));
  expect(document.body.textContent).not.toContain(message.message);
});
