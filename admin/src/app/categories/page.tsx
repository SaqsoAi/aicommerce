"use client";

import { resolveAssetUrl } from "@/utils/resolveAssetUrl";

import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
};

const LOCAL_KEY = "saqso-category-local-images-final";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readLocalImages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalImage(image: string) {
  const next = [image, ...readLocalImages()].filter(Boolean).slice(0, 40);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  return next;
}


function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/png";
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

async function uploadCategoryImageDataUrl(dataUrl: string, fileName: string) {
  const formData = new FormData();
  const extension = dataUrl.includes("image/jpeg") ? "jpg" : "png";
  formData.append("file", dataUrlToBlob(dataUrl), `${slugify(fileName)}.${extension}`);

  const response = await fetch(`${API}/upload/category`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success || !payload?.data?.url) {
    throw new Error(payload?.message || "Category image upload failed");
  }

  return String(payload.data.url);
}

function resolveImage(value?: string) {
  if (!value) return "";
  if (value.startsWith("local-category-image:")) {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(value) || "";
  }
  return resolveAssetUrl(value);
}

export default function CategoriesPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [rawImage, setRawImage] = useState("");
  const [localImages, setLocalImages] = useState<string[]>([]);

  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropSize, setCropSize] = useState(500);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    setLocalImages(readLocalImages());
  }, []);

  const filtered = useMemo(() => {
    return categories.filter((item) =>
      `${item.name || ""} ${item.slug || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [categories, search]);

  function resetForm() {
    setEditingId("");
    setName("");
    setSlug("");
    setImage("");
    setRawImage("");
    setCropX(0);
    setCropY(0);
    setCropSize(500);
  }

  function startEdit(item: Category) {
    setEditingId(item.id);
    setName(item.name || "");
    setSlug(item.slug || "");
    const resolved = resolveImage(item.image); setImage(resolved || item.image || ""); setRawImage(resolved || item.image || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function uploadRaw(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only image file allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      setImage(value); setRawImage(value); setLocalImages(saveLocalImage(value)); setTimeout(() => autoSquareCrop(), 100);
    };
    reader.readAsDataURL(file);
  }

  function autoSquareCrop() {
    if (!rawImage) return;

    const source = new Image();
    source.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = Math.min(source.width, source.height);
      const x = Math.floor((source.width - size) / 2);
      const y = Math.floor((source.height - size) / 2);

      ctx.clearRect(0, 0, 600, 600);
      ctx.drawImage(source, x, y, size, size, 0, 0, 600, 600);

      const cropped = canvas.toDataURL("image/jpeg", 0.82);
      setImage(cropped);
      setRawImage(cropped);
      setLocalImages(saveLocalImage(cropped));
    };

    source.src = rawImage;
  }

  function applyCrop() {
    if (!rawImage) return;

    const source = new Image();
    source.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const safeX = Math.max(0, Math.min(cropX, source.width - 1));
      const safeY = Math.max(0, Math.min(cropY, source.height - 1));
      const safeSize = Math.max(
        80,
        Math.min(cropSize, source.width - safeX, source.height - safeY)
      );

      ctx.clearRect(0, 0, 800, 800);
      ctx.drawImage(source, safeX, safeY, safeSize, safeSize, 0, 0, 800, 800);

      const cropped = canvas.toDataURL("image/png", 0.92);
      setImage(cropped);
      setLocalImages(saveLocalImage(cropped));
    };

    source.src = rawImage;
  }

  async function handleDeleteCategory(item: Category) {
    const confirmed = window.confirm(
      `Delete category "${item.name}"?\n\nA category linked to products or subcategories cannot be deleted until those dependencies are moved or removed.`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setNotice("");
    setErrorMessage("");

    try {
      await deleteCategory(item.id);
      setNotice(`Category "${item.name}" deleted successfully.`);
      if (editingId === item.id) resetForm();
      await loadData();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Category delete failed.";

      const normalized =
        /foreign key|constraint|related record|relation/i.test(message)
          ? `Cannot delete "${item.name}" because it is used by products or subcategories. Move or delete those records first.`
          : message;

      setErrorMessage(normalized);
      console.error("Category delete failed", error);
    } finally {
      setDeletingId("");
    }
  }

  async function submitCategory() {
    if (!name.trim()) {
      alert("Category name required");
      return;
    }

    setUpdating(true);

    try {
      const normalizedSlug = slug.trim() || slugify(name);
      const imageUrl = image && image.startsWith("data:image")
        ? await uploadCategoryImageDataUrl(image, normalizedSlug || name)
        : image.startsWith("local-category-image:")
          ? ""
          : image;

      const payload = {
        name: name.trim(),
        slug: normalizedSlug,
        image: imageUrl,
      };
      if (editingId) {
        await updateCategory(editingId, payload);
        alert("Category updated successfully");
      } else {
        await createCategory(payload);
        alert("Category created successfully");
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Update failed. Server route or image size issue. Try smaller cropped image.");
    } finally {
      setUpdating(false);
    }
  }

  function downloadImage(src: string, fileName = "category-image") {
    const link = document.createElement("a");
    link.href = src;
    link.download = `${fileName}.png`;
    link.click();
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6 md:p-8">
        <div>
          <h1 className="text-4xl font-bold">Categories</h1>
          <p className="text-zinc-500">
            Create, edit, upload, crop and update category image.
          </p>
        </div>

        <section className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">
              {editingId ? "Edit Category" : "Create Category"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border px-4 py-2 text-sm font-bold dark:border-zinc-700"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingId) setSlug(slugify(e.target.value));
              }}
              placeholder="Category name"
              className="w-full rounded-2xl border border-zinc-200 bg-transparent p-4 outline-none dark:border-zinc-800"
            />

            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="category-slug"
              className="w-full rounded-2xl border border-zinc-200 bg-transparent p-4 outline-none dark:border-zinc-800"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadRaw(e.target.files?.[0])}
                className="w-full rounded-2xl border border-zinc-200 bg-transparent p-4 dark:border-zinc-800"
              />

              <input
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setRawImage(e.target.value);
                }}
                placeholder="Image URL or localStorage image"
                className="w-full rounded-2xl border border-zinc-200 bg-transparent p-4 outline-none dark:border-zinc-800"
              />

              {rawImage && (
                <div className="space-y-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black">Crop Image</h3>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => setRawImage("")} className="rounded-xl border px-3 py-2 text-xs font-bold dark:border-zinc-800">Close</button>
                      <button type="button" onClick={() => setRawImage(image || "")} className="rounded-xl border px-3 py-2 text-xs font-bold dark:border-zinc-800">Cancel</button>
                      <button type="button" onClick={() => { setImage(""); setRawImage(""); }} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white">Delete Image</button>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-sm font-bold">Crop X<input type="range" min="0" max="1500" value={cropX} onChange={(e) => setCropX(Number(e.target.value))} className="w-full" /></label>
                    <label className="text-sm font-bold">Crop Y<input type="range" min="0" max="1500" value={cropY} onChange={(e) => setCropY(Number(e.target.value))} className="w-full" /></label>
                    <label className="text-sm font-bold">Crop Size<input type="range" min="80" max="2000" value={cropSize} onChange={(e) => setCropSize(Number(e.target.value))} className="w-full" /></label>
                  </div>

                  <button type="button" onClick={autoSquareCrop} className="mr-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">Auto Crop Square</button><button type="button" onClick={applyCrop}
                    className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black"
                  >
                    Apply Crop
                  </button>
                </div>
              )}

              {localImages.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    Load From Local Storage
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {localImages.map((src, index) => (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setImage(src);
                            setRawImage(src);
                          }}
                          className="rounded-xl border p-1 dark:border-zinc-800"
                        >
                          <img src={src} alt="local" className="h-14 w-14 rounded-lg object-cover" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const next = localImages.filter((_, i) => i !== index);
                            localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
                            setLocalImages(next);
                          }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-bold">Preview</p>

              {image ? (
                <div className="space-y-3">
                  <img src={resolveAssetUrl(image)} alt="Preview" className="h-52 w-52 rounded-3xl border object-cover dark:border-zinc-800" />
                  <button type="button" onClick={() => downloadImage(image, slug || name || "category")} className="w-52 rounded-2xl border px-4 py-3 text-sm font-bold dark:border-zinc-800">
                    Download Image
                  </button>
                </div>
              ) : (
                <div className="flex h-52 w-52 items-center justify-center rounded-3xl bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-900">
                  No Image
                </div>
              )}
            </div>
          </div>

          <button type="button" disabled={updating} onClick={submitCategory} className="rounded-2xl bg-black px-6 py-3 font-bold text-white dark:bg-white dark:text-black"
          >
            {updating ? "Saving..." : editingId ? "Update Category" : "Create Category"}
          </button>

          <canvas ref={canvasRef} className="hidden" />
        </section>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category..."
          className="w-full rounded-2xl border border-zinc-200 bg-transparent p-4 outline-none dark:border-zinc-800"
        />

        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {notice}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-[0.2em] text-zinc-500 dark:border-zinc-800">
                  <th className="p-4">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-6">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-zinc-500">No category found</td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="border-b dark:border-zinc-800">
                      <td className="p-4">
                        {item.image ? (
                          <img src={resolveAssetUrl(resolveImage(item.image))} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-900">
                            No Img
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-bold">{item.name}</td>
                      <td className="p-4 text-zinc-500">{item.slug}</td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => startEdit(item)} className="rounded-xl border px-4 py-2 text-xs font-bold dark:border-zinc-800">
                            Edit
                          </button>

                          {item.image && (
                            <button type="button" onClick={() => downloadImage(item.image || "", item.slug || item.name)} className="rounded-xl border px-4 py-2 text-xs font-bold dark:border-zinc-800">
                              Download
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => void handleDeleteCategory(item)}
                            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}



