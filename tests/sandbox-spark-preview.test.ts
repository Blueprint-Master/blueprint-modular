/**
 * Tests de la route éphémère Sandbox IA « Spark » (no-persist).
 *
 * Couvre les garanties du chantier sandbox-ia-spark-ephemeral :
 *  - contrat strict { prompt } seul (refus des uploads / champs superflus) ;
 *  - allowlist d'origine + jeton serveur ;
 *  - rate-limit effectif par IP ;
 *  - flux éphémère : code bpm.* + seed en mémoire, plan NON exposé ;
 *  - aucune persistance / déploiement / export sur le chemin (vérif statique).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeEach } from "vitest";
import {
  parseSparkPreviewBody,
  isRequestAllowed,
  checkSparkRateLimit,
  buildSeedFromSpec,
  runSparkPreview,
  __resetSparkRateLimit,
  type SparkBuilder,
} from "@/lib/sandbox/spark-preview";
import type { BuilderSpec } from "@/lib/ai/builder";

const REPO_ROOT = resolve(__dirname, "..");

function req(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/sandbox/spark-preview", {
    method: "POST",
    headers,
  });
}

describe("parseSparkPreviewBody — contrat strict { prompt }", () => {
  it("accepte un prompt non vide et le trim", () => {
    const r = parseSparkPreviewBody({ prompt: "  un CRM simple  " });
    expect(r).toEqual({ prompt: "un CRM simple" });
  });

  it("refuse un body non-objet", () => {
    expect(parseSparkPreviewBody(null).prompt).toBeUndefined();
    expect(parseSparkPreviewBody("x").error).toBeDefined();
    expect(parseSparkPreviewBody([]).error).toBeDefined();
  });

  it("refuse un prompt vide ou non-string", () => {
    expect(parseSparkPreviewBody({ prompt: "" }).error).toBeDefined();
    expect(parseSparkPreviewBody({ prompt: 42 }).error).toBeDefined();
    expect(parseSparkPreviewBody({}).error).toBeDefined();
  });

  it("refuse tout upload / champ superflu (pas de file, image, BYOK, plan…)", () => {
    for (const extra of [
      { prompt: "x", file: "data" },
      { prompt: "x", upload: {} },
      { prompt: "x", image: "b64" },
      { prompt: "x", apiKey: "sk-..." },
      { prompt: "x", provider: "claude" },
      { prompt: "x", plan: {} },
      { prompt: "x", deploy: true },
    ]) {
      const r = parseSparkPreviewBody(extra);
      expect(r.prompt).toBeUndefined();
      expect(r.error).toBeDefined();
    }
  });

  it("refuse un prompt trop long", () => {
    const r = parseSparkPreviewBody({ prompt: "a".repeat(5000) });
    expect(r.error).toBeDefined();
  });
});

describe("isRequestAllowed — allowlist d'origine + jeton serveur", () => {
  it("refuse une requête sans Origin et sans jeton", () => {
    expect(isRequestAllowed(req({}))).toBe(false);
  });

  it("autorise une origine de l'allowlist par défaut", () => {
    expect(isRequestAllowed(req({ origin: "https://blueprint-modular.com" }))).toBe(true);
  });

  it("refuse une origine hors allowlist", () => {
    expect(isRequestAllowed(req({ origin: "https://evil.example.com" }))).toBe(false);
  });

  it("autorise via jeton serveur partagé si configuré", () => {
    process.env.SANDBOX_PREVIEW_TOKEN = "secret-token";
    try {
      expect(isRequestAllowed(req({ "x-sandbox-preview-token": "secret-token" }))).toBe(true);
      expect(isRequestAllowed(req({ "x-sandbox-preview-token": "wrong" }))).toBe(false);
    } finally {
      delete process.env.SANDBOX_PREVIEW_TOKEN;
    }
  });

  it("respecte SANDBOX_PREVIEW_ALLOWED_ORIGINS", () => {
    process.env.SANDBOX_PREVIEW_ALLOWED_ORIGINS = "https://a.test,https://b.test";
    try {
      expect(isRequestAllowed(req({ origin: "https://a.test" }))).toBe(true);
      expect(isRequestAllowed(req({ origin: "https://blueprint-modular.com" }))).toBe(false);
    } finally {
      delete process.env.SANDBOX_PREVIEW_ALLOWED_ORIGINS;
    }
  });
});

describe("checkSparkRateLimit — rate-limit effectif par IP", () => {
  beforeEach(() => __resetSparkRateLimit());

  it("bloque au-delà de la limite pour une même IP", () => {
    process.env.SANDBOX_PREVIEW_RATE_LIMIT = "3";
    try {
      const headers = { "x-forwarded-for": "203.0.113.7" };
      expect(checkSparkRateLimit(req(headers)).ok).toBe(true);
      expect(checkSparkRateLimit(req(headers)).ok).toBe(true);
      expect(checkSparkRateLimit(req(headers)).ok).toBe(true);
      const blocked = checkSparkRateLimit(req(headers));
      expect(blocked.ok).toBe(false);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    } finally {
      delete process.env.SANDBOX_PREVIEW_RATE_LIMIT;
    }
  });

  it("compte les IP indépendamment", () => {
    process.env.SANDBOX_PREVIEW_RATE_LIMIT = "1";
    try {
      expect(checkSparkRateLimit(req({ "x-forwarded-for": "10.0.0.1" })).ok).toBe(true);
      expect(checkSparkRateLimit(req({ "x-forwarded-for": "10.0.0.1" })).ok).toBe(false);
      expect(checkSparkRateLimit(req({ "x-forwarded-for": "10.0.0.2" })).ok).toBe(true);
    } finally {
      delete process.env.SANDBOX_PREVIEW_RATE_LIMIT;
    }
  });
});

describe("buildSeedFromSpec — seed déterministe en mémoire", () => {
  const spec: BuilderSpec = {
    title: "CRM",
    domain: "crm",
    entities: [
      { name: "Client", fields: [{ name: "nom", type: "string" }, { name: "actif", type: "bool" }, { name: "ca", type: "number" }] },
    ],
    relations: [],
    rules: [],
    components: ["table"],
    modules: [],
    api_routes: [],
    deployment: "vercel",
    generated_at: "2025-01-01T00:00:00.000Z",
  };

  it("génère 3 lignes par entité, typées et déterministes", () => {
    const seed = buildSeedFromSpec(spec);
    expect(seed.Client).toHaveLength(3);
    expect(seed.Client[0]).toEqual({ nom: "nom 1", actif: true, ca: 10 });
    // Déterministe : deux appels donnent le même résultat.
    expect(buildSeedFromSpec(spec)).toEqual(seed);
  });

  it("renvoie un objet vide si pas de plan", () => {
    expect(buildSeedFromSpec(null)).toEqual({});
  });
});

describe("runSparkPreview — flux éphémère, plan non exposé", () => {
  it("renvoie code + seed, sans exposer le plan", async () => {
    const spec: BuilderSpec = {
      title: "Suivi",
      domain: "custom",
      entities: [{ name: "Tache", fields: [{ name: "titre", type: "string" }] }],
      relations: [],
      rules: [],
      components: ["title", "table"],
      modules: [],
      api_routes: [],
      deployment: "vercel",
      generated_at: "2025-01-01T00:00:00.000Z",
    };
    const fakeBuilder: SparkBuilder = {
      buildFromPrompt: async () => ({
        output: {
          code: 'bpm.title("Suivi", level=1)\nbpm.table("Titre;A")',
          title: "Suivi",
          description: "x",
          components: ["title", "table"],
        },
        spec,
      }),
      generate: async () => {
        throw new Error("ne doit pas être appelé quand le plan réussit");
      },
    };
    const result = await runSparkPreview("une todo", fakeBuilder);
    expect(result.code).toContain("bpm.title");
    expect(result.seed.Tache).toHaveLength(3);
    // Le plan (spec) n'apparaît jamais dans la réponse.
    expect(Object.keys(result)).toEqual(["code", "title", "components", "seed"]);
    expect(JSON.stringify(result)).not.toContain("generated_at");
    expect(JSON.stringify(result)).not.toContain("api_routes");
  });

  it("repli sur generate() si la génération du plan échoue (sans seed)", async () => {
    const fakeBuilder: SparkBuilder = {
      buildFromPrompt: async () => {
        throw new Error("Spec generation failed");
      },
      generate: async () => ({
        code: 'bpm.title("Repli", level=1)',
        title: "Repli",
        description: "x",
        components: ["title"],
      }),
    };
    const result = await runSparkPreview("prompt", fakeBuilder);
    expect(result.code).toContain("Repli");
    expect(result.seed).toEqual({});
  });
});

describe("no-persist — vérification statique du chemin", () => {
  // On retire les commentaires avant l'analyse : ces fichiers DOCUMENTENT
  // explicitement ce qu'ils ne font pas (« pas de GeneratedApp.create »…),
  // seul le code exécutable doit être exempt de persistance/déploiement.
  function stripComments(src: string): string {
    return src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
  }
  const sources = [
    "lib/sandbox/spark-preview.ts",
    "app/api/sandbox/spark-preview/route.ts",
  ].map((p) => stripComments(readFileSync(resolve(REPO_ROOT, p), "utf8")));

  it("aucune écriture DB / déploiement / export dans le code exécutable", () => {
    const forbidden = [
      "prisma",
      "GeneratedApp",
      ".create(",
      ".update(",
      "deployApp",
      "/api/export",
      "/api/generate",
    ];
    for (const src of sources) {
      for (const token of forbidden) {
        expect(src.includes(token), `token interdit présent: ${token}`).toBe(false);
      }
    }
  });
});
