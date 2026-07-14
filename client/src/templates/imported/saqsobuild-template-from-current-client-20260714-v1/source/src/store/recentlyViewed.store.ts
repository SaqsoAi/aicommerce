import { create } from "zustand";

interface RecentState {
  products: any[];

  addProduct: (
    product: any
  ) => void;

  clearProducts: () => void;
}

export const useRecentlyViewedStore =
  create<RecentState>(
    (set, get) => ({
      products: [],

      addProduct: (
        product
      ) => {
        const existing =
          get().products.filter(
            (p) =>
              p.id !==
              product.id
          );

        set({
          products: [
            product,
            ...existing,
          ].slice(0, 12),
        });
      },

      clearProducts: () =>
        set({
          products: [],
        }),
    })
  );