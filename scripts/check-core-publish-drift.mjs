#!/usr/bin/env node
/**
 * LA PUBLICATION DU CORE EST-ELLE EN RETARD ?
 *
 * ## Ce qui est arrivé, et qui n'a fait de bruit nulle part
 *
 * Le 19/08, **huit commits** touchant le core étaient mergés sur `master` sans
 * être publiés — dont trois `feat`, et trois qui corrigeaient des défauts que
 * blueprint-maker était en train de MESURER en production :
 *
 * - `#195` marque l'onglet actif (le Maker allait poser sa propre barre — deux
 *   repères empilés le jour de la publication) ;
 * - `#199` répare le nom d'app tronqué dans le rail (chantier Maker ouvert le
 *   même jour) ;
 * - `#193` donne le clic sur la LIGNE de notification (une tâche Maker attendait
 *   explicitement cette publication depuis des semaines).
 *
 * Le workflow `publish-core.yml` fonctionne parfaitement. Il refuse simplement
 * de republier une version déjà sur npm — et `packages/core/package.json` était
 * resté à `0.3.10`, publiée. **Le mécanisme était vivant, branché, et attendait
 * un geste manuel que personne ne savait devoir faire**, parce que rien ne le
 * disait.
 *
 * ## Ce que ce script fait — et ce qu'il ne fait PAS
 *
 * Il RAPPORTE. Il ne bloque pas, délibérément : le défaut à corriger est
 * l'INVISIBILITÉ, pas la permissivité. Exiger un bump dans chaque PR touchant un
 * composant ferait rougir des PR parfaitement justes et créerait des conflits de
 * version entre PR concurrentes — on remplacerait un silence par une friction,
 * sans rien voir de plus.
 *
 * Il sort donc toujours en 0, sauf usage explicite de `--strict`.
 *
 * ## Trois états, jamais deux
 *
 * `à jour`, `en retard`, et **`indéterminé`** — npm injoignable, ou historique
 * git absent (clone `--depth 1`). Confondre « rien à signaler » avec « je n'ai
 * pas pu regarder » est exactement la faute que ce script existe pour corriger :
 * il ne doit pas la commettre lui-même.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Chemins dont un changement exige une publication pour atteindre les consommateurs. */
export const CHEMINS_PUBLIES = ["components/", "packages/core/"];

function git(args) {
  return execFileSync("git", args, { cwd: RACINE, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

/** La version déclarée dans le dépôt. */
export function versionDeclaree() {
  return JSON.parse(readFileSync(join(RACINE, "packages/core/package.json"), "utf8")).version;
}

/** `true` / `false` / `null` si npm n'a pas répondu — `null` n'est pas `false`. */
export function estPubliee(version) {
  try {
    const out = execFileSync("npm", ["view", `@blueprint-modular/core@${version}`, "version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 30_000,
    }).trim();
    return out === version;
  } catch (e) {
    /* npm sort en erreur pour « version inexistante » ET pour « réseau mort ».
       Les distinguer sur le TEXTE, pas sur le code de sortie : E404 est un
       verdict, ENOTFOUND/ETIMEDOUT est une absence de verdict. */
    const txt = `${e?.stderr ?? ""}${e?.stdout ?? ""}`;
    if (/E404|is not in this registry|No match found/i.test(txt)) return false;
    return null;
  }
}

/**
 * Les commits touchant le core depuis celui qui a posé la version déclarée.
 *
 * Rend `null` si l'historique ne permet pas de conclure — un clone superficiel
 * rendrait une liste VIDE, indiscernable de « rien à publier ».
 */
export function commitsDepuisLaVersion(version) {
  let pose;
  try {
    /* Le commit qui a introduit cette version dans le fichier. `-S` cherche
       l'apparition de la chaîne, ce qui survit à un reformatage du JSON. */
    pose = git(["log", "-1", "--format=%H", `-S"version": "${version}"`, "--", "packages/core/package.json"]);
  } catch {
    return null;
  }
  if (!pose) return null;
  try {
    const brut = git(["log", "--format=%h %s", `${pose}..HEAD`, "--", ...CHEMINS_PUBLIES]);
    return brut ? brut.split("\n") : [];
  } catch {
    return null;
  }
}

/**
 * ⚠️ L'ORDRE des cas est le correctif, et la première rédaction l'avait faux.
 *
 * Elle exigeait de pouvoir lire l'historique AVANT de regarder si la version
 * était publiée — et rendait donc `indetermine` sur le cas le plus banal qui
 * soit : une PR qui vient de bumper. La version bumpée n'existe pas encore dans
 * l'historique (le commit n'est pas fait), donc `commits` valait `null`, et le
 * détecteur annonçait « je n'ai pas pu vérifier » sur l'état exactement sain
 * qu'il est censé récompenser. Un détecteur qui crie sur le bon comportement
 * cesse d'être lu — et il aurait crié sur la PR qui corrige le défaut.
 *
 * **Version non publiée ⇒ rien n'est en retard, et l'historique est hors sujet.**
 * On ne le consulte que pour départager « publiée et suivie de commits » de
 * « publiée et rien derrière ».
 */
export function verdict({ publiee, commits }) {
  if (publiee === null) return "indetermine";
  if (!publiee) return "a-publier";
  if (commits === null) return "indetermine";
  return commits.length > 0 ? "en-retard" : "a-jour";
}

function principal() {
  const strict = process.argv.includes("--strict");
  const version = versionDeclaree();
  const publiee = estPubliee(version);
  const commits = commitsDepuisLaVersion(version);
  const v = verdict({ version, publiee, commits });

  console.log(`\n@blueprint-modular/core — version déclarée : ${version}`);
  if (v === "indetermine") {
    console.log(
      "  ⚠️  INDÉTERMINÉ — npm injoignable ou historique git incomplet.\n" +
        "     Ce n'est PAS « à jour » : aucune vérification n'a eu lieu.",
    );
    process.exit(strict ? 2 : 0);
  }
  if (v === "a-publier") {
    console.log(`  ↑ Version ${version} PAS ENCORE sur npm — le workflow « Publish core to npm » la publiera.`);
    process.exit(0);
  }
  if (v === "a-jour") {
    console.log(`  ✓ ${version} est publiée et aucun changement de core ne l'a suivie.`);
    process.exit(0);
  }
  console.log(
    `  ✖ PUBLICATION EN RETARD — ${version} est DÉJÀ sur npm, et ${commits.length} commit(s) ` +
      `touchant ${CHEMINS_PUBLIES.join(" / ")} l'ont suivie :\n`,
  );
  for (const c of commits) console.log(`      ${c}`);
  console.log(
    `\n  Ces correctifs n'atteignent AUCUN consommateur tant que la version n'est pas bumpée.\n` +
      `  → bumper packages/core/package.json, puis Actions → « Publish core to npm ».\n`,
  );
  process.exit(strict ? 1 : 0);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  principal();
}
