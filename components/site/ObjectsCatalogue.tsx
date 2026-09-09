"use client";
import React, { useMemo, useState } from "react";
import { Box, Copy, Download, Pause, Play, RotateCcw, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { ModularObject, DISCOVERABLE_OBJECTS, resolveModularObject, searchModularObjects, isPlanetId, isWeatherId, UNIVERSE_VERSION, planetProvenance, type PlanetStyle, type ObjectFamily } from "../../packages/core/src/objects";
import { CatalogueHero } from "./CatalogueLayout";
import { ObjectContributions } from "./ObjectContributions";
import styles from "./ObjectsCatalogue.module.css";

const FR={title:"Objets",intro:"Choisissez un univers, trouvez votre objet et donnez-lui vie dans votre application.",eyebrow:"LA BIBLIOTHÈQUE D’OBJETS",all:"Tout",space:"Univers",weather:"Météo & atmosphères",weatherHint:"Formation et dissipation locales · cycle artistique",buildings:"Bâtiments",mobility:"Mobilité",logistics:"Logistique",search:"Rechercher un objet",empty:"Aucun objet ne correspond à cette recherche.",angle:"Inclinaison",size:"Taille",motion:"Animation",speed:"Vitesse de l’animation",reset:"Réinitialiser",copy:"Copier l’intégration",copied:"Code copié",copyError:"Copie indisponible : sélectionnez le code ci-dessous.",reuse:"À vous de composer",version:"Version",license:"Licence",count:"objets",controls:"Réglages de l’objet",code:"Intégration React",photorealistic:"Photoréaliste",illustration:"Dessin",hint:"Faites glisser le globe pour l’explorer.",download:"Ajouter à Maker",downloadHint:"Glissez le fichier .modular.json dans le chat Maker.",source:"Textures : Solar System Scope · CC BY 4.0",sources:"Enrichir la bibliothèque",sourceIntro:"Importez un asset téléchargé ou créez votre propre objet.",vector:"Illustration vectorielle",art:"Interprétation artistique · rotation de présentation"};
const EN:typeof FR={title:"Objects",intro:"Choose a theme, find your object and bring it to life in your application.",eyebrow:"THE OBJECT LIBRARY",all:"All",space:"Universe",weather:"Weather & atmospheres",weatherHint:"Local formation and dissipation · artistic cycle",buildings:"Buildings",mobility:"Mobility",logistics:"Logistics",search:"Find an object",empty:"No objects match this search.",angle:"Tilt",size:"Size",motion:"Animation",speed:"Animation speed",reset:"Reset",copy:"Copy integration",copied:"Code copied",copyError:"Clipboard unavailable: select the code below.",reuse:"Make it yours",version:"Version",license:"License",count:"objects",controls:"Object controls",code:"React integration",photorealistic:"Photorealistic",illustration:"Illustration",hint:"Drag the globe to explore.",download:"Add to Maker",downloadHint:"Drop the .modular.json file into the Maker chat.",source:"Textures: Solar System Scope · CC BY 4.0",sources:"Grow the library",sourceIntro:"Import a downloaded asset or create your own object.",vector:"Vector illustration",art:"Artistic interpretation · presentation rotation"};
const families=["space","weather","buildings","mobility","logistics"] as const;
export function ObjectsCatalogue(){
 const {locale}=useI18n(),S=locale==="en"?EN:FR;
 const [selected,setSelected]=useState("saturn"),[query,setQuery]=useState("");
 const [family,setFamily]=useState<ObjectFamily|undefined>();
 const [angle,setAngle]=useState(0),[size,setSize]=useState(360),[motion,setMotion]=useState(true),[speed,setSpeed]=useState(1),[variant,setVariant]=useState<PlanetStyle>("photorealistic");
 const [copyState,setCopyState]=useState<"idle"|"done"|"error"|"download">("idle");
 const items=useMemo(()=>searchModularObjects(query,family),[query,family]);
 const planet=isPlanetId(selected),weather=isWeatherId(selected),animated=planet||weather,item=resolveModularObject(selected,planet?UNIVERSE_VERSION:"1.0.0")!,version=item.version,provenance=planetProvenance(selected);
 const code=`import { ModularObject } from '@blueprint-modular/core/objects';\n\n<ModularObject id="${selected}" version="${version}"\n  locale="${locale}" size={${size}} angle={${angle}}${animated?`\n  variant="${variant}" playing={${motion}} speed={${speed}}`:""} />`;
 const choose=(id:string)=>{setSelected(id);setAngle(0);setCopyState("idle");};
 async function copy(){try{await navigator.clipboard.writeText(code);setCopyState("done");}catch{setCopyState("error");}}
 function download(){const data=animated?{schemaVersion:1,kind:"modular-object",id:selected,version,style:variant,animation:{playing:motion,speed}}:{schemaVersion:1,kind:"modular-object",id:selected,version:"1.0.0",style:"vector",animation:{playing:false,speed:1}};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=`${selected}-${data.style}.modular.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setCopyState("download");}
 return <>
  <CatalogueHero eyebrow="CATALOGUE" title={S.title} lead={S.intro} meta={`${DISCOVERABLE_OBJECTS.length} ${S.count}`}/>
  <section className="site-section site-section-bordered"><div className="site-container"><div className={styles.page}>
  <div className={styles.filters}><div className={styles.tabs} role="group" aria-label={S.title}>{([undefined,...families] as const).map(f=><button type="button" key={f??"all"} aria-pressed={family===f} onClick={()=>setFamily(f)}>{f?S[f]:S.all}</button>)}</div><label className={styles.search}><Search size={18}/><input aria-label={S.search} placeholder={S.search} value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
  <section className={styles.studio} aria-label={S.controls}>
   <div className={styles.stage}><span className={styles.stageLabel}>{S[item.family]} / {item.name[locale]}</span>
    <div className={styles.object}><ModularObject id={selected} version={version} locale={locale} size={size} angle={angle} variant={variant} playing={motion} speed={speed}/></div>
    <div className={styles.stageFooter}><span>{weather?S.weatherHint:planet?S.hint:S.vector}</span>{animated&&<button type="button" aria-label={S.motion} aria-pressed={motion} onClick={()=>setMotion(!motion)}>{motion?<Pause size={18}/>:<Play size={18}/>}</button>}</div>
   </div>
   <div className={styles.details}><span className={styles.eyebrow}>{S.reuse}</span><h2>{item.name[locale]}</h2>
    {animated&&<div className={styles.tabs} role="group" aria-label="Style">{(["photorealistic","illustration"] as const).map(v=><button type="button" key={v} aria-pressed={variant===v} onClick={()=>{setVariant(v);setCopyState("idle");}}>{S[v]}</button>)}</div>}
    {!weather&&<label className={styles.range}>{S.angle}<output>{angle}°</output><input aria-label={S.angle} type="range" min="-35" max="35" value={angle} onChange={e=>{setAngle(Number(e.target.value));setCopyState("idle");}}/></label>}
    {animated&&<label className={styles.range}>{S.speed}<output>×{speed.toFixed(1)}</output><input aria-label={S.speed} type="range" min="0.1" max="3" step="0.1" value={speed} onChange={e=>{setSpeed(Number(e.target.value));setCopyState("idle");}}/></label>}
    <label className={styles.range}>{S.size}<output>{size}px</output><input aria-label={S.size} type="range" min="160" max="420" step="10" value={size} onChange={e=>{setSize(Number(e.target.value));setCopyState("idle");}}/></label>
    <div className={styles.actions}><button type="button" onClick={download}><Download size={18}/>{S.download}</button><button type="button" aria-label={S.reset} onClick={()=>{setAngle(0);setSize(360);setSpeed(1);setMotion(true);setCopyState("idle");}}><RotateCcw size={18}/></button></div>
    <p className={styles.note} role="status">{copyState==="download"?S.downloadHint:copyState==="error"?S.copyError:copyState==="done"?S.copied:weather?S.weatherHint:planet?S.art:S.vector}</p>
    {planet&&<a className={styles.credit} href={provenance.source} target="_blank" rel="noreferrer">{item.parent&&provenance.license!=="LicenseRef-NASA-Media"?`${provenance.author} · ${provenance.license}`:item.parent?(locale==="en"?"Source textures: NASA · usage guidelines":"Textures sources : NASA · conditions d’utilisation"):S.source}</a>}
   </div>
  </section>
  <details className={styles.code}><summary>{S.code}</summary><pre><code>{code}</code></pre><button type="button" onClick={copy}><Copy size={16}/>{S.copy}</button></details>
  <p className={styles.count} role="status">{items.length} / {DISCOVERABLE_OBJECTS.length} {S.count}</p>
  {[{family:"space" as const,parent:undefined},...(["jupiter","saturn","uranus","neptune"] as const).map(parent=>({family:"space" as const,parent})),...families.filter(f=>f!=="space").map(family=>({family,parent:undefined}))].map(({family:f,parent})=>{const group=items.filter(o=>o.family===f&&o.parent===parent),heading=parent?`${S.space} · ${locale==="en"?"Moons of ":parent==="uranus"?"Lunes d’":"Lunes de "}${resolveModularObject(parent)!.name[locale]}`:S[f];return group.length>0&&<section key={parent??f} className={styles.collection} aria-label={heading}><div className={styles.collectionHeading}><h2>{heading}</h2><span>{group.length} {S.count}</span></div>
   <div className={styles.grid}>{group.map(o=><button type="button" className={styles.card} key={o.id} aria-pressed={o.id===selected} aria-label={o.name[locale]} onClick={()=>choose(o.id)}>
    <div className={`${styles.thumbnail} ${f==="space"||f==="weather"?styles.cosmic:""}`}><ModularObject id={o.id} version={f==="space"?UNIVERSE_VERSION:o.version} variant={variant} locale={locale} size={220} thumbnail/></div>
    <span className={styles.cardName}>{o.name[locale]}<Box size={16}/></span><span className={styles.cardMeta}>{f==="space"?`${S[variant]} · 360°`:S[f]}</span></button>)}</div></section>;})}
  {items.length===0&&<p className={styles.empty}>{S.empty}</p>}
  <section className={styles.sources}><h2>{S.sources}</h2><p>{S.sourceIntro}</p><div className={styles.sourceGrid}>
   <a href="https://polyhaven.com/models" target="_blank" rel="noreferrer"><strong>Poly Haven</strong><span>3D · CC0</span></a>
   <a href="https://ambientcg.com/" target="_blank" rel="noreferrer"><strong>ambientCG</strong><span>Textures · CC0</span></a>
   <a href="https://kenney.nl/assets" target="_blank" rel="noreferrer"><strong>Kenney</strong><span>Illustrations · CC0</span></a>
   <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer"><strong>Solar System Scope</strong><span>Univers · CC BY 4.0</span></a>
  </div></section>
  <ObjectContributions locale={locale}/>
 </div></div></section></>;
}
