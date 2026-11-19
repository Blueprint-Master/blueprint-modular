import React from "react";
import { bpm } from "../src/artifact";
import type { ArtifactSpec } from "../../../lib/artifact/contract";

function decimalPlaces(value: number) {
  const formatted = new Intl.NumberFormat("en", { maximumFractionDigits: 12 }).formatToParts(value);
  return formatted.find(part => part.type === "fraction")?.value.length ?? 0;
}

export function Dashboard({ title, blocks, locale }: ArtifactSpec) {
  const numberFormat = new Intl.NumberFormat(locale);
  return <main className="bpm-artifact" lang={locale}><h1>{title}</h1><div className="blocks">{blocks.map((block, i) => {
    switch (block.kind) {
      case "indicator": return <section className="indicator" key={i}>{bpm.metric({
        label: block.label, value: block.value, valueLocale: locale,
        valueDecimals: block.decimals ?? decimalPlaces(block.value), delta: block.delta, currency: "",
        deltaType: !block.context ? "aucun" : block.context.direction === "lower_is_better" ? "inverse" : "normal",
        context: block.context, subtext: block.context?.referenceLabel,
      })}</section>;
      case "paragraph": return <p key={i}>{block.text}</p>;
      case "status": return <div className="status" key={i}>{bpm.badge({children: block.text, variant: block.variant})}</div>;
      case "trend":
      case "comparison": {
        const chart = block.kind === "trend" ? bpm.lineChart : bpm.barChart;
        // x labels are categories in this contract. Geometry follows the supplied order.
        const data = block.data.map(({ y }, x) => ({ x, y }));
        return <figure key={i}><figcaption>{block.title}</figcaption>
          {chart({ data, width: 760, height: 220, context: block.context })}
          <dl>{block.data.map(({x,y}, j) => <div key={j}><dt>{x}</dt><dd>{numberFormat.format(y)}</dd></div>)}</dl>
        </figure>;
      }
    }
  })}</div></main>;
}
