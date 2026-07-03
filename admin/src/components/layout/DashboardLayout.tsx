"use client";

import { createContext, useContext, useEffect, useState } from "react";
import CommandPalette from "./CommandPalette";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AdminShellContext = createContext(false);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const insideShell = useContext(AdminShellContext);

  if (insideShell) {
    return <>{children}</>;
  }

  return (
    <AdminShellContext.Provider value={true}>
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
    </AdminShellContext.Provider>
  );
}

function DashboardLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    setCollapsed(stored === "true");
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || commandOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, commandOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  }

  const shellPadding = collapsed ? "lg:pl-[88px]" : "lg:pl-[304px]";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#05070d] dark:text-white">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      <div
        className={[
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
        <Sidebar collapsed={collapsed} />
      </aside>

      <section className={["min-h-screen transition-[padding] duration-300", shellPadding].join(" ")}>
        <div className="min-h-screen border-l border-slate-700/40 bg-slate-50 dark:border-white/10 dark:bg-[#05070d]">
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
            onCollapseClick={toggleCollapsed}
            onCommandClick={() => setCommandOpen(true)}
            collapsed={collapsed}
          />

          <main className="w-full px-5 py-5 sm:px-6 sm:py-6 lg:px-6">
            {children}
          </main>
        </div>
      </section>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}