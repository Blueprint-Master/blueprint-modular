import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { bpm } from "@blueprint-modular/core";
import "@blueprint-modular/core/style.css";

const rows = [
  { item: "C", status: "Ouvert", amount: 10 },
  { item: "B", status: "Clos", amount: 20 },
  { item: "A", status: "Ouvert", amount: 30 },
];
const columns = [
  { key: "item", label: "Article" },
  { key: "status", label: "Statut", filterable: true },
  { key: "amount", label: "Montant", total: "sum" },
];
function App() {
  const [filters, setFilters] = useState({});
  // Simulate an external owner that has not yet returned a narrower result set.
  return <main>
    <section id="local">{bpm.table({ data: rows, columns })}</section>
    <section id="server">{bpm.table({ data: rows, columns, filters, onFiltersChange: setFilters })}</section>
    <output id="filters">{JSON.stringify(filters)}</output>
    <section id="legacy">{bpm.table({ data: rows, columns: columns.map(({ filterable, ...col }) => col) })}</section>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
