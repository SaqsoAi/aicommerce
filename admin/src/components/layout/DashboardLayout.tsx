"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { usePathname } from "next/navigation";
import CommandPalette from "./CommandPalette";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const ShellContext = createContext(false);
const DESKTOP_BREAKPOINT = "(min-width: 981px)";
const STORAGE_KEY = "admin-sidebar-collapsed";
const WIDTH_STORAGE_KEY = "admin-sidebar-width";
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 320;

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
  const [sidebarWidth, setSidebarWidth] = useState(214);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    const savedWidth = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
    if (Number.isFinite(savedWidth) && savedWidth >= MIN_SIDEBAR_WIDTH && savedWidth <= MAX_SIDEBAR_WIDTH) {
      setSidebarWidth(savedWidth);
    }
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function applySidebarGeometry(width: number) {
    const shell = shellRef.current;
    if (!shell) return;
    const widthValue = `${width}px`;
    shell.style.setProperty("--sidebar-width", widthValue, "important");
    shell.querySelector<HTMLElement>(".ds-workspace")?.style.setProperty("grid-template-columns", `${widthValue} minmax(0, 1fr)`, "important");
    const sidebar = shell.querySelector<HTMLElement>(".ds-sidebar");
    sidebar?.style.setProperty("width", widthValue, "important");
    sidebar?.style.setProperty("min-width", widthValue, "important");
    sidebar?.style.setProperty("max-width", widthValue, "important");
    shell.querySelector<HTMLElement>(".ds-sidebar-resizer")?.style.setProperty("left", `${width - 4}px`, "important");
  }

  useLayoutEffect(() => {
    applySidebarGeometry(collapsed ? 78 : sidebarWidth);
  }, [collapsed, sidebarWidth]);
  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  function startSidebarResize(event: ReactMouseEvent<HTMLButtonElement>) {
    if (!window.matchMedia(DESKTOP_BREAKPOINT).matches) return;
    event.preventDefault();
    if (collapsed) setCollapsed(false);
    let latestWidth = sidebarWidth;

    const onMouseMove = (mouseEvent: MouseEvent) => {
      latestWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, mouseEvent.clientX));
      applySidebarGeometry(latestWidth);
      setSidebarWidth(latestWidth);
    };
    const onMouseUp = () => {
      localStorage.setItem(WIDTH_STORAGE_KEY, String(latestWidth));
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp, { once: true });
  }
  function toggleSidebar() {
    if (!window.matchMedia(DESKTOP_BREAKPOINT).matches) {
      setMobileOpen((current) => !current);
      return;
    }

    setCollapsed((current) => {
      const next = !current;
      applySidebarGeometry(next ? 78 : sidebarWidth);
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div
      ref={shellRef}
      className={["ds-shell", collapsed ? "collapsed" : "", mobileOpen ? "mobile-open" : ""]
        .filter(Boolean)
        .join(" ")}
      data-sidebar-state={collapsed ? "collapsed" : "expanded"}
      style={{ "--sidebar-width": `${collapsed ? 78 : sidebarWidth}px` } as CSSProperties}
    >
      <Topbar
        onToggleSidebar={toggleSidebar}
        sidebarExpanded={mobileOpen || !collapsed}
      />

      <div className="ds-workspace">
        <Sidebar collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        <button
          type="button"
          className="ds-sidebar-resizer"
          aria-label="Resize sidebar"
          onMouseDown={startSidebarResize}
        />

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



