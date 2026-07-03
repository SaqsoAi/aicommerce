import { create } from "zustand";

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;

  toggleSidebar: () => void;
  toggleMobile: () => void;
}

export const useSidebarStore =
  create<SidebarState>((set) => ({
    collapsed: false,
    mobileOpen: false,

    toggleSidebar: () =>
      set((state) => ({
        collapsed: !state.collapsed,
      })),

    toggleMobile: () =>
      set((state) => ({
        mobileOpen: !state.mobileOpen,
      })),
  }));