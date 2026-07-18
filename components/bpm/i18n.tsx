"use client";

import React, { createContext, useContext } from "react";

/**
 * i18n interne des composants bpm.* — fournit UNIQUEMENT la locale courante
 * ("fr" | "en"). Chaque composant porte son propre dictionnaire local
 * `{ fr, en }` et lit la locale via `useBpmLocale()`.
 *
 * Hors de tout `BpmI18nProvider`, la valeur par défaut est "fr" : les
 * composants restent donc rétro-compatibles (rendu français à l'octet) tant
 * que l'hôte n'a pas monté le provider. L'app Blueprint Modular monte le
 * provider en le branchant sur sa propre locale (cf. `BpmLocaleBridge`).
 */
export type BpmLocale = "fr" | "en";

const BpmI18nContext = createContext<BpmLocale>("fr");

export function BpmI18nProvider({
  locale,
  children,
}: {
  locale: BpmLocale;
  children: React.ReactNode;
}) {
  return (
    <BpmI18nContext.Provider value={locale}>{children}</BpmI18nContext.Provider>
  );
}

/** Locale courante des composants bpm.* (défaut "fr" hors provider). */
export function useBpmLocale(): BpmLocale {
  return useContext(BpmI18nContext);
}
