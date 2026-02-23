/**
 * Registry central des modules — chaque module de l'app peut s'y enregistrer
 * pour exposer ses données à l'assistant IA contextuel.
 */

import { useEffect } from "react";
import { buildFullContext } from "./context-builder";

export interface ModuleData {
  dataframes?: Array<{ label?: string; rows: Record<string, unknown>[] }>;
  metrics?: Record<string, string | number>;
  charts?: Array<{ type?: string; label?: string; data: unknown }>;
  raw?: string;
}

export interface RegisteredModule {
  moduleId: string;
  label: string;
  tags: string[];
  getData: () => ModuleData | Promise<ModuleData>;
  description: string;
}

class ModuleRegistryImpl {
  private modules = new Map<string, RegisteredModule>();

  register(
    moduleId: string,
    config: {
      label: string;
      tags: string[];
      getData: () => ModuleData | Promise<ModuleData>;
      description: string;
    }
  ): void {
    this.modules.set(moduleId, { moduleId, ...config });
  }

  unregister(moduleId: string): void {
    this.modules.delete(moduleId);
  }

  getModulesByTags(tags: string[]): RegisteredModule[] {
    const set = new Set(tags.map((t) => t.toLowerCase()));
    return this.getAllModules().filter((m) => m.tags.some((t) => set.has(t.toLowerCase())));
  }

  getAllModules(): RegisteredModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Construit le contexte formaté pour les modules sélectionnés (par ID).
   */
  async buildContext(selectedModuleIds: string[]): Promise<{ text: string; estimatedTokens: number }> {
    const selected = selectedModuleIds
      .map((id) => this.modules.get(id))
      .filter((m): m is RegisteredModule => m != null);
    const dataList = await Promise.all(selected.map(async (m) => ({ module: m, data: await m.getData() })));
    return buildFullContext(dataList.map(({ module: m, data }) => ({ id: m.moduleId, label: m.label, description: m.description, ...data })));
  }
}

export const moduleRegistry = new ModuleRegistryImpl();

/**
 * Hook React — enregistre le module au mount, désenregistre au unmount.
 */
export function useRegisterModule(
  moduleId: string,
  config: {
    label: string;
    tags: string[];
    getData: () => ModuleData | Promise<ModuleData>;
    description: string;
  }
): void {
  useEffect(() => {
    moduleRegistry.register(moduleId, config);
    return () => moduleRegistry.unregister(moduleId);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- register once per moduleId
  }, [moduleId]);
}

export { buildFullContext };
