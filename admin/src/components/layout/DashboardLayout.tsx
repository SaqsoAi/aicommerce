"use client";

import { createContext, useContext, useEffect, useState } from "react";
import CommandPalette from "./CommandPalette";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const ShellContext = createContext(false);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const inside = useContext(ShellContext);
  if (inside) return <>{children}</>;

  return (
    <ShellContext.Provider value={true}>
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
    </ShellContext.Provider>
  );
}

function DashboardLayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("admin-sidebar-collapsed") === "true");
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }, []);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <div className={`ds-shell ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} />
      <main className="ds-content">
        <Topbar onToggleSidebar={toggleSidebar} />
        <div className="ds-page">{children}</div>
      </main>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}