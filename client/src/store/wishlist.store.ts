import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: any[];
  setItems: (items: any[]) => void;
  addItem: (item: any) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: any) => void;
  clear: () => void;
}

export const useWishlistStore =
  create<WishlistState>()(
    persist(
      (set) => ({
        items: [],
        setItems: (items) => set({ items: Array.isArray(items) ? items : [] }),
        addItem: (item) => set((state) => ({
          items: state.items.some((entry) => String(entry?.id) === String(item?.id))
            ? state.items
            : [...state.items, item],
        })),
        removeItem: (id) => set((state) => ({
          items: state.items.filter((entry) => String(entry?.id) !== String(id)),
        })),
        toggleItem: (item) => set((state) => ({
          items: state.items.some((entry) => String(entry?.id) === String(item?.id))
            ? state.items.filter((entry) => String(entry?.id) !== String(item?.id))
            : [...state.items, item],
        })),
        clear: () => set({ items: [] }),
      }),
      { name: "ai-commerce-wishlist" },
    ),
  );
