"use client";

import { useEffect, useState } from "react";

import { getProducts, deleteProduct } from "@/services/product.service";
import {
  submitProductForReview,
  approveProduct,
  rejectProduct,
  scheduleProduct,
} from "@/services/product.service";
import { resolveAssetUrl } from "@/utils/resolveAssetUrl";

type Product = {
  id: string;
  name: string;
  sku: string;
  styleNo?: string | null;
  barcode?: string | null;
  price: number;
  status?: string;
  visibility?: string;
  approvalStatus?: string | null;
  approvalNote?: string | null;
  publishAt?: string | null;
  unpublishAt?: string | null;
  thumbnail?: string | null;
  category?: { name: string };
  subcategory?: { name: string };
  brand?: { name: string };
  images?: { url: string }[];
  gallery?: { url: string }[];
  variants?: {
    id: string;
    stock: number;
    availableStock?: number;
  }[];
  createdAt: string;
};

type Props = {
  refreshKey?: number;
  onEdit?: (id: string) => void;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const badgeClass = (value?: string) => {
  if (value === "ACTIVE" || value === "PUBLIC") {
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  }

  if (value === "DRAFT") {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  }

  if (value === "ARCHIVED" || value === "HIDDEN") {
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  }

  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
};

export default function ProductTable({ refreshKey, onEdit }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      setActionLoading(id);
      await deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm("Duplicate this product?")) return;

    try {
      setActionLoading(id);

      const res = await fetch(`${API}/products/${id}/duplicate`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Duplicate failed (${res.status}): ${errorText}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Duplicate failed");
      }

      await loadProducts();
      alert("Product duplicated");
    } catch (error) {
      console.error(error);
      alert(
        `Duplicate failed: ${error instanceof Error ? error.message : "Network error"}`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleGovernanceAction = async (
    product: Product,
    action: "review" | "approve" | "reject" | "schedule",
  ) => {
    try {
      setActionLoading(product.id);

      if (action === "review") {
        await submitProductForReview(product.id, prompt("Review note") || "");
      }

      if (action === "approve") {
        await approveProduct(product.id, prompt("Approval note") || "");
      }

      if (action === "reject") {
        await rejectProduct(product.id, prompt("Reject reason") || "");
      }

      if (action === "schedule") {
        const publishAt = prompt("Publish at, example: 2026-06-25T10:00") || "";
        const unpublishAt = prompt("Unpublish at optional, example: 2026-07-01T10:00") || "";
        await scheduleProduct(product.id, publishAt, unpublishAt);
      }

      await loadProducts();
    } catch (error) {
      console.error(error);
      alert(
        `Governance action failed: ${error instanceof Error ? error.message : "Network error"}`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (product: Product) => {
    try {
      setActionLoading(product.id);

      const nextStatus = product.status === "ACTIVE" ? "DRAFT" : "ACTIVE";

      const res = await fetch(`${API}/products/${product.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          visibility: product.visibility || "PUBLIC",
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Status update failed (${res.status}): ${errorText}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Status update failed");
      }

      await loadProducts();
    } catch (error) {
      console.error(error);
      alert(
        `Status update failed: ${error instanceof Error ? error.message : "Network error"}`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-zinc-600 shadow dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        Loading products...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Product Master List
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage category, subcategory, barcode, style number, stock, status
            and visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProducts}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1350px]">
          <thead className="bg-zinc-100 dark:bg-zinc-900">
            <tr>
              <th className="p-4 text-left text-sm font-semibold">Image</th>
              <th className="p-4 text-left text-sm font-semibold">Product</th>
              <th className="p-4 text-left text-sm font-semibold">Category</th>
              <th className="p-4 text-left text-sm font-semibold">
                Subcategory
              </th>
              <th className="p-4 text-left text-sm font-semibold">Brand</th>
              <th className="p-4 text-left text-sm font-semibold">SKU</th>
              <th className="p-4 text-left text-sm font-semibold">Style No</th>
              <th className="p-4 text-left text-sm font-semibold">Barcode</th>
              <th className="p-4 text-left text-sm font-semibold">Price</th>
              <th className="p-4 text-left text-sm font-semibold">Stock</th>
              <th className="p-4 text-left text-sm font-semibold">Status</th>
              <th className="p-4 text-left text-sm font-semibold">Approval</th>
              <th className="p-4 text-left text-sm font-semibold">Schedule</th>
              <th className="p-4 text-left text-sm font-semibold">
                Visibility
              </th>
              <th className="p-4 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={15}
                  className="p-8 text-center text-zinc-500 dark:text-zinc-400"
                >
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const totalStock =
                  product.variants?.reduce(
                    (sum, variant) =>
                      sum +
                      Number(variant.availableStock ?? variant.stock ?? 0),
                    0,
                  ) ?? 0;

                return (
                  <tr
                    key={product.id}
                    className="border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <td className="p-4">
                      <img
                        src={resolveAssetUrl(product.thumbnail || product.images?.[0]?.url || product.gallery?.[0]?.url || null)}
                        alt={product.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {product.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4 text-zinc-700 dark:text-zinc-300">
                      {product.category?.name || "-"}
                    </td>

                    <td className="p-4 text-zinc-700 dark:text-zinc-300">
                      {product.subcategory?.name || "-"}
                    </td>

                    <td className="p-4 text-zinc-700 dark:text-zinc-300">
                      {product.brand?.name || "-"}
                    </td>

                    <td className="p-4 text-zinc-700 dark:text-zinc-300">
                      {product.sku}
                    </td>

                    <td className="p-4 text-zinc-700 dark:text-zinc-300">
                      {product.styleNo || "-"}
                    </td>

                    <td className="p-4 text-zinc-700 dark:text-zinc-300">
                      {product.barcode || "-"}
                    </td>

                    <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      Tk {product.price}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {totalStock}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                          product.status,
                        )}`}
                      >
                        {product.status || "DRAFT"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                          product.approvalStatus || "APPROVED",
                        )}`}
                      >
                        {product.approvalStatus || "APPROVED"}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-zinc-600 dark:text-zinc-300">
                      <div>
                        Publish: {product.publishAt ? new Date(product.publishAt).toLocaleString() : "Now"}
                      </div>
                      <div>
                        Unpublish: {product.unpublishAt ? new Date(product.unpublishAt).toLocaleString() : "None"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                          product.visibility,
                        )}`}
                      >
                        {product.visibility || "PUBLIC"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit?.(product.id)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === product.id}
                          onClick={() => handleStatusToggle(product)}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Toggle
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === product.id}
                          onClick={() => handleGovernanceAction(product, "review")}
                          className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                        >
                          Review
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === product.id}
                          onClick={() => handleGovernanceAction(product, "approve")}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === product.id}
                          onClick={() => handleGovernanceAction(product, "reject")}
                          className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === product.id}
                          onClick={() => handleGovernanceAction(product, "schedule")}
                          className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                        >
                          Schedule
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === product.id}
                          onClick={() => handleDuplicate(product.id)}
                          className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          Duplicate
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === product.id}
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




