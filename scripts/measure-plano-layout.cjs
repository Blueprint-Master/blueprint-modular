// Mesure des gouttières et du rythme d'en-tête de Modular sur un build servi en local
// (http://localhost:3457). Usage :
//   node scripts/measure-plano-layout.cjs tests/fixtures/plano-layout-mesures.json - <routes,csv>
// Le JSON produit est relu par tests/plano-layout.test.ts.
const { chromium } = require('playwright'); const fs = require('fs');
const routes = process.argv[4].split(',');
(async () => { const b = await chromium.launch(); const res = [];
 for (const [w,h,theme] of [[384,832,'dark'],[390,844,'light'],[1440,900,'dark']]) {
  const c = await b.newContext({ viewport:{width:w,height:h}, colorScheme: theme, deviceScaleFactor: 1 });
  await c.addInitScript(t => { try { localStorage.setItem('theme', t); localStorage.setItem('bpm-theme', t); } catch {} }, theme);
  const p = await c.newPage();
  for (const r of routes) {
   try { await p.goto('http://localhost:3457'+r, {waitUntil:'domcontentloaded', timeout:90000}); await p.waitForTimeout(1800); } catch(e) { res.push({r,w,err:e.message.slice(0,60)}); continue; }
   const m = await p.evaluate(() => {
     const L = el => el ? Math.round(el.getBoundingClientRect().left) : null;
     const T = el => el ? el.getBoundingClientRect() : null;
     const vis = el => el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== 'hidden';
     const logo = [...document.querySelectorAll('.app-titlebar-brand, .site-brand, .site-wordmark, header a[aria-label*="accueil"], header a[href="/"]')].find(vis);
     const h1 = [...document.querySelectorAll('main h1, h1')].find(vis);
     let eyebrow = null, lead = null;
     if (h1) { const prev = h1.previousElementSibling; if (prev && /eyebrow|breadcrumb/.test(prev.className + ' ' + (prev.firstElementChild?.className||''))) eyebrow = prev;
       let n = h1.nextElementSibling; if (n && n.tagName === 'P') lead = n; }
     const bar = document.querySelector('.pwa-title-bar, .site-nav, header');
     const bt = T(bar), et = T(eyebrow), ht = T(h1), lt = T(lead);
     const sec = document.querySelector('.site-section-bordered > .site-container');
     const ruleLeft = sec ? Math.round(sec.getBoundingClientRect().left + parseFloat(getComputedStyle(sec).paddingLeft)) : null;
     return { ruleLeft, logo: L(logo), eyebrow: L(eyebrow), h1: L(h1), h1Font: h1 ? getComputedStyle(h1).fontFamily.split(',')[0].replace(/"/g,'') : null,
       barToTop: bt && (et||ht) ? Math.round((et||ht).top - bt.bottom) : null,
       eyeToH1: et && ht ? Math.round(ht.top - et.bottom) : null,
       h1ToLead: ht && lt ? Math.round(lt.top - ht.bottom) : null,
       overflow: document.documentElement.scrollWidth - innerWidth };
   });
   res.push({ r, w, theme, ...m });
   if (process.argv[3] !== '-' ) { const n = (r==='/'?'home':r.slice(1).replace(/\//g,'_')); await p.screenshot({ path: `${process.argv[3]}/${n}-${w}-${theme}.png` }); }
  }
  await c.close(); }
 fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1)); await b.close();
 for (const x of res) console.log([x.w, x.r.padEnd(26), 'logo', x.logo, 'eye', x.eyebrow, 'h1', x.h1, x.h1Font, 'bar→', x.barToTop, 'eye→h1', x.eyeToH1, 'h1→lead', x.h1ToLead, 'filet', x.ruleLeft, 'ov', x.overflow, x.err||''].join(' '));
})();
