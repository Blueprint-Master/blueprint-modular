"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  /** true quand le composant est rendu sous ThemeProvider */
  hasProvider: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Planothèque : nuit de Prusse par défaut, papier de Prusse en clair.
  const themeColorHex = theme === "dark" ? "#0a1626" : "#f3f6fa";

  useEffect(() => {
    const stored = localStorage.getItem("bpm-theme") as Theme | null;
    const value = stored === "dark" || stored === "light" ? stored : "dark";
    setTheme(value);
    document.documentElement.setAttribute("data-theme", value);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", themeColorHex);
  }, [mounted, themeColorHex]);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (mounted) {
      localStorage.setItem("bpm-theme", next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, hasProvider: true }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark" as Theme,
      toggleTheme: () => {},
      hasProvider: false,
    };
  }
  return ctx;
}
