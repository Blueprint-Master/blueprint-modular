import type { ComputeFunction } from "./types";

const functions = new Map<string, ComputeFunction>();

export function registerFunction(fn: ComputeFunction): void {
  functions.set(fn.name, fn);
}

export function getFunction(name: string): ComputeFunction | null {
  return functions.get(name) ?? null;
}

export function getAllFunctions(): ComputeFunction[] {
  return Array.from(functions.values());
}

export function buildToolsDescription(): string {
  const list = getAllFunctions();
  if (!list.length) return "";
  const lines = list.map((fn) => {
    const params = Object.entries(fn.parameters)
      .map(([key, p]) => `${key} (${p.type}${p.required ? ", requis" : ""}): ${p.description}`)
      .join(", ");
    return `- ${fn.name}(${Object.keys(fn.parameters).join(", ")}): ${fn.description}. Paramètres: ${params}`;
  });
  return lines.join("\n");
}
