"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CommandPalette from "./CommandPalette";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const ShellContext = createContext(false);
const DESKTOP_BREAKPOINT = "(min-width: 981px)";
const STORAGE_KEY = "admin-sidebar-collapsed";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const inside = useContext(ShellContext);
  if (inside) return <>{children}</>;

  return (
    <ShellContext.Provider value>
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
    </ShellContext.Provider>
  );
}

function DashboardLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  function toggleSidebar() {
    if (!window.matchMedia(DESKTOP_BREAKPOINT).matches) {
      setMobileOpen((current) => !current);
      return;
    }

    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div
      className={["ds-shell", collapsed ? "collapsed" : "", mobileOpen ? "mobile-open" : ""]
        .filter(Boolean)
        .join(" ")}
      data-sidebar-state={collapsed ? "collapsed" : "expanded"}
    >
      <Topbar
        onToggleSidebar={toggleSidebar}
        sidebarExpanded={mobileOpen || !collapsed}
      />

      <div className="ds-workspace">
        <Sidebar collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />

        {mobileOpen ? (
          <button
            type="button"
            className="ds-sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <main className="ds-content" id="admin-dashboard-content">
          <div className="ds-page">{children}</div>
        </main>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
