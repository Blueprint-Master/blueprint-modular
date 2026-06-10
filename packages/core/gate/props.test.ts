/**
 * Prop-surface snapshot gate.
 * Extracts the exported prop names for every component in the bpm barrel
 * and freezes them as a vitest snapshot.
 * A removed or renamed prop = snapshot mismatch = FAIL (guarantees θ-additive).
 */
import { readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";
import { describe, it, expect } from "vitest";

const REPO_ROOT = resolve(__dirname, "../../..");
const BPM_TSX = resolve(__dirname, "../src/bpm.tsx");
const COMP_DIR = resolve(REPO_ROOT, "components/bpm");

// ---------------------------------------------------------------------------
// Regex-based TypeScript interface parser (replicates generate-llms-txt.py logic)
// ---------------------------------------------------------------------------

function findInterfaceBody(source: string, name: string): string | null {
  const re = new RegExp(
    `(?:export\\s+)?(?:interface|type)\\s+${name}\\s*(?:extends[^{]+)?=?\\s*\\{`,
    "m"
  );
  const m = re.exec(source);
  if (!m) return null;
  let depth = 1;
  let i = m.index + m[0].length;
  while (i < source.length && depth > 0) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") depth--;
    i++;
  }
  return source.slice(m.index + m[0].length, i - 1);
}

function parseProps(source: string, ifaceName: string): string[] {
  const body = findInterfaceBody(source, ifaceName);
  if (!body) return [];
  const names: string[] = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^\s+(\w+)\??:/);
    if (m && m[1] !== "default") names.push(m[1]);
  }
  return names;
}

function bpmKeyToFile(key: string): string | null {
  const ALIAS: Record<string, string> = {
    titleBpm: "Title",
    title1: "Title",
    title2: "Title",
    title3: "Title",
    title4: "Title",
    crud: "CrudPage",
    nfcBadge: "NfcBadge",
    qrCode: "QRCode",
    fab: "FAB",
    html: "Html",
    empty: "Empty",
    selectbox: "Selectbox",
    spinner: "Spinner",
    spinnerDot: "SpinnerDot",
    aiQueryBar: "AIQueryBar",
    plcConnector: "PLCConnector",
  };
  if (key in ALIAS) return ALIAS[key];
  // camelCase → PascalCase
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function getPropsFromSource(key: string): string[] {
  // Special: page, title, chat are defined in bpm.tsx
  if (key === "page") {
    const src = readFileSync(BPM_TSX, "utf-8");
    return parseProps(src, "PageProps");
  }
  if (key === "title") {
    const src = readFileSync(BPM_TSX, "utf-8");
    return parseProps(src, "TitleProps");
  }
  if (key === "chat") {
    // ChatProps is private in bpm.tsx (interface ChatProps), still extract it
    const src = readFileSync(BPM_TSX, "utf-8");
    return parseProps(src, "ChatProps");
  }

  const stem = bpmKeyToFile(key);
  if (!stem) return [];
  const filePath = join(COMP_DIR, `${stem}.tsx`);
  try {
    const src = readFileSync(filePath, "utf-8");
    // Find first exported interface/type that ends with Props
    const m = src.match(/export\s+(?:interface|type)\s+(\w+Props)\b/);
    if (!m) return [];
    return parseProps(src, m[1]);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Extract barrel keys from bpm.tsx
// ---------------------------------------------------------------------------

function extractBarrelKeys(): string[] {
  const src = readFileSync(BPM_TSX, "utf-8");
  const keys: string[] = [];
  // wrap() entries
  for (const m of src.matchAll(/^\s{2}(\w+):\s*wrap(?:<[^>]+>)?\s*\(/gm)) {
    keys.push(m[1]);
  }
  // Special non-wrap entries: page, chat, spinner, tabs, titleBpm (if not wrap)
  if (/^\s{2}page:\s*\(/m.test(src) && !keys.includes("page")) keys.push("page");
  if (/^\s{2}chat:\s*wrap/m.test(src) && !keys.includes("chat")) keys.push("chat");
  if (/^\s{2}spinner:\s*\(/m.test(src) && !keys.includes("spinner")) keys.push("spinner");
  if (/^\s{2}tabs:\s*\(/m.test(src) && !keys.includes("tabs")) keys.push("tabs");
  if (/^\s{2}title:\s*wrap/m.test(src) && !keys.includes("title")) keys.push("title");
  return [...new Set(keys)].sort();
}

// ---------------------------------------------------------------------------
// Snapshot test
// ---------------------------------------------------------------------------

describe("bpm prop surface snapshot", () => {
  it("prop names match committed snapshot (additive-only check)", () => {
    const keys = extractBarrelKeys();
    const surface: Record<string, string[]> = {};
    for (const key of keys) {
      surface[key] = getPropsFromSource(key);
    }
    expect(surface).toMatchSnapshot();
  });
});
