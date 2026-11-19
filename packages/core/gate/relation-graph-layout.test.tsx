import React from "react";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { RelationGraph } from "../../../components/bpm/RelationGraph";

const nodes = [{ id: "é", label: "Réception" }, { id: "ش", label: "شحن" }, { id: "📦", label: "Stock" }];
const edges = [{ from: "é", to: "ش" }, { from: "ش", to: "📦" }];
const graph = <RelationGraph nodes={nodes} edges={edges} />;

function geometry(container: HTMLElement) {
  return Array.from(container.querySelectorAll("g[transform]"), group => group.getAttribute("transform"));
}

it("renders the same SVG geometry on the server, after hydration and on a fresh mount", () => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(graph);
  const server = geometry(container);
  expect(container.querySelectorAll("text")).toHaveLength(nodes.length);
  expect(container.querySelectorAll("line")).toHaveLength(edges.length);
  render(graph, { container, hydrate: true });
  expect(geometry(container)).toEqual(server);
  expect(geometry(render(graph).container)).toEqual(server);
});

it("recomputes coordinates when the viewport changes", () => {
  const scene = (width: number) => <RelationGraph nodes={nodes} edges={edges} layout="grid" width={width} />;
  const view = render(scene(500));
  const before = geometry(view.container);
  view.rerender(scene(260));
  expect(geometry(view.container)).not.toEqual(before);
  expect(geometry(view.container)).toEqual(geometry(render(scene(260)).container));
});
