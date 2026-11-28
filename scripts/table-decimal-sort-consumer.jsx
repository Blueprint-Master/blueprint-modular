import React from "react";
import { createRoot } from "react-dom/client";
import { bpm } from "@blueprint-modular/core";
import "@blueprint-modular/core/style.css";

const tokens = ["12,90", "12,05", "12,50", "2,75"];
const numbers = tokens.map(token => Number(token.replace(",", ".")));
const inputs = {
  decimal: tokens,
  percentage: tokens.map(token => token + " %"),
  number: numbers,
  point: tokens.map(token => token.replace(",", ".")),
};
const kind = new URLSearchParams(location.search).get("type");
const data = inputs[kind].map((value, i) => ({ id: "ABCD"[i], euros: value }));
const columns = [
  { key: "id", label: "Pièce" },
  { key: "euros", label: "Montant", decimals: 2, total: "sum" },
];
createRoot(document.getElementById("root")).render(<bpm.table columns={columns} data={data} />);
