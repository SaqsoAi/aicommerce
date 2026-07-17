"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-5 right-5 z-[9999] flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
