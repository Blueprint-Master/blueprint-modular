import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/templates/route";

const endpoint = "http://localhost/api/templates";
const generate = (model: string, fields: object, name = "Recette") => POST(new Request(endpoint, {
  method: "POST", body: JSON.stringify({ model, fields, name, locale: "fr" }),
}));

describe("downloadable template documents", () => {
  it("publishes the fields of every downloadable template", async () => {
    const models = await GET(new Request(endpoint + "?locale=en")).json();
    expect(models.map((model: { id: string; format: string }) => [model.id, model.format]))
      .toEqual([["rapport", "html"], ["fiche", "html"], ["email", "eml"]]);
    expect(models[0].fields[0].label).toBe("Period");
  });
  it("renders independent reports concurrently and keeps text and amounts readable", async () => {
    const run = (periode: string, ca_realise: string) => generate("rapport", { periode, responsable: "Camille & Co", ca_realise }, "Suivi été");
    const [r1, r2] = await Promise.all([run("Mars", "1250,50"), run("Avril", "0")]);
    expect(r1.headers.get("content-disposition")).toContain("Suivi%20%C3%A9t%C3%A9.html");
    const march = (await r1.text()).replace(/[\u00a0\u202f]/g, " ");
    expect(march).toContain("1 250,50 €");
    expect(march).toContain("Camille &amp; Co");
    const april = await r2.text();
    expect(april).toContain("Avril");
    expect(april).not.toContain("Mars");
  });
  it("validates real dates, a finite decimal amount, all fields and email addresses", async () => {
    expect((await generate("fiche", { projet: "Recette", chef: "Équipe", date_limite: "29/02/2028" })).status).toBe(200);
    expect((await generate("fiche", { projet: "Recette", chef: "Équipe", date_limite: "29/02/2027" })).status).toBe(400);
    expect((await generate("rapport", { periode: "Mars", responsable: "A", ca_realise: "1.3.2" })).status).toBe(400);
    expect((await generate("email", { destinataire: "incomplet", objet: "Recette", corps: "Bonjour" })).status).toBe(400);
    expect((await generate("rapport", { periode: "Mars" })).status).toBe(400);
  });
  it("returns a portable unsent email draft with recipient, subject and message", async () => {
    const file = await generate("email", { destinataire: "qa@example.test", objet: "Atelier", corps: "Premiere ligne\nDeuxieme ligne." });
    expect(file.headers.get("content-type")).toBe("message/rfc822");
    const eml = await file.text();
    expect(eml).toMatch(/^X-Unsent: 1\r?$/mi);
    expect(eml).toMatch(/^To: qa@example.test\r?$/m);
    expect(eml).toMatch(/^Subject: Atelier\r?$/m);
    expect(eml).toContain("Deuxieme ligne.");
  });
});
