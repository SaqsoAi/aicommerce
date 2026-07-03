"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteLandingPage,
  getLandingPages,
  publishLandingPage,
  unpublishLandingPage,
  type LandingPage,
} from "@/api/landing.api";

export default function LandingList() {
  const [items, setItems] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getLandingPages();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this landing page?")) return;
    await deleteLandingPage(id);
    await load();
  }

  async function handlePublish(id: string, published: boolean) {
    if (published) {
      await unpublishLandingPage(id);
    } else {
      await publishLandingPage(id);
    }

    await load();
  }

  if (loading) {
    return <div className="rounded-xl border p-6">Loading landing pages...</div>;
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Landing Pages</h2>
          <p className="text-sm text-neutral-500">
            Campaign connected landing pages for flash sale, Eid, brand and category campaigns.
          </p>
        </div>
        <Link
          href="/landing-builder/new/edit"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Create Landing
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-900">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Template</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="p-4 text-neutral-500" colSpan={5}>
                  No landing page found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">/landing/{item.slug}</td>
                  <td className="p-3">{item.template}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">
                      {item.isPublished ? "Published" : item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link className="rounded-lg border px-3 py-1" href={`/landing-builder/${item.id}/edit`}>
                        Edit
                      </Link>
                      <a className="rounded-lg border px-3 py-1" href={`http://localhost:3000/landing/${item.slug}`} target="_blank">
                        View
                      </a>
                      <button className="rounded-lg border px-3 py-1" onClick={() => handlePublish(item.id, item.isPublished)}>
                        {item.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button className="rounded-lg border px-3 py-1 text-red-600" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
