"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type Category = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: {
    name: string;
  };
};

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const [catRes, subRes] = await Promise.all([
      fetch(`${API}/categories`).then((res) => res.json()),
      fetch(`${API}/subcategories`).then((res) => res.json()),
    ]);

    setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
    setSubcategories(Array.isArray(subRes?.data) ? subRes.data : []);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setCategoryId("");
    setEditId(null);
  };

  const save = async () => {
    if (!name || !categoryId) {
      alert("Subcategory name and category required");
      return;
    }

    const url = editId
      ? `${API}/subcategories/${editId}`
      : `${API}/subcategories`;

    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        slug,
        categoryId,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Subcategory save failed");
      return;
    }

    resetForm();
    await load();
  };

  const startEdit = (item: Subcategory) => {
    setEditId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setCategoryId(item.categoryId);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;

    const res = await fetch(`${API}/subcategories/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Delete failed");
      return;
    }

    await load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Catalog
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Subcategories
          </h1>

          <p className="mt-2 text-zinc-500">
            Create, edit and manage subcategories with category mapping.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-black">
            {editId ? "Edit Subcategory" : "Add Subcategory"}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subcategory Name"
              className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug optional"
              className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                className="rounded-xl bg-black px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-black"
              >
                {editId ? "Update" : "Save"}
              </button>

              {editId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border px-5 py-3 text-sm font-black"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left dark:bg-zinc-900">
              <tr>
                <th className="p-4">Subcategory</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : subcategories.length ? (
                subcategories.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="p-4 font-bold">{item.name}</td>
                    <td className="p-4 text-zinc-500">{item.slug}</td>
                    <td className="p-4">{item.category?.name || "-"}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-black text-black"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-zinc-500">
                    No subcategories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
