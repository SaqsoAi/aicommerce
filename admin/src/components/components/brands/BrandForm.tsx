"use client";

import { useState } from "react";

type Props = {
  onSubmit: (
    data: {
      name: string;
      logo?: string;
    }
  ) => Promise<void>;
};

export default function BrandForm({
  onSubmit,
}: Props) {
  const [name, setName] =
    useState("");

  const [logo, setLogo] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const handleSave =
    async () => {
      if (!name.trim()) return;

      try {
        setSaving(true);

        await onSubmit({
          name,
          logo,
        });

        setName("");
        setLogo("");
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
      shadow-sm
    "
    >
      <h2
        className="
        text-xl
        font-bold
        mb-5
      "
      >
        Create Brand
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Brand Name"
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
          value={logo}
          onChange={(e) =>
            setLogo(e.target.value)
          }
          placeholder="Logo URL"
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
          onClick={handleSave}
          disabled={saving}
          className="
          rounded-xl
          bg-black
          text-white
          dark:bg-white
          dark:text-black
          px-5
          py-3
        "
        >
          {saving
            ? "Saving..."
            : "Create Brand"}
        </button>
      </div>
    </div>
  );
}