"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem("theme") as "light" | "dark" | null;

    const currentTheme =
      savedTheme ||
      (document.documentElement.classList.contains("dark")
        ? "dark"
        : "light");

    setTheme(currentTheme);
    document.documentElement.classList.toggle(
      "dark",
      currentTheme === "dark"
    );
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );
  };

  if (!mounted) {
    return (
      <button
        className="
        p-2
        rounded-xl
        border
        border-zinc-200
        dark:border-zinc-800
        w-10
        h-10
      "
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="
      p-2
      rounded-xl
      border
      border-zinc-200
      dark:border-zinc-800
      hover:bg-zinc-100
      dark:hover:bg-zinc-800
    "
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}