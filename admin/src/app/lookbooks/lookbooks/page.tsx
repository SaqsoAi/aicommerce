"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteLookbook,
  getLookbooks,
  publishLookbook,
} from "@/api/lookbooks.api";

type Lookbook = {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
};

export default function LookbooksPage() {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getLookbooks();
      setLookbooks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (item: Lookbook) => {
    await publishLookbook(item.id, !item.published);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lookbook?")) return;
    await deleteLookbook(id);
    await load();
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            Content Studio
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Lookbooks</h1>
        </div>

        <Link
          href="/lookbooks/new"
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          Create Lookbook
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : lookbooks.length === 0 ? (
        <div className="rounded-3xl border bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">No lookbooks yet</h2>
          <p className="mt-2 text-neutral-500">
            Create your first premium fashion story.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {lookbooks.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div
                className="h-64 bg-neutral-100 bg-cover bg-center"
                style={{
                  backgroundImage: item.coverImage
                    ? `url(${item.coverImage})`
                    : undefined,
                }}
              />

              <div className="space-y-4 p-5">
                <div>
                  <div className="flex gap-2 text-xs uppercase tracking-wider text-neutral-500">
                    {item.featured && <span>Featured</span>}
                    <span>{item.published ? "Published" : "Draft"}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-neutral-500">/{item.slug}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/lookbooks/${item.id}/edit?slug=${item.slug}`}
                    className="rounded-full border px-4 py-2 text-sm"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => togglePublish(item)}
                    className="rounded-full border px-4 py-2 text-sm"
                  >
                    {item.published ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => remove(item.id)}
                    className="rounded-full border px-4 py-2 text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
