"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type AIHeaderContextValue = {
  historyOpen: boolean;
  setHistoryOpen: (v: boolean) => void;
  newDiscussionTrigger: number;
  triggerNewDiscussion: () => void;
};

const AIHeaderContext = createContext<AIHeaderContextValue | null>(null);

export function AIHeaderProvider({ children }: { children: React.ReactNode }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newDiscussionTrigger, setNewDiscussionTrigger] = useState(0);
  const triggerNewDiscussion = useCallback(() => {
    setNewDiscussionTrigger((t) => t + 1);
  }, []);
  const value: AIHeaderContextValue = {
    historyOpen,
    setHistoryOpen,
    newDiscussionTrigger,
    triggerNewDiscussion,
  };
  return <AIHeaderContext.Provider value={value}>{children}</AIHeaderContext.Provider>;
}

export function useAIHeader() {
  return useContext(AIHeaderContext);
}
