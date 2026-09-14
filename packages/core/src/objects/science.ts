/** Scientific objects are data views, not decorative simulations. */
export const SCIENCE_VERSION = "1.0.0" as const;
export const SCIENCE_ASSET_PATH = "/objects/science-v1";
export const SCIENCE_IDS = ["science-periodic-table","science-atom","science-element-card","science-comparator"] as const;
export type ScienceId = typeof SCIENCE_IDS[number];
export type ScienceStyle = "midnight" | "paper";
export type ScienceColorMode = "category" | "block" | "period" | "mono";
export type ElementCategory = "alkali"|"alkaline"|"transition"|"post-transition"|"metalloid"|"nonmetal"|"halogen"|"noble-gas"|"lanthanoid"|"actinoid";
export interface ScienceLayers {structure:boolean;identity:boolean;classification:boolean;guides:boolean;analysis:boolean;}
export const DEFAULT_SCIENCE_LAYERS:Readonly<ScienceLayers>=Object.freeze({structure:true,identity:true,classification:true,guides:true,analysis:true});
export const SCIENCE_NAMES:Readonly<Record<ScienceId,{fr:string;en:string}>>=Object.freeze({
  "science-periodic-table":{fr:"Tableau périodique",en:"Periodic table"},
  "science-atom":{fr:"Analyseur atomique",en:"Atomic analyser"},
  "science-element-card":{fr:"Fiche d’élément",en:"Element card"},
  "science-comparator":{fr:"Comparateur d’éléments",en:"Element comparator"},
});

const SYMBOLS="H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
const NAMES:Record<string,{fr:string;en:string}>={
 H:{fr:"Hydrogène",en:"Hydrogen"},He:{fr:"Hélium",en:"Helium"},Li:{fr:"Lithium",en:"Lithium"},C:{fr:"Carbone",en:"Carbon"},N:{fr:"Azote",en:"Nitrogen"},O:{fr:"Oxygène",en:"Oxygen"},F:{fr:"Fluor",en:"Fluorine"},Ne:{fr:"Néon",en:"Neon"},Na:{fr:"Sodium",en:"Sodium"},Mg:{fr:"Magnésium",en:"Magnesium"},Al:{fr:"Aluminium",en:"Aluminium"},Si:{fr:"Silicium",en:"Silicon"},P:{fr:"Phosphore",en:"Phosphorus"},S:{fr:"Soufre",en:"Sulfur"},Cl:{fr:"Chlore",en:"Chlorine"},Ar:{fr:"Argon",en:"Argon"},K:{fr:"Potassium",en:"Potassium"},Ca:{fr:"Calcium",en:"Calcium"},Fe:{fr:"Fer",en:"Iron"},Co:{fr:"Cobalt",en:"Cobalt"},Ni:{fr:"Nickel",en:"Nickel"},Cu:{fr:"Cuivre",en:"Copper"},Zn:{fr:"Zinc",en:"Zinc"},Ag:{fr:"Argent",en:"Silver"},Sn:{fr:"Étain",en:"Tin"},I:{fr:"Iode",en:"Iodine"},W:{fr:"Tungstène",en:"Tungsten"},Pt:{fr:"Platine",en:"Platinum"},Au:{fr:"Or",en:"Gold"},Hg:{fr:"Mercure",en:"Mercury"},Pb:{fr:"Plomb",en:"Lead"},U:{fr:"Uranium",en:"Uranium"},Og:{fr:"Oganesson",en:"Oganesson"},
};
Object.assign(NAMES,{
 Be:{fr:"Béryllium",en:"Beryllium"},B:{fr:"Bore",en:"Boron"},Sc:{fr:"Scandium",en:"Scandium"},Ti:{fr:"Titane",en:"Titanium"},
 V:{fr:"Vanadium",en:"Vanadium"},Cr:{fr:"Chrome",en:"Chromium"},Mn:{fr:"Manganèse",en:"Manganese"},Ga:{fr:"Gallium",en:"Gallium"},
 Ge:{fr:"Germanium",en:"Germanium"},As:{fr:"Arsenic",en:"Arsenic"},Se:{fr:"Sélénium",en:"Selenium"},Br:{fr:"Brome",en:"Bromine"},
 Kr:{fr:"Krypton",en:"Krypton"},Rb:{fr:"Rubidium",en:"Rubidium"},Sr:{fr:"Strontium",en:"Strontium"},Y:{fr:"Yttrium",en:"Yttrium"},
 Zr:{fr:"Zirconium",en:"Zirconium"},Nb:{fr:"Niobium",en:"Niobium"},Mo:{fr:"Molybdène",en:"Molybdenum"},Tc:{fr:"Technétium",en:"Technetium"},
 Ru:{fr:"Ruthénium",en:"Ruthenium"},Rh:{fr:"Rhodium",en:"Rhodium"},Pd:{fr:"Palladium",en:"Palladium"},Cd:{fr:"Cadmium",en:"Cadmium"},
 In:{fr:"Indium",en:"Indium"},Sb:{fr:"Antimoine",en:"Antimony"},Te:{fr:"Tellure",en:"Tellurium"},Xe:{fr:"Xénon",en:"Xenon"},
});
Object.assign(NAMES,{
 Cs:{fr:"Césium",en:"Caesium"},Ba:{fr:"Baryum",en:"Barium"},La:{fr:"Lanthane",en:"Lanthanum"},Ce:{fr:"Cérium",en:"Cerium"},
 Pr:{fr:"Praséodyme",en:"Praseodymium"},Nd:{fr:"Néodyme",en:"Neodymium"},Pm:{fr:"Prométhium",en:"Promethium"},Sm:{fr:"Samarium",en:"Samarium"},
 Eu:{fr:"Europium",en:"Europium"},Gd:{fr:"Gadolinium",en:"Gadolinium"},Tb:{fr:"Terbium",en:"Terbium"},Dy:{fr:"Dysprosium",en:"Dysprosium"},
 Ho:{fr:"Holmium",en:"Holmium"},Er:{fr:"Erbium",en:"Erbium"},Tm:{fr:"Thulium",en:"Thulium"},Yb:{fr:"Ytterbium",en:"Ytterbium"},
 Lu:{fr:"Lutécium",en:"Lutetium"},Hf:{fr:"Hafnium",en:"Hafnium"},Ta:{fr:"Tantale",en:"Tantalum"},Re:{fr:"Rhénium",en:"Rhenium"},
 Os:{fr:"Osmium",en:"Osmium"},Ir:{fr:"Iridium",en:"Iridium"},Tl:{fr:"Thallium",en:"Thallium"},Bi:{fr:"Bismuth",en:"Bismuth"},
});
Object.assign(NAMES,{
 Po:{fr:"Polonium",en:"Polonium"},At:{fr:"Astate",en:"Astatine"},Rn:{fr:"Radon",en:"Radon"},Fr:{fr:"Francium",en:"Francium"},
 Ra:{fr:"Radium",en:"Radium"},Ac:{fr:"Actinium",en:"Actinium"},Th:{fr:"Thorium",en:"Thorium"},Pa:{fr:"Protactinium",en:"Protactinium"},
 Np:{fr:"Neptunium",en:"Neptunium"},Pu:{fr:"Plutonium",en:"Plutonium"},Am:{fr:"Américium",en:"Americium"},Cm:{fr:"Curium",en:"Curium"},
 Bk:{fr:"Berkélium",en:"Berkelium"},Cf:{fr:"Californium",en:"Californium"},Es:{fr:"Einsteinium",en:"Einsteinium"},Fm:{fr:"Fermium",en:"Fermium"},
 Md:{fr:"Mendélévium",en:"Mendelevium"},
});
Object.assign(NAMES,{
 No:{fr:"Nobélium",en:"Nobelium"},Lr:{fr:"Lawrencium",en:"Lawrencium"},Rf:{fr:"Rutherfordium",en:"Rutherfordium"},Db:{fr:"Dubnium",en:"Dubnium"},
 Sg:{fr:"Seaborgium",en:"Seaborgium"},Bh:{fr:"Bohrium",en:"Bohrium"},Hs:{fr:"Hassium",en:"Hassium"},Mt:{fr:"Meitnérium",en:"Meitnerium"},
 Ds:{fr:"Darmstadtium",en:"Darmstadtium"},Rg:{fr:"Roentgenium",en:"Roentgenium"},Cn:{fr:"Copernicium",en:"Copernicium"},Nh:{fr:"Nihonium",en:"Nihonium"},
 Fl:{fr:"Flérovium",en:"Flerovium"},Mc:{fr:"Moscovium",en:"Moscovium"},Lv:{fr:"Livermorium",en:"Livermorium"},Ts:{fr:"Tennesse",en:"Tennessine"},
});

const MAIN_ROWS:readonly (readonly [string,number][])[]= [
 [["H",1],["He",18]],
 [["Li",1],["Be",2],["B",13],["C",14],["N",15],["O",16],["F",17],["Ne",18]],
 [["Na",1],["Mg",2],["Al",13],["Si",14],["P",15],["S",16],["Cl",17],["Ar",18]],
 "K1 Ca2 Sc3 Ti4 V5 Cr6 Mn7 Fe8 Co9 Ni10 Cu11 Zn12 Ga13 Ge14 As15 Se16 Br17 Kr18".split(" ").map(x=>[x.replace(/\d+$/,""),Number(x.match(/\d+$/)?.[0])]),
 "Rb1 Sr2 Y3 Zr4 Nb5 Mo6 Tc7 Ru8 Rh9 Pd10 Ag11 Cd12 In13 Sn14 Sb15 Te16 I17 Xe18".split(" ").map(x=>[x.replace(/\d+$/,""),Number(x.match(/\d+$/)?.[0])]),
 "Cs1 Ba2 Hf4 Ta5 W6 Re7 Os8 Ir9 Pt10 Au11 Hg12 Tl13 Pb14 Bi15 Po16 At17 Rn18".split(" ").map(x=>[x.replace(/\d+$/,""),Number(x.match(/\d+$/)?.[0])]),
 "Fr1 Ra2 Rf4 Db5 Sg6 Bh7 Hs8 Mt9 Ds10 Rg11 Cn12 Nh13 Fl14 Mc15 Lv16 Ts17 Og18".split(" ").map(x=>[x.replace(/\d+$/,""),Number(x.match(/\d+$/)?.[0])]),
] as Array<Array<[string,number]>>;
const LANTHANOIDS="La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu".split(" ");
const ACTINOIDS="Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr".split(" ");
const byPosition=new Map<string,{period:number;group:number;row:number}>();
MAIN_ROWS.forEach((row,period)=>row.forEach(([symbol,group])=>byPosition.set(symbol,{period:period+1,group,row:period+1})));
LANTHANOIDS.forEach((symbol,index)=>byPosition.set(symbol,{period:6,group:3,row:8}));
ACTINOIDS.forEach((symbol,index)=>byPosition.set(symbol,{period:7,group:3,row:9}));

const sets={
 alkali:new Set("Li Na K Rb Cs Fr".split(" ")),alkaline:new Set("Be Mg Ca Sr Ba Ra".split(" ")),
 metalloid:new Set("B Si Ge As Sb Te Po".split(" ")),nonmetal:new Set("H C N O P S Se".split(" ")),
 halogen:new Set("F Cl Br I At Ts".split(" ")),noble:new Set("He Ne Ar Kr Xe Rn Og".split(" ")),
 post:new Set("Al Ga In Sn Tl Pb Bi Nh Fl Mc Lv".split(" ")),lanthanoid:new Set(LANTHANOIDS),actinoid:new Set(ACTINOIDS),
};
function category(symbol:string):ElementCategory{return sets.alkali.has(symbol)?"alkali":sets.alkaline.has(symbol)?"alkaline":sets.metalloid.has(symbol)?"metalloid":sets.nonmetal.has(symbol)?"nonmetal":sets.halogen.has(symbol)?"halogen":sets.noble.has(symbol)?"noble-gas":sets.post.has(symbol)?"post-transition":sets.lanthanoid.has(symbol)?"lanthanoid":sets.actinoid.has(symbol)?"actinoid":"transition";}
export interface ElementDatum {atomicNumber:number;symbol:string;name:{fr:string;en:string};period:number;group:number;row:number;column:number;category:ElementCategory;block:"s"|"p"|"d"|"f";}
export const ELEMENTS:readonly ElementDatum[]=Object.freeze(SYMBOLS.map((symbol,index)=>{const position=byPosition.get(symbol)!;const series=LANTHANOIDS.includes(symbol)||ACTINOIDS.includes(symbol);return Object.freeze({atomicNumber:index+1,symbol,name:NAMES[symbol]??{fr:symbol,en:symbol},...position,column:series?3+(series?((LANTHANOIDS.includes(symbol)?LANTHANOIDS:ACTINOIDS).indexOf(symbol)):0):position.group,category:category(symbol),block:series?"f":position.group<=2||symbol==="He"?"s":position.group>=13?"p":"d"});}));
export function elementBySymbol(symbol:string){return ELEMENTS.find(element=>element.symbol===symbol);}
export function isScienceId(id:string):id is ScienceId{return (SCIENCE_IDS as readonly string[]).includes(id);}
export function sciencePosterPath(id:ScienceId,style:ScienceStyle){return "previews/"+id+"-"+style+".svg";}
export function parseScienceLayers(raw:unknown):ScienceLayers|undefined{if(!raw||typeof raw!=="object"||Array.isArray(raw))return;const value=raw as Record<string,unknown>;for(const [key,item] of Object.entries(value)){if(!(key in DEFAULT_SCIENCE_LAYERS)||typeof item!=="boolean")return;}return {...DEFAULT_SCIENCE_LAYERS,...value};}
export interface ScienceSettings {element:string;compareElement:string;colorMode:ScienceColorMode;layers:ScienceLayers;}
export const DEFAULT_SCIENCE_SETTINGS:Readonly<ScienceSettings>=Object.freeze({element:"C",compareElement:"O",colorMode:"category",layers:{...DEFAULT_SCIENCE_LAYERS}});
export function parseScienceSettings(raw:unknown):ScienceSettings|undefined{if(!raw||typeof raw!=="object"||Array.isArray(raw))return;const value=raw as Record<string,unknown>,layers=parseScienceLayers(value.layers);if(Object.keys(value).some(key=>!["element","compareElement","colorMode","layers"].includes(key))||typeof value.element!=="string"||typeof value.compareElement!=="string"||!elementBySymbol(value.element)||!elementBySymbol(value.compareElement)||!["category","block","period","mono"].includes(value.colorMode as string)||!layers)return;return {element:value.element,compareElement:value.compareElement,colorMode:value.colorMode as ScienceColorMode,layers};}
