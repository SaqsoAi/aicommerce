"use client";

import { useState } from "react";
import type { SupplierPayload } from "@/services/supplier.service";

type Props = {
  onSubmit: (
    data: SupplierPayload
  ) => Promise<void>;
};

export default function SupplierForm({
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<SupplierPayload>({
      name: "",
      email: "",
      phone: "",
      companyName: "",
      contactPerson: "",
      website: "",
      address: "",
      notes: "",
    });

  const [saving, setSaving] =
    useState(false);

  const updateField = (
    key: keyof SupplierPayload,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Supplier name required");
      return;
    }

    try {
      setSaving(true);

      await onSubmit(form);

      setForm({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        contactPerson: "",
        website: "",
        address: "",
        notes: "",
      });
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
      text-zinc-900
      dark:text-zinc-100
      shadow-sm
    "
    >
      <h2 className="text-xl font-bold mb-5">
        Add Supplier
      </h2>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <input
          value={form.name}
          onChange={(e) =>
            updateField("name", e.target.value)
          }
          placeholder="Supplier Name *"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3"
        />

        <input
          value={form.companyName}
          onChange={(e) =>
            updateField("companyName", e.target.value)
          }
          placeholder="Company Name"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3"
        />

        <input
          value={form.contactPerson}
          onChange={(e) =>
            updateField("contactPerson", e.target.value)
          }
          placeholder="Contact Person"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3"
        />

        <input
          value={form.email}
          onChange={(e) =>
            updateField("email", e.target.value)
          }
          placeholder="Email"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3"
        />

        <input
          value={form.phone}
          onChange={(e) =>
            updateField("phone", e.target.value)
          }
          placeholder="Phone"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3"
        />

        <input
          value={form.website}
          onChange={(e) =>
            updateField("website", e.target.value)
          }
          placeholder="Website"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <textarea
          value={form.address}
          onChange={(e) =>
            updateField("address", e.target.value)
          }
          placeholder="Address"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3 h-28"
        />

        <textarea
          value={form.notes}
          onChange={(e) =>
            updateField("notes", e.target.value)
          }
          placeholder="Notes"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3 h-28"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="
        mt-5
        rounded-xl
        bg-zinc-900
        px-6
        py-3
        text-white
        hover:bg-zinc-800
        dark:bg-zinc-100
        dark:text-zinc-900
        dark:hover:bg-zinc-200
        disabled:opacity-60
      "
      >
        {saving ? "Saving..." : "Create Supplier"}
      </button>
    </div>
  );
}
