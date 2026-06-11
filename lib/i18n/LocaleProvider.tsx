"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import fr from "./fr";
import en from "./en";
import { LOCALE_COOKIE, type Dictionary, type Locale } from "./index";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "fr",
  dict: fr,
  setLocale: () => {},
});

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      document.documentElement.lang = next;
      setLocaleState(next);
      // Re-rend les server components (pages docs) avec la nouvelle locale.
      router.refresh();
    },
    [router]
  );

  const value = useMemo(
    () => ({ locale, dict: locale === "en" ? en : fr, setLocale }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): LocaleContextValue {
  return useContext(LocaleContext);
}
