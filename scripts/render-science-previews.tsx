import React from "react";
import {mkdirSync,writeFileSync} from "node:fs";
import {renderToStaticMarkup} from "react-dom/server";
import {ScienceObject} from "../packages/core/src/objects/ScienceObject";
import {SCIENCE_IDS,SCIENCE_NAMES,type ScienceStyle} from "../packages/core/src/objects/science";

const directory=new URL("../docs/previews/science/",import.meta.url);
const publicDirectory=new URL("../public/objects/science-v1/previews/",import.meta.url);
mkdirSync(directory,{recursive:true});mkdirSync(publicDirectory,{recursive:true});
for(const id of SCIENCE_IDS)for(const style of ["midnight","paper","transparent"] as ScienceStyle[]){
 const html=renderToStaticMarkup(<ScienceObject id={id} label={SCIENCE_NAMES[id].fr} locale="fr" size={520} style={style} element={id==="science-comparator"?"Fe":"C"} compareElement="O" thumbnail/>);
 const svg=html.slice(html.indexOf("<svg"),html.lastIndexOf("</svg>")+6);
 writeFileSync(new URL(id+"-"+style+".svg",directory),svg);
 writeFileSync(new URL(id+"-"+style+".svg",publicDirectory),svg);
}
