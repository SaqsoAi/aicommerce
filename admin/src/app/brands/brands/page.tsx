"use client";

import { resolveAssetUrl } from "@/utils/resolveAssetUrl";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";


type Brand = {
  id: string;
  name: string;
  logo?: string | null;
};

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBrands = async () => {
    setLoading(true);
    const res = await fetch(`${API}/brands`);
    const data = await res.json();
    setBrands(Array.isArray(data?.data) ? data.data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const filtered = useMemo(() => {
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [brands, search]);

  const resetForm = () => {
    setName("");
    setLogo("");
    setEditId(null);
  };

  const uploadLogo = async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API}/brands/logo/upload`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Logo upload failed");
      return;
    }

    setLogo(data.data.url);
  };

  const saveBrand = async () => {
    if (!name.trim()) {
      alert("Brand name required");
      return;
    }

    const res = await fetch(
      editId ? `${API}/brands/${editId}` : `${API}/brands`,
      {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          logo,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Brand save failed");
      return;
    }

    resetForm();
    await loadBrands();
  };

  const startEdit = (brand: Brand) => {
    setEditId(brand.id);
    setName(brand.name);
    setLogo(brand.logo || "");
  };

  const deleteBrand = async (id: string) => {
    if (!confirm("Delete this brand?")) return;

    const res = await fetch(`${API}/brands/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Brand delete failed");
      return;
    }

    await loadBrands();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Catalog
          </p>
          <h1 className="mt-2 text-4xl font-black">Brands</h1>
          <p className="mt-2 text-zinc-500">
            Brand create, edit and logo upload.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-black">
            {editId ? "Edit Brand" : "Add Brand"}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brand name"
              className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadLogo(file);
              }}
              className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <button
              type="button"
              onClick={saveBrand}
              className="rounded-xl bg-black px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-black"
            >
              {editId ? "Update" : "Save"}
            </button>
          </div>

          {logo ? (
            <div className="mt-4 flex items-center gap-3">
              <img
                src={resolveAssetUrl(logo)}
                alt="Brand Logo"
                className="h-16 w-16 rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setLogo("")}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white"
              >
                Remove Logo
              </button>
              {editId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-4 py-2 text-xs font-black"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="w-full rounded-2xl border border-zinc-200 bg-transparent p-4 dark:border-zinc-800"
        />

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left dark:bg-zinc-900">
              <tr>
                <th className="p-4">Logo</th>
                <th className="p-4">Brand</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((brand) => (
                  <tr
                    key={brand.id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="p-4">
                      <img
                        src={resolveAssetUrl(brand.logo)}
                        alt={brand.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    </td>

                    <td className="p-4 font-black">{brand.name}</td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(brand)}
                          className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-black text-black"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteBrand(brand.id)}
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
                  <td colSpan={3} className="p-6 text-center text-zinc-500">
                    No brands found.
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
