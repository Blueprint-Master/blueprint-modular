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
  },
});
