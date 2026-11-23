import React from "react";
import { bpm } from "../src/artifact";
import type { ArtifactSpec } from "../../../lib/artifact/contract";

function decimalPlaces(value: number) {
  const formatted = new Intl.NumberFormat("en", { maximumFractionDigits: 12 }).formatToParts(value);
  return formatted.find(part => part.type === "fraction")?.value.length ?? 0;
}

export function Dashboard({ title, blocks, locale, period, source }: ArtifactSpec) {
  const numberFormat = new Intl.NumberFormat(locale, { maximumSignificantDigits: 21 });
  const scientificFormat = new Intl.NumberFormat(locale, { notation: "scientific", maximumSignificantDigits: 21 });
  // Keep normal chart quantities easy to scan. Very long decimal expansions
  // (including subnormals) are shorter in scientific notation.
  const formatChartValue = (value: number) => {
    const decimal = numberFormat.format(value);
    if (decimal.length <= 28) return decimal;
    const scientific = scientificFormat.format(value);
    return scientific.length < decimal.length ? scientific : decimal;
  };
  return <main className="bpm-artifact" lang={locale}><h1>{title}</h1>{(period || source) && <p>{[period, source].filter(Boolean).join(" · ")}</p>}<div className="blocks">{blocks.map((block, i) => {
    switch (block.kind) {
      case "indicator": return <section className="indicator" key={i}>{bpm.metric({
        label: block.unit ? `${block.label} (${block.unit})` : block.label, value: block.value, valueLocale: locale,
        valueDecimals: block.decimals ?? decimalPlaces(block.value), delta: block.delta, currency: "",
        deltaType: !block.context ? "aucun" : block.context.direction === "lower_is_better" ? "inverse" : "normal",
        context: block.context, subtext: block.context?.referenceLabel,
        // Même unité d'écart que la couche IA (lib/artifact/context.ts : « % » → « pt »).
        judgmentUnit: block.unit === "%" ? "pt" : block.unit === "EUR" ? "€" : block.unit,
      })}</section>;
      case "paragraph": return <p key={i}>{block.text}</p>;
      case "status": return <div className="status" key={i}>{bpm.badge({children: block.text, variant: block.variant})}</div>;
      case "trend":
      case "comparison": {
        const chart = block.kind === "trend" ? bpm.lineChart : bpm.barChart;
        // x labels are categories in this contract. Geometry follows the supplied order.
        const data = block.data.map(({ y }, x) => ({ x, y }));
        return <figure key={i}><figcaption>{block.title}{block.unit ? ` (${block.unit})` : ""}</figcaption>
          {chart({ data, width: 760, height: 220, context: block.context })}
          <dl>{block.data.map(({x,y}, j) => <div key={j}><dt>{x}</dt><dd>{formatChartValue(y)}</dd></div>)}</dl>
        </figure>;
      }
    }
  })}</div></main>;
}
