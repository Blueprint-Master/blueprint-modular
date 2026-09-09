import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import {WeatherObject} from "../packages/core/src/objects/WeatherObject";
import {WEATHER_IDS,WEATHER_NAMES,type WeatherId,type WeatherStyle} from "../packages/core/src/objects/weather";
function Preview(){
 const [id,setId]=useState<WeatherId>("weather-fair"),[style,setStyle]=useState<WeatherStyle>("photorealistic"),[playing,setPlaying]=useState(true),[dark,setDark]=useState(true),[size,setSize]=useState(420),[speed,setSpeed]=useState(1);
 return <main style={{fontFamily:"system-ui",background:dark?"#101a28":"#f6f2eb",color:dark?"#eef3fa":"#263849",minHeight:"180vh",padding:24}}>
 <h1>Études atmosphériques</h1><p>Un objet vivant, cinq situations ordinaires. Les vignettes sont fixes.</p>
 <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
 <label>Objet <select aria-label="Objet" value={id} onChange={e=>setId(e.target.value as WeatherId)}>{WEATHER_IDS.map(i=><option key={i} value={i}>{WEATHER_NAMES[i].fr}</option>)}</select></label>
 <label>Style <select aria-label="Style" value={style} onChange={e=>setStyle(e.target.value as WeatherStyle)}><option value="photorealistic">Photoréaliste</option><option value="illustration">Gouache</option></select></label>
 <button onClick={()=>setPlaying(!playing)}>{playing?"Pause":"Reprendre"}</button><button onClick={()=>setDark(!dark)}>Fond {dark?"clair":"sombre"}</button>
 <label>Format <select aria-label="Format" value={size} onChange={e=>setSize(+e.target.value)}><option value="420">420 px</option><option value="160">160 px</option></select></label>
 <label>Vitesse <select aria-label="Vitesse" value={speed} onChange={e=>setSpeed(+e.target.value)}><option value="0.5">× 0,5</option><option value="1">× 1</option><option value="2">× 2</option></select></label>
 </div><WeatherObject id={id} label={WEATHER_NAMES[id].fr} style={style} size={size} playing={playing} speed={speed}/>
 <div style={{display:"flex",flexWrap:"wrap"}}>{WEATHER_IDS.map(i=><button key={i} onClick={()=>setId(i)} style={{background:"transparent",color:"inherit",border:"1px solid #8191a355",borderRadius:12,margin:5}}><WeatherObject id={i} label={WEATHER_NAMES[i].fr} style={style} size={120} thumbnail/><div>{WEATHER_NAMES[i].fr}</div></button>)}</div>
 <p>Faire défiler cette page permet de vérifier l’arrêt hors écran. Reduced motion est respecté depuis les préférences du système.</p></main>;
}
createRoot(document.getElementById("root")!).render(<Preview/>);
