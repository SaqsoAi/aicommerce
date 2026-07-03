"use client";

import {
  useState,
} from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  globalSearch,
} from "@/services/search.service";

import SearchResults from "@/components/search/SearchResults";
import QuickActions from "@/components/quick-actions/QuickActions";
import RecentSearches from "@/components/search/RecentSearches";

import {
  useSearchStore,
} from "@/store/search.store";

export default function SearchPage() {
  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<any>(null);

  const { addRecent } =
    useSearchStore();

  const handleSearch =
    async () => {
      const res =
        await globalSearch(
          query
        );

      setResults(
        res.data
      );

      addRecent(query);
    };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            Search Center
          </h1>

          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              className="
              flex-1
              border
              rounded-xl
              p-3
            "
              placeholder="Search..."
            />

            <button
              onClick={
                handleSearch
              }
              className="
              px-6
              rounded-xl
              bg-black
              text-white
            "
            >
              Search
            </button>
          </div>

          <div
            className="
            grid
            lg:grid-cols-4
            gap-6
          "
          >
            <div className="lg:col-span-3">
              <SearchResults
                results={results}
              />
            </div>

            <div className="space-y-6">
              <RecentSearches />

              <QuickActions />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
