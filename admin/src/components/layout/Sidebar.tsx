"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  BadgeDollarSign,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  CreditCard,
  Crown,
  Factory,
  FileSearch,
  FileStack,
  FolderOpen,
  Heart,
  Image,
  Images,
  KeyRound,
  Layers3,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  ListTodo,
  ListTree,
  LockKeyhole,
  Megaphone,
  MessageSquareText,
  Network,
  Package,
  PanelTop,
  PanelsTopLeft,
  Receipt,
  RotateCcw,
  Ruler,
  Search,
  Settings,
  Settings2,
  Shield,
  ShieldCheck,
  Shirt,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tags,
  TicketPercent,
  ToggleLeft,
  Truck,
  UploadCloud,
  UserCog,
  Users,
  Wand2,
  Warehouse,
  Workflow,
  X,
} from "lucide-react";
import { filterAdminNavigationByRole, isAdminNavActive } from "./navigation.helpers";

const iconMap = {
  Activity,
  BadgeCheck,
  BadgeDollarSign,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  CreditCard,
  Crown,
  Factory,
  FileSearch,
  FileStack,
  FolderOpen,
  Heart,
  Image,
  Images,
  KeyRound,
  Layers3,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  ListTodo,
  ListTree,
  LockKeyhole,
  Megaphone,
  MessageSquareText,
  Network,
  Package,
  PanelTop,
  PanelsTopLeft,
  Receipt,
  RotateCcw,
  Ruler,
  Search,
  Settings,
  Settings2,
  Shield,
  ShieldCheck,
  Shirt,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tags,
  TicketPercent,
  ToggleLeft,
  Truck,
  UploadCloud,
  UserCog,
  Users,
  Wand2,
  Warehouse,
  Workflow,
};

type SidebarProps = {
  onClose?: () => void;
  collapsed?: boolean;
};

function IconByName({ name, className }: { name?: string; className?: string }) {
  const Icon = iconMap[(name || "LayoutDashboard") as keyof typeof iconMap] || LayoutDashboard;
  return <Icon className={className} />;
}

function getStoredRole() {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem("adminUser") ||
      localStorage.getItem("user") ||
      localStorage.getItem("authUser");

    if (!raw) return localStorage.getItem("role");

    const parsed = JSON.parse(raw);
    return parsed?.role || parsed?.user?.role || localStorage.getItem("role");
  } catch {
    return localStorage.getItem("role");
  }
}

function getInitialOpenGroups(groups: ReturnType<typeof filterAdminNavigationByRole>, pathname: string) {
  const active = groups
    .filter((group) => group.items.some((item) => isAdminNavActive(pathname || "", item.href)))
    .map((group) => group.id || group.name);

  if (typeof window === "undefined") return new Set(active);

  try {
    const stored = localStorage.getItem("admin-sidebar-open-groups");
    if (!stored) return new Set(active);
    return new Set([...JSON.parse(stored), ...active]);
  } catch {
    return new Set(active);
  }
}

export default function Sidebar({ onClose, collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const role = getStoredRole();
  const groups = useMemo(() => filterAdminNavigationByRole(role), [role]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOpenGroups(getInitialOpenGroups(groups, pathname || "/dashboard"));
  }, [groups, pathname]);

  function toggleGroup(groupId: string) {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }

      localStorage.setItem("admin-sidebar-open-groups", JSON.stringify(Array.from(next)));
      return next;
    });
  }

  return (
    <aside
      className={[
        "flex h-full flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-950 shadow-xl shadow-slate-950/5 transition-all duration-300 dark:border-white/10 dark:bg-[#080b12] dark:text-white dark:shadow-black/30",
        collapsed ? "w-[88px]" : "w-[304px]",
      ].join(" ")}
    >
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-white/10">
        <Link href="/dashboard" onClick={onClose} className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Sparkles className="h-5 w-5" />
          </span>

          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-[0.28em]">AI COMMERCE</span>
              <span className="block truncate text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Enterprise Admin
              </span>
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="border-b border-slate-200 p-4 dark:border-white/10">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              aria-label="Search admin menu"
              placeholder="Search menu..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
        <div className="space-y-2">
          {groups.map((group) => {
            const groupId = group.id || group.name;
            const activeGroup = group.items.some((item) => isAdminNavActive(pathname || "", item.href));
            const isOpen = collapsed || activeGroup || openGroups.has(groupId);

            return (
              <section key={groupId} className="rounded-3xl">
                {collapsed ? (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isAdminNavActive(pathname || "", item.href);

                      return (
                        <Link
                          key={item.id || item.href}
                          href={item.href}
                          onClick={onClose}
                          title={item.label || item.name}
                          className={[
                            "group flex items-center justify-center rounded-2xl px-3 py-2.5 text-sm font-bold transition",
                            active
                              ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950 dark:shadow-white/10"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white",
                          ].join(" ")}
                        >
                          <IconByName
                            name={item.icon}
                            className={[
                              "h-4 w-4 shrink-0",
                              active ? "text-current" : "text-slate-400 group-hover:text-current dark:text-slate-500",
                            ].join(" ")}
                          />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupId)}
                      className={[
                        "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                        activeGroup
                          ? "bg-slate-100 text-slate-950 dark:bg-white/[0.08] dark:text-white"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
                      ].join(" ")}
                      aria-expanded={isOpen}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <IconByName name={group.icon} className="h-4 w-4 shrink-0" />
                        <span className="truncate text-[11px] font-black uppercase tracking-[0.2em]">
                          {group.label || group.name}
                        </span>
                      </span>

                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
                      )}
                    </button>

                    <div
                      className={[
                        "grid transition-all duration-300",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-1 space-y-1 pb-2">
                          {group.items.map((item) => {
                            const active = isAdminNavActive(pathname || "", item.href);

                            return (
                              <Link
                                key={item.id || item.href}
                                href={item.href}
                                onClick={onClose}
                                className={[
                                  "group ml-2 flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition",
                                  active
                                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950 dark:shadow-white/10"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white",
                                ].join(" ")}
                              >
                                <span className="flex min-w-0 items-center gap-3">
                                  <IconByName
                                    name={item.icon}
                                    className={[
                                      "h-4 w-4 shrink-0",
                                      active ? "text-current" : "text-slate-400 group-hover:text-current dark:text-slate-500",
                                    ].join(" ")}
                                  />
                                  <span className="truncate">{item.label || item.name}</span>
                                </span>

                                {item.badge && (
                                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-300">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
      </nav>

      {!collapsed && (
        <div className="shrink-0 border-t border-slate-200 p-4 dark:border-white/10">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Shell 3.0C.2
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
              Drawer Groups Active
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}