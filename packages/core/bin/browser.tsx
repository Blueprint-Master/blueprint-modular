import React from "react";
import { createRoot } from "react-dom/client";
import { artifactSpec } from "../../../lib/artifact/contract";
import { describeArtifact } from "../../../lib/artifact/context";
import { Dashboard } from "./Dashboard";
import css from "./standalone.css";

/** Both embedded input and connector results use the same contract and view. */
export function mount(container: HTMLElement, input: unknown) {
  let spec = artifactSpec.parse(input);
  const doc = container.ownerDocument;
  if (!doc.querySelector("style[data-bpm-artifact]")) {
    const style = doc.createElement("style");
    style.setAttribute("data-bpm-artifact", "");
    style.textContent = css;
    doc.head.appendChild(style);
  }
  const root = createRoot(container);
  let revision = 0;
  let mounted = true;
  function update(input: unknown) {
    if (!mounted) throw new Error("Artifact unmounted");
    const next = artifactSpec.parse(input);
    revision++;
    spec = next;
    root.render(<Dashboard {...spec}/>);
  }
  root.render(<Dashboard {...spec}/>);
  return {
    update,
    context: () => describeArtifact(spec),
    async refresh(load: () => Promise<unknown>) {
      if (!mounted) throw new Error("Artifact unmounted");
      const requested = ++revision;
      const input = await load();
      if (requested !== revision || !mounted) return false;
      update(input);
      return true;
    },
    unmount() {
      if (mounted) root.unmount();
      mounted = false;
      revision++;
    },
  };
}
