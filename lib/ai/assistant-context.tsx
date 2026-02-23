"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type AssistantContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  extraContext: string | null;
  /** Ouvre l'assistant avec un contexte optionnel (ex. résumé d'un contrat). */
  openAssistant: (context?: string) => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [extraContext, setExtraContext] = useState<string | null>(null);

  const openAssistant = useCallback((context?: string) => {
    setExtraContext(context ?? null);
    setOpen(true);
  }, []);

  const handleSetOpen = useCallback((v: boolean) => {
    setOpen(v);
    if (!v) setExtraContext(null);
  }, []);

  return (
    <AssistantContext.Provider
      value={{
        open,
        setOpen: handleSetOpen,
        extraContext,
        openAssistant,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  return ctx;
}
