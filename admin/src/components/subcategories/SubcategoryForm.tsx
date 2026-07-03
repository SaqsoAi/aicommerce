"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getCategories,
} from "@/services/category.service";

type Props = {
  onSubmit: (
    data: {
      name: string;
      slug: string;
      categoryId: string;
    }
  ) => Promise<void>;
};

export default function SubcategoryForm({
  onSubmit,
}: Props) {
  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [categoryId,
    setCategoryId] =
    useState("");

  const [categories,
    setCategories] =
    useState<any[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  return (
    <div
      className="
      rounded-3xl
      border
      border-zinc-200
      dark:border-zinc-800
      bg-white
      dark:bg-zinc-900
      p-6
    "
    >
      <h2 className="text-xl font-bold mb-5">
        Create Subcategory
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Name"
          className="
          p-3
          rounded-xl
          border
          border-zinc-200
          dark:border-zinc-700
          bg-transparent
        "
        />

        <input
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value)
          }
          placeholder="Slug"
          className="
          p-3
          rounded-xl
          border
          border-zinc-200
          dark:border-zinc-700
          bg-transparent
        "
        />

        <select
          value={categoryId}
          onChange={(e) =>
            setCategoryId(
              e.target.value
            )
          }
          className="
          p-3
          rounded-xl
          border
          border-zinc-200
          dark:border-zinc-700
          bg-transparent
        "
        >
          <option value="">
            Select Category
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            )
          )}
        </select>

        <button
          onClick={async () => {
            await onSubmit({
              name,
              slug,
              categoryId,
            });

            setName("");
            setSlug("");
            setCategoryId("");
          }}
          className="
          rounded-xl
          bg-black
          text-white
          dark:bg-white
          dark:text-black
        "
        >
          Create
        </button>
      </div>
    </div>
  );
}