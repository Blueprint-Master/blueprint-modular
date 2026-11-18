/**
 * APK Android (Trusted Web Activity) : le site doit servir `/.well-known/assetlinks.json`,
 * sinon l'application s'ouvre avec une barre d'adresse (repli Custom Tabs) au lieu du
 * plein écran.
 *
 * 1. le fichier est une déclaration Digital Asset Links bien formée, et ce qu'il déclare
 *    (paquet) est ce que `android/twa-manifest.json` construit : deux fichiers qui
 *    divergent rendent une TWA à barre d'adresse sans qu'aucun build ne rougisse ;
 * 2. rien ne l'empêche d'arriver en production : le middleware ne capte pas
 *    `/.well-known/`, et le déploiement standalone copie le CONTENU de `public/`
 *    dotfiles compris (`cp -r public/.`) ; un `cp public/*` perdrait `.well-known`
 *    en silence, le site restant vert ;
 * 3. l'icône adaptative embarquée existe et a la taille attendue.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { config as middlewareConfig } from "../middleware";

type Declaration = {
  relation: string[];
  target: { namespace: string; package_name: string; sha256_cert_fingerprints: string[] };
};

const assetlinks = JSON.parse(readFileSync("public/.well-known/assetlinks.json", "utf8")) as Declaration[];
const twa = JSON.parse(readFileSync("android/twa-manifest.json", "utf8")) as {
  packageId: string;
  host: string;
};

describe("assetlinks.json — déclaration Digital Asset Links de l'APK", () => {
  it("déclare le paquet construit par android/twa-manifest.json", () => {
    expect(twa.packageId).toBe("com.blueprintmodular.app");
    expect(twa.host).toBe("blueprint-modular.com");
    const cible = assetlinks.find((d) => d.target.package_name === twa.packageId);
    expect(cible).toBeDefined();
    expect(cible!.target.namespace).toBe("android_app");
    expect(cible!.relation).toContain("delegate_permission/common.handle_all_urls");
  });

  it("porte des empreintes SHA-256 de certificat bien formées (32 octets hexadécimaux)", () => {
    for (const d of assetlinks) {
      expect(d.target.sha256_cert_fingerprints.length).toBeGreaterThan(0);
      for (const fp of d.target.sha256_cert_fingerprints) {
        expect(fp).toMatch(/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
      }
    }
  });
});

describe("assetlinks.json — chemin jusqu'à la production", () => {
  it("le middleware ne capte pas /.well-known/", () => {
    for (const m of middlewareConfig.matcher) {
      expect(m.startsWith("/.well-known") || m.includes("(.*)") || m === "/:path*", m).toBe(false);
    }
  });

  it("le déploiement standalone copie public/ dotfiles compris", () => {
    const script = readFileSync("deploy/deploy-from-git.sh", "utf8");
    expect(script).toContain("cp -r public/. .next/standalone/blueprint-modular/public/");
  });
});

describe("icône adaptative de l'APK", () => {
  it("android/icon-maskable-512.png est un PNG 512 x 512", () => {
    const png = readFileSync("android/icon-maskable-512.png");
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(512);
    expect(png.readUInt32BE(20)).toBe(512);
  });
});
