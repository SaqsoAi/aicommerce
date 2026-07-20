"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

const API = "/api";
const THEME_KEY = "saqso-theme-mode";

function applyTheme(theme: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = theme;
  document.documentElement.style.colorScheme = resolved;

  return resolved;
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

async function fetchAdminDefaultTheme(): Promise<ThemeMode> {
  try {
    const res = await fetch(`${API}/enterprise-settings`, { cache: "no-store" });
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const found = list.find((x: any) => {
      const k = normalizeKey(String(x.key || x.name || x.label || x.id || ""));
      return k === "defaulttheme" || k === "theme" || k === "sitetheme";
    });
    const value = String(found?.value || "").toLowerCase();
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {}
  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    let alive = true;

    async function boot() {
      const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem("theme");
      const saved: ThemeMode | null = stored === "light" || stored === "dark" || stored === "system" ? stored : null;
      const adminDefault = await fetchAdminDefaultTheme();
      const next = saved || adminDefault || "system";

      if (!alive) return;

      setThemeState(next);
      setResolvedTheme(applyTheme(next));
      window.dispatchEvent(new CustomEvent("saqso-theme-change", { detail: { mode: next } }));
    }

    boot();

    const listener = () => {
      const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem("theme") || "system";
      const mode: ThemeMode = stored === "light" || stored === "dark" ? stored : "system";
      if (mode === "system") setResolvedTheme(applyTheme(mode));
    };

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", listener);

    return () => {
      alive = false;
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", listener);
    };
  }, []);

  const setTheme = (next: ThemeMode) => {
    localStorage.setItem(THEME_KEY, next);
    localStorage.setItem("theme", next);
    setThemeState(next);
    setResolvedTheme(applyTheme(next));
    window.dispatchEvent(new CustomEvent("saqso-theme-change", { detail: { mode: next } }));
  };

  const toggleTheme = () => {
  setTheme(resolvedTheme === "dark" ? "light" : "dark");
};
const value = useMemo(() => ({
  theme,
  resolvedTheme,
  setTheme,
  toggleTheme,
}), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;




