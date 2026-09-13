import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/i18n/LocaleProvider", () => ({useI18n: () => ({locale:"fr"})}));
import { ObjectsCatalogue } from "../../../components/site/ObjectsCatalogue";

vi.mock("../../../components/site/ObjectContributions",()=>({ObjectContributions:()=>null}));
vi.mock("../src/objects/PlanetObject",()=>({PlanetObject:({label}: {label:string})=><span role="img" aria-label={label}/> }));
vi.mock("../src/objects/FormObject",()=>({FormObject:({label}: {label:string})=><span role="img" aria-label={label}/> }));
vi.mock("../src/objects/WaterObject",()=>({WaterObject:({label}: {label:string})=><span role="img" aria-label={label}/> }));
vi.mock("../src/objects/FloraObject",()=>({FloraObject:({label}: {label:string})=><span role="img" aria-label={label}/> }));
afterEach(cleanup);
it("discovers the forms family and keeps style and motion in its real integration snippet",()=>{
 const {container}=render(<ObjectsCatalogue/>);fireEvent.click(screen.getByRole("button",{name:"Formes & ondes",exact:true}));
 fireEvent.click(screen.getByRole("button",{name:"Soie ondulante",exact:true}));
 fireEvent.click(screen.getByRole("button",{name:"Dessin",exact:true}));
 fireEvent.change(screen.getByRole("slider",{name:"Vitesse de l’animation"}),{target:{value:"0.5"}});
 fireEvent.click(screen.getByRole("button",{name:"Animation",exact:true}));
 const code=container.querySelector("code")?.textContent;expect(code).toContain('id="form-silk" version="1.0.0"');expect(code).toContain('variant="illustration" playing={false} speed={0.5}');
 expect(screen.queryByRole("slider",{name:"Inclinaison"})).toBeNull();
});
it("discovers living water and transports the selected treatment",()=>{
 const {container}=render(<ObjectsCatalogue/>);fireEvent.click(screen.getByRole("button",{name:"Eau & phénomènes naturels",exact:true}));
 fireEvent.click(screen.getByRole("button",{name:"Vague déferlante",exact:true}));fireEvent.click(screen.getByRole("button",{name:"Dessin",exact:true}));
 expect(container.querySelector("code")?.textContent).toContain('id="water-wave" version="1.0.0"');expect(container.querySelector("code")?.textContent).toContain('variant="illustration"');expect(screen.queryByRole("slider",{name:"Inclinaison"})).toBeNull();
});
describe("Objets: real catalogue consumer", () => {
  it("selects a standard object and updates the actual rendering and pinned snippet", () => {
    const {container}=render(<ObjectsCatalogue/>);
    fireEvent.click(screen.getByRole("button",{name:"Camion",exact:true}));
    expect(screen.getByRole("heading",{name:"Camion"})).toBeTruthy();
    expect(container.querySelector('section [data-modular-object="truck@1.0.0"]')).toBeTruthy();
    expect(container.querySelector("code")?.textContent).toContain('id="truck" version="1.0.0"');
    fireEvent.change(screen.getByRole("slider",{name:"Inclinaison"}),{target:{value:"25"}});
    expect(container.querySelector("code")?.textContent).toContain("angle={25}");
    fireEvent.click(screen.getByRole("button",{name:"Réinitialiser"}));
    expect(container.querySelector("code")?.textContent).toContain("angle={0}");
  });
  it("filters and searches without losing the selected preview", () => {
    render(<ObjectsCatalogue/>);
    fireEvent.click(screen.getByRole("button",{name:"Logistique",exact:true}));
    expect(screen.queryByRole("button",{name:"Terre",exact:true})).toBeNull();
    expect(screen.getByRole("button",{name:"Colis",exact:true})).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox",{name:"Rechercher un objet"}),{target:{value:"introuvable"}});
    expect(screen.getByText("Aucun objet ne correspond à cette recherche.")).toBeTruthy();
    expect(screen.getByRole("heading",{name:"Saturne"})).toBeTruthy();
  });
  it("lets users stop motion and reports clipboard failure honestly", async () => {
    Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:vi.fn().mockRejectedValue(new Error("unavailable"))}});
    render(<ObjectsCatalogue/>);
    const motion=screen.getByRole("button",{name:"Animation"});
    fireEvent.click(motion);expect(motion.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(screen.getByRole("button",{name:"Copier l’intégration"}));
    expect(await screen.findByText("Copie indisponible : sélectionnez le code ci-dessous.")).toBeTruthy();
    expect(screen.queryByText("Code copié")).toBeNull();
  });
});

it('carries independently edited Earth layers into the actual React integration',()=>{
 const {container}=render(<ObjectsCatalogue/>);
 fireEvent.click(screen.getByRole('button',{name:'Terre',exact:true}));
 fireEvent.click(screen.getByRole('button',{name:'Nuit',exact:true}));
 fireEvent.change(screen.getByRole('slider',{name:'Déplacement des nuages'}),{target:{value:'0'}});
 fireEvent.change(screen.getByRole('slider',{name:'Évolution des formes'}),{target:{value:'2'}});
 const code=container.querySelector('code')?.textContent;
 expect(code).toContain('"lighting":"night"');expect(code).toContain('"cloudSpeed":0');expect(code).toContain('"cloudEvolution":2');
 fireEvent.click(screen.getByRole('button',{name:'Réinitialiser',exact:true}));expect(container.querySelector('code')?.textContent).toContain('"lighting":"coordinated"');
});

it("discovers vegetation and carries style, pause and speed into the integration",()=>{const {container}=render(<ObjectsCatalogue/>);fireEvent.click(screen.getByRole("button",{name:"Végétation",exact:true}));fireEvent.click(screen.getByRole("button",{name:"Fougère qui s’éveille",exact:true}));fireEvent.click(screen.getByRole("button",{name:"Dessin",exact:true}));fireEvent.change(screen.getByRole("slider",{name:"Vitesse de l’animation"}),{target:{value:"0.5"}});fireEvent.click(screen.getByRole("button",{name:"Animation",exact:true}));const code=container.querySelector("code")?.textContent;expect(code).toContain('id="flora-fern" version="1.0.0"');expect(code).toContain('variant="illustration" playing={false} speed={0.5}');expect(screen.queryByRole("slider",{name:"Inclinaison"})).toBeNull();});
