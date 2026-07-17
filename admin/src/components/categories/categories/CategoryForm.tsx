"use client";

import { useState } from "react";

type Props = {
  onSubmit: (
    data: {
      name: string;
      slug: string;
      image?: string;
    }
  ) => Promise<void>;
};

export default function CategoryForm({
  onSubmit,
}: Props) {
  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [image, setImage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const handleSubmit =
    async () => {
      if (!name) return;

      try {
        setSaving(true);

        await onSubmit({
          name,
          slug,
          image,
        });

        setName("");
        setSlug("");
        setImage("");
      } finally {
        setSaving(false);
      }
    };

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
      <h2
        className="
        text-xl
        font-bold
        mb-5
      "
      >
        Create Category
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        <input
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
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
            setSlug(
              e.target.value
            )
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

        <input
          value={image}
          onChange={(e) =>
            setImage(
              e.target.value
            )
          }
          placeholder="Image URL"
          className="
          p-3
          rounded-xl
          border
          border-zinc-200
          dark:border-zinc-700
          bg-transparent
        "
        />

        <button
          onClick={
            handleSubmit
          }
          className="
          rounded-xl
          bg-black
          text-white
          dark:bg-white
          dark:text-black
        "
        >
          {saving
            ? "Saving..."
            : "Create"}
        </button>
      </div>
    </div>
  );
}