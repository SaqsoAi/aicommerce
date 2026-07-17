"use client";

import { useEffect, useState } from "react";

export function SaqsoThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("saqso-theme");
    const initial = stored === "dark" || stored === "light" ? stored : (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem("saqso-theme", next);
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button type="button" className="saqso-theme-toggle" onClick={toggleTheme} aria-label="Toggle light and dark mode">
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}