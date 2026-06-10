import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// jsdom doesn't implement matchMedia — stub it (used by Table, MasterDetail, SplitView, etc.)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom doesn't implement canvas — stub getContext so SignaturePad etc. don't crash
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;

// Silence act() warnings from components with internal effects
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("act(")) return;
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

// --- Next.js stubs ---
vi.mock("next/dynamic", () => ({
  default: (_loader: unknown, _opts?: unknown) => {
    const Noop = () => null;
    Noop.displayName = "DynamicNoop";
    return Noop;
  },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href?: string;
    [k: string]: unknown;
  }) => React.createElement("a", { href, ...rest }, children),
}));

// --- Third-party stubs (not installed in packages/core) ---
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) =>
    React.createElement("svg", { "data-testid": "qrcode", "data-value": value }),
}));

// --- App-internal stubs ---
vi.mock("@/lib/offline", () => ({
  getQueueSize: () => 0,
  sync: async () => ({ synced: 0, failed: 0 }),
  enqueue: async () => {},
  startAutoSync: () => () => {},
}));

vi.mock("@/lib/ai/context", () => ({
  useBPMContext: () => {},
  useBPMPage: () => {},
  bpmComponentRegistry: {
    register: () => {},
    unregister: () => {},
    update: () => {},
    setModule: () => {},
    getPageContext: () => ({ components: [], module: "test", pageTitle: "" }),
    buildSystemPromptContext: () => "",
  },
}));

vi.mock("@/lib/notificationLevels", () => ({
  getNotificationLevel: () => 2 as const,
  NotificationPayload: {},
}));
