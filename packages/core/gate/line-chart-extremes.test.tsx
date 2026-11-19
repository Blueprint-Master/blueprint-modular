import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { LineChart, type LineChartDatum } from "../../../components/bpm/LineChart";

function pathFor(data: LineChartDatum[]) {
  const markup = renderToStaticMarkup(<LineChart data={data} />);
  return markup.match(/<path d="([^"]+)"/)?.[1];
}

it("keeps opposite finite extremes and their midpoint within the viewport", () => {
  const limit = Number.MAX_VALUE;
  expect(pathFor([{ x: -limit, y: -limit }, { x: 0, y: 0 }, { x: limit, y: limit }]))
    .toBe("M10,190L200,100L390,10");
});

it("scales a dense series without passing its samples as function arguments", () => {
  const data = Array.from({ length: 160_000 }, (_, x) => ({ x, y: x % 2 }));
  const path = pathFor(data);
  expect(path?.startsWith("M10,190L")).toBe(true);
  expect(path?.endsWith("L390,10")).toBe(true);
  expect(path?.split("L").length).toBe(data.length);
});
