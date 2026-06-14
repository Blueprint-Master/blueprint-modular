/**
 * Tests de la route éphémère Sandbox IA « Spark » (proxy → API interne Maker).
 *
 * Couvre :
 *  - contrat strict { prompt } seul (refus des uploads / champs superflus) ;
 *  - allowlist d'origine + jeton serveur ;
 *  - rate-limit effectif par IP ;
 *  - proxy serveur→serveur vers le Maker : Bearer, mapping de la réponse,
 *    aucune fuite d'URL/secret en cas d'erreur ;
 *  - aucune persistance / déploiement / export sur le chemin (vérif statique).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  parseSparkPreviewBody,
  isRequestAllowed,
  checkSparkRateLimit,
  runSparkPreview,
  __resetSparkRateLimit,
} from "@/lib/sandbox/spark-preview";

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

describe("runSparkPreview — proxy serveur→serveur vers le Maker", () => {
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    process.env.MAKER_INTERNAL_URL = "http://localhost:3001";
    process.env.INTERNAL_API_SECRET = "test-secret";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...OLD_ENV };
  });

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  it("relaie le prompt au Maker (Bearer + tier spark) et mappe { html, degraded }", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        html: "<!doctype html><html><body><div class=\"bpm-metric\">CA</div></body></html>",
        degraded: false,
        meta: { appName: "Mon CRM", tier: "spark" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await runSparkPreview("un CRM simple");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://localhost:3001/api/internal/spark-preview");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-secret");
    expect(JSON.parse(init.body as string)).toEqual({ prompt: "un CRM simple", tier: "spark" });

    // Contrat public : uniquement le HTML rendu + l'indicateur de repli.
    expect(result.html).toContain("bpm-metric");
    expect(result.degraded).toBe(false);
    expect(Object.keys(result).sort()).toEqual(["degraded", "html"]);
  });

  it("propage degraded:true du Maker", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ html: "<!doctype html><html><body><div>repli</div></body></html>", degraded: true })
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await runSparkPreview("x");
    expect(result.degraded).toBe(true);
    expect(result.html).toContain("repli");
  });

  it("rejette si le Maker ne renvoie pas de html", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ meta: { appName: "X" } }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(runSparkPreview("x")).rejects.toThrow();
  });

  it("ne fuite ni URL ni secret en cas d'erreur Maker (message FR neutre)", async () => {
    const fetchMock = vi.fn(async () =>
      new Response("internal detail http://localhost:3001 Bearer test-secret", { status: 502 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(runSparkPreview("x")).rejects.toThrow(/échou/i);
    const err = await runSparkPreview("x").catch((e: Error) => e);
    expect((err as Error).message).not.toContain("localhost");
    expect((err as Error).message).not.toContain("test-secret");
  });

  it("n'appelle pas le Maker si INTERNAL_API_SECRET est absent", async () => {
    delete process.env.INTERNAL_API_SECRET;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(runSparkPreview("x")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("échoue proprement si MAKER_INTERNAL_URL est absent", async () => {
    delete process.env.MAKER_INTERNAL_URL;
    vi.stubGlobal("fetch", vi.fn());

    await expect(runSparkPreview("x")).rejects.toThrow();
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
