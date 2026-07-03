import { create } from "zustand";

interface WishlistState {
  items: any[];

  setItems: (
    items: any[]
  ) => void;
}

export const useWishlistStore =
  create<WishlistState>(
    (set) => ({
      items: [],

      setItems: (
        items
      ) =>
        set({
          items,
        }),
    })
  );