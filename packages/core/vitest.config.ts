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
  },
  resolve: {
    alias: { "@": resolve(__dirname, "../..") },
    // Prevent double-React instance when qrcode.react (and similar peers)
    // resolve React from the root node_modules while react-dom resolves locally.
    // In a generated app all packages are hoisted to one root — no conflict.
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
