/** Run inside a consumer directory containing only the unpacked npm dependency. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolveTheme, applyTheme } from "@blueprint-modular/core/themes";
import { createTranslator } from "@blueprint-modular/core/i18n";
import { validateAndEnrichSpec } from "@blueprint-modular/core/schema";

const require = createRequire(import.meta.url);
assert.equal(typeof validateAndEnrichSpec, "function");
for (const [entry, method] of [["schema","validateAndEnrichSpec"], ["themes","resolveTheme"], ["i18n","createTranslator"]]) {
  assert.equal(typeof require("@blueprint-modular/core/" + entry)[method], "function");
}
const catalogs = {
  fr: { welcome: "Bonjour {name}", shipments: "{count} colis préparé|{count} colis préparés" },
  en: { welcome: "Hello {name}" },
};
const translator = createTranslator(catalogs, "fr", "en-GB");
assert.equal(translator.locale, "en");
assert.deepEqual(translator.missing, ["shipments"]);
assert.equal(translator.translate("welcome", {name: "Alice"}), "Hello Alice");
assert.equal(translator.translate("shipments", {count: 0}), "0 colis préparé");
assert.equal(translator.translate("shipments", {count: 2}), "2 colis préparés");
assert.equal(translator.translate("unknown"), "unknown");
assert.equal(translator.currency(12, "GBP"), "£12.00");
assert.equal(translator.date(new Date("2026-11-19T00:00:00Z")), "19/11/2026");

const base = {id:"base", nom:"Default", couleurApp:"Modular", fond:"#ffffff", surface:"#eeeeee", texte:"#101010", accent:"#003344", rayon:6};
const client = {...base, id:"client", nom:"Client", couleurApp:"Atelier", accent:"#ff4466"};
const scoped = new Map();
const selected = resolveTheme([base, client], "base", "client");
applyTheme({style: {setProperty: (key, value) => scoped.set(key,value)}}, selected);
assert.equal(selected.name, "Atelier");
assert.equal(scoped.get("--bpm-accent"), "#ff4466");
assert.equal(scoped.get("--bpm-radius"), "6px");
assert.equal(resolveTheme([base], "base", "client").id, "base");
assert.throws(() => resolveTheme([{...base, rayon:-1}], "base"), /Invalid/);
console.log("Installed npm exports, translated values, tenant branding and fallback passed.");
