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
        // Force vitest to transform these packages through Vite instead of
        // loading them natively via Node. Without this, Node resolves 'react'
        // from the package's own node_modules tree (root copy in CI) while
        // react-dom uses packages/core's copy → two React instances → hook crash.
        // With inline, Vite processes the package and resolve.dedupe below
        // enforces a single React instance, matching real-app hoisting behaviour.
        //
        // ⚠️ Tout paquet TIERS qui appelle un hook React doit figurer ici — la
        // liste est le SEUL point où la déduplication devient effective, car
        // `resolve.dedupe` ne s'applique qu'aux modules transformés par Vite ;
        // un module externalisé est chargé en `file://` par Node et l'ignore.
        //
        // `react-leaflet` : même piège que `qrcode.react`, découvert par le gate
        // de #209. C'est une peerDependency OPTIONNELLE du core, donc absente de
        // `packages/core/node_modules` et résolue à la RACINE — alors que
        // `react-dom`, devDependency, vient de la copie du core. La pile CI le
        // nommait sans ambiguïté :
        //   useState              ../../node_modules/react/…        (racine)
        //   MapContainerComponent ../../node_modules/react-leaflet/… (racine)
        //   renderWithHooks          node_modules/react-dom/…       (core)
        // `@react-leaflet/core` est indispensable À CÔTÉ de `react-leaflet` :
        // c'est un paquet SÉPARÉ, et il porte 7 fichiers à hooks contre 3 pour
        // son parent (`PaneComponent`, `MapBehavior`, les contextes). N'inliner
        // que `react-leaflet` déplace simplement le plantage de `useState` vers
        // `useContext` — mesuré, pas supposé.
        // `leaflet` n'y figure pas : il n'appelle aucun hook React.
        inline: ["qrcode.react", "react-leaflet", "@react-leaflet/core"],
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "../..") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});

