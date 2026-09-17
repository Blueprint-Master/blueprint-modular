import React from "react";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {renderToStaticMarkup} from "react-dom/server";
import {ScienceObject} from "../packages/core/src/objects/ScienceObject";
import {MOLECULE_PRESETS,moleculePresetSettings} from "../packages/core/src/objects/molecule-presets";
import {SCIENCE_IDS,SCIENCE_NAMES,type ScienceStyle} from "../packages/core/src/objects/science";

const directory=new URL("../docs/previews/science/",import.meta.url);
const publicDirectory=new URL("../public/objects/science-v1/previews/",import.meta.url);
mkdirSync(directory,{recursive:true});mkdirSync(publicDirectory,{recursive:true});
for(const id of SCIENCE_IDS)for(const style of ["midnight","paper","transparent"] as ScienceStyle[]){
 const html=renderToStaticMarkup(<ScienceObject id={id} label={SCIENCE_NAMES[id].fr} locale="fr" size={520} style={style} element={id==="science-comparator"?"Fe":id==="science-atom"?"O":"C"} compareElement="O" thumbnail/>);
 const svg=html.slice(html.indexOf("<svg"),html.lastIndexOf("</svg>")+6);
 writeFileSync(new URL(id+"-"+style+".svg",directory),svg);
 writeFileSync(new URL(id+"-"+style+".svg",publicDirectory),svg);
}
const motionHtml=renderToStaticMarkup(<ScienceObject id="science-atom" label={SCIENCE_NAMES["science-atom"].fr} locale="fr" size={520} style="midnight" element="Ru" playing/>);
writeFileSync(new URL("science-atom-motion.svg",directory),motionHtml.slice(motionHtml.indexOf("<svg"),motionHtml.lastIndexOf("</svg>")+6));
const manifestUrl=new URL("../public/objects/science-v1/manifest.json",import.meta.url),manifest=JSON.parse(readFileSync(manifestUrl,"utf8")) as {assets:Record<string,string>;objects:readonly string[];molecularSources:string[]};
manifest.objects=SCIENCE_IDS;
manifest.molecularSources=Object.values(MOLECULE_PRESETS).map(p=>p.source);
for(const preset of ["water","carbon-dioxide","methane","ammonia","ethanol","dimethyl-ether","benzene","caffeine","sucrose"] as Array<keyof typeof MOLECULE_PRESETS>)for(const style of ["midnight","paper","transparent"] as ScienceStyle[]){const html=renderToStaticMarkup(<ScienceObject id="science-molecule" label={preset} style={style} molecule={moleculePresetSettings(preset)} thumbnail/>);writeFileSync(new URL(`molecule-${preset}-${style}.svg`,directory),html.slice(html.indexOf("<svg"),html.lastIndexOf("</svg>")+6));}
for(const id of SCIENCE_IDS)for(const style of ["midnight","paper","transparent"] as ScienceStyle[]){const file=`${id}-${style}.svg`,path=`previews/${file}`,buffer=readFileSync(new URL(file,publicDirectory));manifest.assets[path]=createHash("sha256").update(buffer).digest("hex");}
writeFileSync(manifestUrl,JSON.stringify(manifest,null,2)+"\n");
