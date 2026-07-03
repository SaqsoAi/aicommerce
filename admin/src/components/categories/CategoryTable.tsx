"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

type Props = {
  categories: Category[];
  onRefresh?: () => void;
  onDelete?: (id: string) => void | Promise<void>;
};

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export default function CategoryTable({
  categories,
  onRefresh,
  onDelete,
}: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const safeCategories = Array.isArray(categories)
    ? categories
    : [];

  const startEdit = (category: Category) => {
    setEditId(category.id);
    setEditName(category.name || "");
    setEditSlug(category.slug || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditSlug("");
  };

  const saveEdit = async () => {
    if (!editId) return;

    try {
      setSaving(true);

      const res = await fetch(`${API}/categories/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Category update failed");
        return;
      }

      cancelEdit();
      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert("Category update failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
      onRefresh?.();
      return;
    }

    if (!confirm("Delete this category?")) return;

    const res = await fetch(`${API}/categories/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Category delete failed");
      return;
    }

    onRefresh?.();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full text-sm">
        <thead className="bg-zinc-100 text-left dark:bg-zinc-900">
          <tr>
            <th className="p-4">Category</th>
            <th className="p-4">Slug</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {safeCategories.map((category) => {
            const isEditing = editId === category.id;

            return (
              <tr
                key={category.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <td className="p-4">
                  {isEditing ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  ) : (
                    <span className="font-bold">
                      {category.name}
                    </span>
                  )}
                </td>

                <td className="p-4">
                  {isEditing ? (
                    <input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  ) : (
                    <span className="text-zinc-500">
                      {category.slug}
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-white dark:text-black"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="rounded-lg border px-4 py-2 text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(category)}
                          className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-black"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {!safeCategories.length ? (
            <tr>
              <td
                colSpan={3}
                className="p-6 text-center text-zinc-500"
              >
                No categories found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

