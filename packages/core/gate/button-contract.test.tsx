import React from "react";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Button as SiteButton } from "../../../components/bpm/Button";
import { bpm } from "../src/bpm";

it.each([["npm", bpm.button], ["site", (props: React.ComponentProps<typeof SiteButton>) => <SiteButton {...props} />]] as const)("%s forwards the caller's class and style to the native button on server and client", (_, makeButton) => {
  const element = makeButton({ children: "Valider", className: "commande priorité", style: { height: 51 } });
  const html = document.createElement("div");
  html.innerHTML = renderToStaticMarkup(element);
  render(element);
  for (const button of [html.querySelector("button"), screen.getByRole("button", { name: "Valider" })]) {
    expect(button).toHaveClass("commande", "priorité");
    expect(button).toHaveStyle({ height: "51px" });
  }
});

it("supports the documented long size names through the public export", () => {
  const { getByRole } = render(bpm.button({ size: "large", children: "Continuer" }));
  expect(getByRole("button")).toHaveStyle({ height: "44px" });
});
