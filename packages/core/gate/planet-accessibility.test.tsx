import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlanetObject } from "../src/objects/PlanetObject";

describe("planet accessibility without a browser", () => {
  it("associates each keyboard-controlled globe with its own instructions", () => {
    const html = renderToStaticMarkup(<><PlanetObject id="earth" label="Earth"/><PlanetObject id="mars" label="Mars"/></>);
    const descriptions = [...html.matchAll(/aria-describedby="([^"]+)"/g)].map(match => match[1]);
    expect(descriptions).toHaveLength(2);
    expect(new Set(descriptions).size).toBe(2);
    for (const id of descriptions) expect(html).toContain(`<span id="${id}" hidden="">Drag or use arrow keys to rotate the globe</span>`);
    expect(html).not.toContain("aria-description=");
    expect(html.match(/tabindex="0"/g)).toHaveLength(2);
  });
  it("keeps static globes out of keyboard navigation and omits interaction instructions", () => {
    const html = renderToStaticMarkup(<PlanetObject id="earth" label="Earth" interactive={false}/>);
    expect(html).toContain('<canvas');
    expect(html).not.toContain("tabindex");
    expect(html).not.toContain("aria-describedby");
    expect(html).not.toContain("Drag or use arrow keys");
  });
  it("renders an accessible lazy poster without a canvas for thumbnails", () => {
    const html = renderToStaticMarkup(<PlanetObject id="earth" label="Earth" thumbnail/>);
    expect(html).toContain('<picture><img');
    expect(html).toContain('alt="Earth" loading="lazy"');
    expect(html).not.toContain('<canvas');
    expect(html).not.toContain("Drag or use arrow keys");
  });
});
