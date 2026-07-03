"use client";

import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  Upload,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminBreadcrumb } from "./navigation.helpers";

type TopbarProps = {
  onMenuClick: () => void;
  onCollapseClick: () => void;
  onCommandClick?: () => void;
  collapsed?: boolean;
};

export default function Topbar({
  onMenuClick,
  onCollapseClick,
  onCommandClick,
  collapsed = false,
}: TopbarProps) {
  const pathname = usePathname();
  const breadcrumb = getAdminBreadcrumb(pathname || "/dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  useEffect(() => {
    const stored = localStorage.getItem("admin-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";

    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";

    setTheme(next);
    localStorage.setItem("admin-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm shadow-slate-950/[0.03] backdrop-blur-xl dark:border-white/10 dark:bg-[#080b12]/90 dark:shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onCollapseClick}
            className="hidden rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50 lg:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="truncate">{breadcrumb.group}</span>
            </div>
            <h1 className="truncate text-lg font-black text-slate-950 dark:text-white">
              {breadcrumb.page}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onCommandClick}
          className="hidden min-w-[260px] max-w-md flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100 md:flex dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4 text-slate-400" />
          <span className="w-full truncate text-sm font-semibold text-slate-400">
            Search admin, orders, products...
          </span>
          <span className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-black text-slate-400 dark:border-white/10">
            Ctrl K
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50 sm:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            aria-label="Upload"
          >
            <Upload className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button type="button" onClick={logout} className="rounded-2xl border border-red-200 bg-white p-2.5 text-red-600 shadow-sm hover:bg-red-50 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-300 dark:hover:bg-red-500/10" aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
