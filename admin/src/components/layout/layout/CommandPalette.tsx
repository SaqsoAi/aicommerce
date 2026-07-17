"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { searchAdminNavigation } from "./navigation.helpers";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    return searchAdminNavigation(query).slice(0, 12);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        aria-label="Close command palette"
      />

      <div className="relative mx-auto mt-16 max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-[#090d16]">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search menu, products, orders, settings..."
            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close command palette"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {results.length ? (
            <div className="space-y-1">
              {results.map((item) => (
                <Link
                  key={item.id || item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
                >
                  <Sparkles className="h-4 w-4 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate">{item.label || item.name}</span>
                  <span className="hidden truncate text-xs font-semibold text-slate-400 sm:block">{item.section}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-black text-slate-900 dark:text-white">No results found</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Try products, orders, AI, settings, or dashboard.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs font-bold text-slate-400 dark:border-white/10">
          Press Esc to close · Ctrl+K to reopen
        </div>
      </div>
    </div>
  );
}