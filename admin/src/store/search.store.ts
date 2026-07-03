import { create } from "zustand";

interface SearchState {
  recent: string[];

  addRecent: (
    query: string
  ) => void;
}

export const useSearchStore =
  create<SearchState>(
    (set) => ({
      recent: [],

      addRecent: (
        query
      ) =>
        set((state) => ({
          recent: [
            query,
            ...state.recent.filter(
              (x) =>
                x !== query
            ),
          ].slice(0, 10),
        })),
    })
  );
