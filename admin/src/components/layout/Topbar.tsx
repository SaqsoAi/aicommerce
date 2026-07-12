"use client";

import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type UserSession = { name?: string; email?: string; role?: string };

function readUser(): UserSession {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("user");
    if (raw) return JSON.parse(raw) as UserSession;
  } catch {}
  return {
    name: localStorage.getItem("name") || undefined,
    email: localStorage.getItem("email") || undefined,
    role: localStorage.getItem("role") || localStorage.getItem("userRole") || undefined,
  };
}

function normalizeRole(role?: string) {
  const r = String(role || "MANAGER").toUpperCase();
  if (r === "SUPER_ADMIN") return "Super Admin";
  if (r === "ADMIN") return "Admin";
  if (r === "USER_ADMIN") return "User Admin";
  return "Manager";
}

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] || "U") + (words[1]?.[0] || "A")).toUpperCase();
}

export default function Topbar({ onToggleSidebar, sidebarExpanded = false }: { onToggleSidebar?: () => void; sidebarExpanded?: boolean }) {
  const [user, setUser] = useState<UserSession>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [setup, setSetup] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    localStorage.setItem("admin-theme", "dark");

    const refreshUser = () => setUser(readUser());
    refreshUser();
    window.addEventListener("storage", refreshUser);
    window.addEventListener("auth:changed", refreshUser);
    window.addEventListener("role:changed", refreshUser);
    window.addEventListener("focus", refreshUser);
    return () => {
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener("auth:changed", refreshUser);
      window.removeEventListener("role:changed", refreshUser);
      window.removeEventListener("focus", refreshUser);
    };
  }, []);

  const name = useMemo(() => user.name || user.email || "Signed-in User", [user.name, user.email]);
  const role = useMemo(() => normalizeRole(user.role), [user.role]);
  const isSuperAdmin = role === "Super Admin";

  function go(path: string) {
    window.location.href = path;
  }

  function signOut() {
    ["token", "accessToken", "refreshToken", "adminToken", "admin_token", "authToken", "user", "role", "userRole", "permissions"].forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
    window.location.href = "/login";
  }

  return (
    <header className="ds-topbar">
      <div className="ds-topbar-left">
        <button type="button" className="ds-square ds-sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar" aria-controls="admin-primary-navigation" aria-expanded={sidebarExpanded}>
          <Menu size={21} aria-hidden="true" />
        </button>
        <div className={`ds-topbar-brand ${isSuperAdmin ? "super" : role === "Admin" ? "admin" : "manager"}`}>
          <i>AI</i>
          <span>
            <strong>{isSuperAdmin ? "AICopilot" : "AI-Commerce"}</strong>
            <small>{isSuperAdmin ? "Super Admin - AI Development Copilot" : role === "Admin" ? "Admin Dashboard" : "User Admin Dashboard"}</small>
          </span>
        </div>
      </div>

      <button type="button" className="ds-search" onClick={() => setSetup("Command palette needs a searchable route registry for live activation.")}>
        <Search size={18} />
        <span>Search anything in project...</span>
        <kbd>Ctrl /</kbd>
      </button>

      <div className="ds-actions">
        <button type="button" className="ds-square" onClick={() => go("/notifications")} aria-label="Notifications">
          <Bell size={19} />
        </button>
        <button type="button" className="ds-square" onClick={() => go("/settings")} aria-label="Settings">
          <Settings size={19} />
        </button>
        <button type="button" className="ds-square" onClick={() => setSetup("Create /help route or docs center, then connect this button.")} aria-label="Help">
          <HelpCircle size={19} />
        </button>
        <button type="button" className="ds-square" onClick={() => setSetup("Dark dashboard lock active. Build a separate tested light theme before enabling toggle.")} aria-label="Theme">
          <Moon size={19} />
        </button>
        <button type="button" className="ds-square" onClick={() => go("/ai-control-center")} aria-label="Controls">
          <SlidersHorizontal size={19} />
        </button>

        <div className="ds-profile">
          <button type="button" onClick={() => setProfileOpen((v) => !v)}>
            <i>{initials(name)}</i>
            <span>
              <strong>{name}</strong>
              <small>{role}</small>
            </span>
            <ChevronDown size={16} />
          </button>
          {profileOpen ? (
            <div className="ds-profile-menu">
              <button type="button" onClick={() => go("/settings")}>Profile settings</button>
              <button type="button" onClick={() => go("/permissions")}>View permissions</button>
              <button type="button" className="danger" onClick={signOut}><LogOut size={16} /> Sign out</button>
            </div>
          ) : null}
        </div>
      </div>

      {setup ? (
        <div className="ds-modal-overlay">
          <div className="ds-modal">
            <button className="ds-modal-close" onClick={() => setSetup(null)}><X size={18} /></button>
            <p>Setup Required</p>
            <h2>Action not active yet</h2>
            <span>{setup}</span>
            <button type="button" onClick={() => setSetup(null)}>Got it</button>
          </div>
        </div>
      ) : null}
    </header>
  );
}



