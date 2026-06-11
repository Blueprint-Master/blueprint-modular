// Screenshot the elevated bpm.* components on /components for mobile review.
// No app code is modified; output lands in review/screenshots/ (uncommitted).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = "review/screenshots";
mkdirSync(OUT, { recursive: true });

// The 5 auto-flagged cases get captured first (priority).
const PRIORITY = ["loadingBar", "highlightBox", "funnelChart", "treemap", "radarChart"];

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s*\+\s*/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const browser = await chromium.launch({ executablePath: EXEC, headless: true });
// Mobile review viewport (iPhone 12-ish width → single-column layout), retina for
// crisp charts. NB: isMobile is intentionally off — it corrupts element.screenshot
// clip coordinates in this Chromium build; the 390px width alone gives the mobile layout.
const ctx = await browser.newContext({
  viewport: { width: 390, height: 1400 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

console.log("→ navigate", `${BASE}/components`);
const resp = await page.goto(`${BASE}/components`, { waitUntil: "networkidle", timeout: 120000 });
console.log("  status", resp && resp.status());

// Wait for the elevation showcase to hydrate (client component).
await page.waitForSelector('section[id^="elevated-"]', { timeout: 60000 });
await page.waitForLoadState("networkidle");

// Scroll through the whole page once so every lazy-sized SVG chart computes its
// final height before we start clipping (otherwise sections shift under us).
await page.evaluate(async () => {
  const step = window.innerHeight;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1200);

// The historical /components page auto-opens a right-hand Drawer (role=dialog,
// aria-modal) plus a dim backdrop, and keeps closed modal backdrops mounted.
// None of these belong to the components under review — strip every fixed/sticky
// overlay so captures are clean and correctly positioned. App code is untouched;
// this only edits the live DOM in the headless browser.
const removed = await page.evaluate(() => {
  let n = 0;
  for (const el of Array.from(document.querySelectorAll("*"))) {
    const s = getComputedStyle(el);
    // The showcase sections are all static-positioned, so any fixed/sticky node is
    // chrome (drawer, backdrops, sticky nav, the Next.js dev indicator, FABs) — drop it.
    if (s.position === "fixed" || s.position === "sticky") {
      el.remove();
      n++;
    }
  }
  // The Next.js dev-mode indicator lives in a <nextjs-portal> custom element
  // (shadow DOM, bottom-left). Remove the host to drop the "N" badge.
  document
    .querySelectorAll("nextjs-portal, [data-nextjs-toast], #__next-build-watcher")
    .forEach((el) => {
      el.remove();
      n++;
    });
  document.documentElement.style.background = "#fff";
  document.body.style.background = "#fff";
  return n;
});
console.log(`  removed ${removed} fixed/sticky overlay element(s)`);
await page.waitForTimeout(400);

// Collect keys in DOM order.
const keys = await page.$$eval('section[id^="elevated-"]', (els) =>
  els.map((e) => e.id.replace("elevated-", ""))
);
console.log(`  found ${keys.length} elevated sections`);

// Order: priority first, then the rest (DOM order preserved).
const ordered = [...PRIORITY.filter((k) => keys.includes(k)), ...keys.filter((k) => !PRIORITY.includes(k))];

const manifest = [];
for (const key of ordered) {
  const sec = await page.$(`#elevated-${key}`);
  if (!sec) {
    console.log("  !! missing", key);
    continue;
  }
  await sec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const flagged = PRIORITY.includes(key) ? "  [FLAGGED]" : "";

  // Full card (all states stacked) for context.
  const cardPath = `${OUT}/${key}-card.png`;
  await sec.screenshot({ path: cardPath });
  manifest.push(cardPath);

  // One image per state, named <composant>-<état>.png.
  const figs = await sec.$$("figure");
  for (const fig of figs) {
    let name = "etat";
    try {
      name = await fig.$eval("figcaption .font-medium", (el) => el.textContent.trim());
    } catch {}
    const path = `${OUT}/${key}-${slug(name)}.png`;
    await fig.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    await fig.screenshot({ path });
    manifest.push(path);
  }
  console.log(`  ✓ ${key} (${figs.length} states)${flagged}`);
}

// A full-page capture of the whole elevation showcase for the overview.
const showcaseHeading = await page.$("text=Élévation — jugement");
if (showcaseHeading) {
  await showcaseHeading.scrollIntoViewIfNeeded();
}
await page.screenshot({ path: `${OUT}/_full-components-page.png`, fullPage: true });
manifest.push(`${OUT}/_full-components-page.png`);

await browser.close();
console.log(`\nWrote ${manifest.length} images to ${OUT}`);
if (errors.length) console.log(`console errors (${errors.length}):\n` + errors.slice(0, 10).join("\n"));
