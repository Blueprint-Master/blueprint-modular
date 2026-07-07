/**
 * bpm.free — cadre de sécurité des zones de liberté (0.3.3).
 * Une zone qui lève au runtime meurt seule (render null) au lieu de faire
 * tomber la page ; le contenu sain est rendu dans un conteneur confiné et
 * identifiable (data-bpm-free-zone).
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { FreeZone } from "../../../components/bpm/FreeZone";

function Bomb(): React.ReactElement {
  throw new Error("zone cassée");
}

describe("bpm.free (FreeZone)", () => {
  it("rend le contenu dans un conteneur confiné et identifiable", () => {
    render(
      <FreeZone name="BrassinsHero">
        <span>contenu libre</span>
      </FreeZone>
    );
    const zone = screen.getByText("contenu libre").closest("[data-bpm-free-zone]");
    expect(zone).not.toBeNull();
    expect(zone!.getAttribute("data-bpm-free-zone")).toBe("BrassinsHero");
    expect((zone as HTMLElement).style.minWidth).toBe("0");
    expect((zone as HTMLElement).style.overflowX).toBe("hidden");
  });

  it("une erreur runtime dans la zone → render null, la page survit", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <div>
        <p>le reste de la page</p>
        <FreeZone name="ZoneCassee">
          <Bomb />
        </FreeZone>
      </div>
    );
    expect(screen.getByText("le reste de la page")).toBeTruthy();
    expect(container.querySelector("[data-bpm-free-zone]")).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    err.mockRestore();
  });
});
