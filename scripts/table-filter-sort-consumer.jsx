import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { bpm } from "@blueprint-modular/core";
import "@blueprint-modular/core/style.css";

const rows = [
  ["A", "Ouvert", "12,90"], ["B", "Ouvert", "12,05"], ["C", "Ouvert", "12,50"],
  ["D", "Clos", "2,75"], ["E", "Ouvert", "12,20"], ["F", "Suspendu", "11,80"],
].map(([id, status, euros]) => ({ id, status, euros }));

const columns = [
  { key: "id", label: "Pièce" },
  { key: "status", label: "Statut", filterable: true },
  { key: "euros", label: "TTC", decimals: 2, total: "sum" },
];

function App() {
  const [count, setCount] = useState(4);
  return <main>
    <button onClick={() => setCount(current => current + 1)}>Ajouter une pièce</button>
    {bpm.table({ data: rows.slice(0, count), columns })}
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
