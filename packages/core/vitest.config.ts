import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./gate/setup.ts"],
    include: ["gate/**/*.test.{ts,tsx}"],
    css: false,
    reporters: ["verbose"],
    server: {
      deps: {
        // Force vitest to transform qrcode.react through Vite instead of
        // loading it natively via Node. Without this, Node resolves 'react'
        // from qrcode.react's own node_modules tree (root copy in CI) while
        // react-dom uses packages/core's copy → two React instances → hook crash.
        // With inline, Vite processes qrcode.react and resolve.dedupe below
        // enforces a single React instance, matching real-app hoisting behaviour.
        inline: ["qrcode.react"],
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "../..") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});

