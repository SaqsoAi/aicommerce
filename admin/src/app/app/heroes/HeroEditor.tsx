"use client";

import { useState } from "react";
import Link from "next/link";

import type { Hero } from "./types";

type Props = {
  hero: Hero;
  onRefresh: () => void;
};

export default function HeroEditor({
  hero,
  onRefresh,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  // ================= DELETE HERO =================

  const handleDelete = async () => {
    try {
      if (!API_URL) {
        throw new Error(
          "API URL missing"
        );
      }

      const confirmed =
        window.confirm(
          `Delete "${hero.title}" ?`
        );

      if (!confirmed) {
        return;
      }

      setLoading(true);

      const res = await fetch(
        `${API_URL}/heroes/${hero.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to delete hero"
        );
      }

      onRefresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unknown error";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE ACTIVE =================

  const handleToggle = async () => {
    try {
      if (!API_URL) {
        throw new Error(
          "API URL missing"
        );
      }

      setLoading(true);

      const res = await fetch(
        `${API_URL}/heroes/${hero.id}/toggle`,
        {
          method: "PATCH",
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Toggle failed"
        );
      }

      onRefresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unknown error";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      {/* HEADER */}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            {hero.title}
          </h3>

          <p className="text-sm text-gray-500">
            {hero.type}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            hero.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {hero.active
            ? "Active"
            : "Inactive"}
        </span>
      </div>

      {/* ACTIONS */}

      <div className="flex gap-2 mt-5">
        <Link
          href={`/heroes/${hero.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit
        </Link>

        <button
          onClick={handleToggle}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {hero.active
            ? "Deactivate"
            : "Activate"}
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : "Delete"}
        </button>
      </div>
    </div>
  );
}