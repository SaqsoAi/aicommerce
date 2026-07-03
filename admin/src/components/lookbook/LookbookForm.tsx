"use client";

import { useMemo, useState } from "react";
import {
  createLookbook,
  LookbookItem,
  LookbookPayload,
  updateLookbook,
} from "@/api/lookbooks.api";

type Props = {
  mode: "create" | "edit";
  initialData?: Partial<LookbookPayload> & { id?: string };
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function LookbookForm({ mode, initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [published, setPublished] = useState(Boolean(initialData?.published));
  const [items, setItems] = useState<LookbookItem[]>(
    initialData?.items?.length
      ? initialData.items
      : [
          {
            image: "",
            title: "",
            caption: "",
            sortOrder: 0,
            products: [],
          },
        ]
  );
  const [loading, setLoading] = useState(false);

  const payload = useMemo<LookbookPayload>(
    () => ({
      title,
      slug,
      description,
      coverImage,
      featured,
      published,
      items,
    }),
    [title, slug, description, coverImage, featured, published, items]
  );

  const updateItem = (index: number, key: keyof LookbookItem, value: any) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        image: "",
        title: "",
        caption: "",
        sortOrder: prev.length,
        products: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const save = async () => {
    try {
      setLoading(true);

      if (mode === "edit" && initialData?.id) {
        await updateLookbook(initialData.id, payload);
      } else {
        await createLookbook(payload);
      }

      window.location.href = "/lookbooks";
    } catch (error) {
      console.error(error);
      alert("Failed to save lookbook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
          SAQSO LOOKBOOK
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {mode === "edit" ? "Edit Lookbook" : "Create Lookbook"}
        </h1>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Title</span>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!slug) setSlug(slugify(event.target.value));
              }}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Slug</span>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              className="min-h-28 w-full rounded-xl border px-4 py-3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Cover Image URL</span>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5 flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
            />
            Featured
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            Published
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Look #{index + 1}</h2>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-full border px-4 py-2 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">Image URL</span>
                <input
                  className="w-full rounded-xl border px-4 py-3"
                  value={item.image}
                  onChange={(event) =>
                    updateItem(index, "image", event.target.value)
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Title</span>
                <input
                  className="w-full rounded-xl border px-4 py-3"
                  value={item.title ?? ""}
                  onChange={(event) =>
                    updateItem(index, "title", event.target.value)
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Sort Order</span>
                <input
                  type="number"
                  className="w-full rounded-xl border px-4 py-3"
                  value={item.sortOrder ?? index}
                  onChange={(event) =>
                    updateItem(index, "sortOrder", Number(event.target.value))
                  }
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">Caption</span>
                <textarea
                  className="min-h-20 w-full rounded-xl border px-4 py-3"
                  value={item.caption ?? ""}
                  onChange={(event) =>
                    updateItem(index, "caption", event.target.value)
                  }
                />
              </label>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="rounded-full border px-5 py-3 text-sm font-medium"
        >
          Add Look
        </button>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={save}
        className="rounded-full bg-black px-8 py-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Lookbook"}
      </button>
    </div>
  );
}
