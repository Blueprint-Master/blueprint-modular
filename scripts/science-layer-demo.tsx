import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import {ScienceObject} from "../packages/core/src/objects/ScienceObject";
import {ScienceControls} from "../packages/core/src/objects/ScienceControls";
import {DEFAULT_SCIENCE_SETTINGS,type ScienceId,type ScienceStyle} from "../packages/core/src/objects/science";
function Demo(){
 const [science,setScience]=useState(DEFAULT_SCIENCE_SETTINGS),[id,setId]=useState<ScienceId>("science-molecule"),[style,setStyle]=useState<ScienceStyle>("paper");
 return <main><h1>Calques atomiques & moléculaires</h1><p>Modèles de lecture, pas un simulateur quantique. Toutes les modifications restent locales.</p><nav><label>Objet <select value={id} onChange={e=>setId(e.target.value as ScienceId)}><option value="science-molecule">Compositeur moléculaire</option><option value="science-atom">Calque atomique</option></select></label><label>Fond <select value={style} onChange={e=>setStyle(e.target.value as ScienceStyle)}><option value="paper">Papier</option><option value="midnight">Nuit</option><option value="transparent">Transparent</option></select></label></nav><div className="layout"><section><div className="light"><ScienceObject id={id} label="Vue principale" size={520} style={style} {...science}/></div><div className="dark"><ScienceObject id={id} label="Petit format" size={180} thumbnail style={style} {...science}/></div></section><aside><ScienceControls id={id} value={science} onChange={setScience}/><details><summary>Référence transportable</summary><pre>{JSON.stringify({schemaVersion:1,kind:"modular-object",id,version:"1.0.0",style,animation:{playing:true,speed:1},science},null,2)}</pre></details></aside></div></main>;
}
createRoot(document.getElementById("root")!).render(<Demo/>);
