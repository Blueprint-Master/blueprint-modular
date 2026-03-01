"use client";

import { useEffect, useId } from "react";
import { bpmComponentRegistry } from "./component-registry";
import type { BPMComponentContext } from "./types";

/**
 * Hook opt-in — enregistre un composant dans le registry IA.
 * Appeler avec trackContext={true} depuis les composants bpm.*.
 */
export function useBPMContext(
  ctx: Omit<BPMComponentContext, "id">,
  enabled = true
): void {
  const autoId = useId();
  const id = `bpm-${ctx.type}-${autoId}`;

  useEffect(() => {
    if (!enabled) return;
    bpmComponentRegistry.register({ id, ...ctx });
    return () => bpmComponentRegistry.unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enabled]);

  // Mise à jour des valeurs dynamiques sans remount
  useEffect(() => {
    if (!enabled) return;
    bpmComponentRegistry.update(id, ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.value, ctx.label, JSON.stringify(ctx.data)]);
}

/**
 * Définit le module et le titre de la page courante.
 * À appeler dans le layout ou la page.
 */
export function useBPMPage(module: string, pageTitle?: string): void {
  useEffect(() => {
    bpmComponentRegistry.setModule(module, pageTitle);
  }, [module, pageTitle]);
}
