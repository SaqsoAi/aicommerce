"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMySavedLooks, removeSavedLook } from "@/api/saved-looks.api";
import { SaqsoCard } from "@/components/saqso";

type SavedLook = {
  id: string;
  lookbookId: string;
  createdAt: string;
  lookbook: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    coverImage?: string;
    items?: {
      id: string;
      image: string;
      title?: string;
    }[];
  };
};

export default function SavedLooksPreview() {
  const [items, setItems] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getMySavedLooks();
      setItems(data);
    } catch (error) {
      console.error("Saved looks load failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (lookbookId: string) => {
    try {
      await removeSavedLook(lookbookId);
      await load();
    } catch (error) {
      console.error("Remove saved look failed", error);
      alert("Failed to remove saved look");
    }
  };

  return (
    <SaqsoCard>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Style Memory
          </p>

          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
            Saved Looks
          </h2>
        </div>

        <Link
          href="/lookbook"
          className="rounded-full border px-4 py-2 text-sm font-bold text-zinc-950 dark:border-zinc-700 dark:text-white"
        >
          Browse Lookbook
        </Link>
      </div>

      {loading ? (
        <p className="text-zinc-500">
          Loading saved looks...
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-6 text-center dark:border-zinc-800">
          <p className="font-bold text-zinc-950 dark:text-white">
            No saved looks yet
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Save premium lookbook styles and revisit them from your dashboard.
          </p>

          <Link
            href="/lookbook"
            className="mt-4 inline-flex rounded-full bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black"
          >
            Explore Lookbooks
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div
                className="h-52 bg-zinc-100 bg-cover bg-center dark:bg-zinc-900"
                style={{
                  backgroundImage: item.lookbook?.coverImage
                    ? `url(${item.lookbook.coverImage})`
                    : undefined,
                }}
              />

              <div className="space-y-4 p-4">
                <div>
                  <h3 className="font-black text-zinc-950 dark:text-white">
                    {item.lookbook?.title || "Saved Look"}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Saved {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/lookbook/${item.lookbook?.slug}`}
                    className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-black"
                  >
                    View Look
                  </Link>

                  <Link
                    href="/shop"
                    className="rounded-full border px-4 py-2 text-xs font-bold dark:border-zinc-700"
                  >
                    Shop The Look
                  </Link>

                  <Link
                    href="/size-fit-center"
                    className="rounded-full border px-4 py-2 text-xs font-bold dark:border-zinc-700"
                  >
                    Virtual Try-On
                  </Link>

                  <button
                    type="button"
                    onClick={() => remove(item.lookbookId)}
                    className="rounded-full border px-4 py-2 text-xs font-bold text-red-600 dark:border-zinc-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SaqsoCard>
  );
}

