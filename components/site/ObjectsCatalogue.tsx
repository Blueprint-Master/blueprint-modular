"use client";
import React, { useMemo, useState } from "react";
import { Box, Copy, Pause, Play, RotateCcw, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { ModularObject, MODULAR_OBJECTS, OBJECT_CATALOG_VERSION, resolveModularObject, searchModularObjects, type ObjectFamily } from "../../packages/core/src/objects";
import styles from "./ObjectsCatalogue.module.css";

const FR = { title:"Des objets. Des possibilités.", intro:"Vingt objets réutilisables, un langage visuel commun. Explorez, ajustez, puis composez votre expérience.",
  eyebrow:"LA MATIÈRE DE VOS APPLICATIONS", all:"Tout", space:"Espace", buildings:"Bâtiments", mobility:"Mobilité", logistics:"Logistique", search:"Rechercher un objet", empty:"Aucun objet ne correspond à cette recherche.",
  angle:"Inclinaison", size:"Taille", motion:"Animation", reset:"Réinitialiser", copy:"Copier l’intégration", copied:"Code copié", copyError:"Copie indisponible : sélectionnez le code ci-dessous.",
  precision:"Illustrations vectorielles stylisées — ni CAO, ni modèle scientifique à l’échelle.", reuse:"Prêt à composer", version:"Version épinglée", license:"Licence", stable:"Sans téléchargement externe", count:"objets", controls:"Réglages de l’objet", code:"Intégration React" };
const EN: typeof FR = { title:"Objects. Possibilities.", intro:"Twenty reusable objects, one visual language. Explore, adjust, then compose your experience.",
  eyebrow:"THE MATERIAL OF YOUR APPLICATIONS", all:"All", space:"Space", buildings:"Buildings", mobility:"Mobility", logistics:"Logistics", search:"Find an object", empty:"No objects match this search.",
  angle:"Tilt", size:"Size", motion:"Animation", reset:"Reset", copy:"Copy integration", copied:"Code copied", copyError:"Clipboard unavailable: select the code below.",
  precision:"Stylized vector illustrations — not CAD or scientific scale models.", reuse:"Ready to compose", version:"Pinned version", license:"License", stable:"No external asset downloads", count:"objects", controls:"Object controls", code:"React integration" };

export function ObjectsCatalogue() {
  const { locale } = useI18n(); const S = locale === "en" ? EN : FR;
  const [selected,setSelected] = useState("saturn"), [query,setQuery] = useState("");
  const [family,setFamily] = useState<ObjectFamily|undefined>();
  const [angle,setAngle] = useState(0), [size,setSize] = useState(300), [motion,setMotion] = useState(true);
  const [copyState,setCopyState] = useState<"idle"|"done"|"error">("idle");
  const items = useMemo(()=>searchModularObjects(query,family),[query,family]);
  const item = resolveModularObject(selected)!;
  const code = `import { ModularObject } from '@blueprint-modular/core/objects';\n\n<ModularObject id="${item.id}" version="${OBJECT_CATALOG_VERSION}"\n  locale="${locale}" size={${size}} angle={${angle}} />`;
  const choose = (id:string) => {setSelected(id);setAngle(0);setCopyState("idle");};
  async function copy() {try {await navigator.clipboard.writeText(code);setCopyState("done");} catch {setCopyState("error");}}
  return <section className={styles.page}>
    <header className={styles.header}><span className={styles.eyebrow}>{S.eyebrow}</span><h1>{S.title}</h1><p>{S.intro}</p></header>
    <section className={styles.studio} aria-label={S.controls}>
      <div className={styles.stage}>
        <span className={styles.stageLabel}>{S[item.family]} / {item.id}</span>
        <div className={`${styles.object} ${motion ? styles.moving : ""}`}><ModularObject id={selected} locale={locale} size={size} angle={angle}/></div>
        <div className={styles.stageFooter}><span>SVG · {S.reuse}</span><button type="button" aria-label={S.motion} aria-pressed={motion} onClick={()=>setMotion(!motion)}>{motion ? <Pause size={16}/> : <Play size={16}/>}</button></div>
      </div>
      <div className={styles.details}>
        <span className={styles.eyebrow}>{S.reuse}</span><h2>{item.name[locale]}</h2><p className={styles.note}>{S.precision}</p>
        <dl className={styles.facts}><div><dt>{S.version}</dt><dd>{item.version}</dd></div><div><dt>{S.license}</dt><dd>{item.license}</dd></div></dl>
        <label className={styles.range}>{S.angle}<output>{angle}°</output><input aria-label={S.angle} type="range" min="-35" max="35" value={angle} onChange={e=>{setAngle(Number(e.target.value));setCopyState("idle");}}/></label>
        <label className={styles.range}>{S.size}<output>{size}px</output><input aria-label={S.size} type="range" min="160" max="360" step="10" value={size} onChange={e=>{setSize(Number(e.target.value));setCopyState("idle");}}/></label>
        <div className={styles.actions}><button type="button" onClick={copy}><Copy size={16}/>{copyState === "done" ? S.copied : S.copy}</button><button type="button" aria-label={S.reset} onClick={()=>{setAngle(0);setSize(300);setMotion(true);setCopyState("idle");}}><RotateCcw size={16}/></button></div>
        <div role="status" className={styles.note}>{copyState === "error" ? S.copyError : copyState === "done" ? S.copied : S.stable}</div>
      </div>
    </section>
    <details className={styles.code}><summary>{S.code}</summary><pre><code>{code}</code></pre></details>
    <div className={styles.filters}><div className={styles.tabs} role="group" aria-label={S.title}>{([undefined,"space","buildings","mobility","logistics"] as const).map(f=><button type="button" key={f??"all"} aria-pressed={family===f} onClick={()=>setFamily(f)}>{f ? S[f] : S.all}</button>)}</div>
      <label className={styles.search}><Search size={17}/><input aria-label={S.search} placeholder={S.search} value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
    <p className={styles.count} role="status">{items.length} / {MODULAR_OBJECTS.length} {S.count}</p>
    <div className={styles.grid}>{items.map(o=><button type="button" className={styles.card} key={o.id} aria-pressed={o.id===selected} aria-label={o.name[locale]} onClick={()=>choose(o.id)}>
      <div className={styles.thumbnail}><ModularObject id={o.id} locale={locale} size={156}/></div>
      <span className={styles.cardName}>{o.name[locale]}<Box size={14}/></span><span className={styles.cardMeta}>{S[o.family]} · v{o.version}</span>
    </button>)}</div>
    {items.length===0 && <p className={styles.empty}>{S.empty}</p>}
  </section>;
}
