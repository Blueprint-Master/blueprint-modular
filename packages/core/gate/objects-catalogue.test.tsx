import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/i18n/LocaleProvider", () => ({useI18n: () => ({locale:"fr"})}));
import { ObjectsCatalogue } from "../../../components/site/ObjectsCatalogue";

afterEach(cleanup);
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
