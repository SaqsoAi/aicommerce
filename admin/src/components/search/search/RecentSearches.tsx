"use client";

import {
  useSearchStore,
} from "@/store/search.store";

export default function RecentSearches() {
  const { recent } =
    useSearchStore();

  return (
    <div
      className="
      border
      border-zinc-200
      dark:border-zinc-800
      rounded-3xl
      p-6
      bg-white
      dark:bg-zinc-900
    "
    >
      <h3
        className="
        font-bold
        text-xl
        mb-4
      "
      >
        Recent Searches
      </h3>

      <div className="space-y-2">
        {recent.map(
          (item) => (
            <div
              key={item}
              className="
              text-sm
              text-zinc-500
            "
            >
              {item}
            </div>
          )
        )}
      </div>
    </div>
  );
}
