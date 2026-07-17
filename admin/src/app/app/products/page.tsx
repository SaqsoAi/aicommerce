"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductForm from "@/components/products/ProductForm";
import ProductTable from "@/components/products/ProductTable";
import { getProducts } from "@/services/product.service";

type Product = {
  id: string;
  name: string;
  sku?: string;
  barcode?: string | null;
  styleNo?: string | null;
  price?: number;
  category?: { name?: string };
  brand?: { name?: string };
  variants?: Array<{
    stock?: number;
    availableStock?: number;
  }>;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(
    undefined
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await getProducts();

      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      setProducts(list);
    } catch (error) {
      console.error("Product load failed", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddForm = () => {
    setEditingProductId(undefined);
    setFormOpen(true);
  };

  const openEditForm = (id: string) => {
    setEditingProductId(id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setEditingProductId(undefined);
    setFormOpen(false);
  };

  const handleSuccess = async () => {
    await loadProducts();
    setRefreshKey((prev) => prev + 1);
    closeForm();
  };

  const filteredProducts = useMemo(() => {
    const key = search.toLowerCase().trim();

    if (!key) return products;

    return products.filter((item) => {
      const text = [
        item.name,
        item.sku,
        item.barcode,
        item.styleNo,
        item.category?.name,
        item.brand?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(key);
    });
  }, [products, search]);

  const totalQty = useMemo(() => {
    return products.reduce((sum, product) => {
      const productQty = (product.variants || []).reduce(
        (variantSum, variant) =>
          variantSum + Number(variant.availableStock ?? variant.stock ?? 0),
        0
      );

      return sum + productQty;
    }, 0);
  }, [products]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
              Product Master
            </p>

            <h1 className="mt-2 text-4xl font-black">
              {formOpen
                ? editingProductId
                  ? "Edit Product"
                  : "Add Product"
                : "Product Master List"}
            </h1>

            <p className="mt-2 text-zinc-500">
              {formOpen
                ? editingProductId
                  ? "Update product information, variants, barcode, image and inventory."
                  : "Create a new product with variants, barcode, image and inventory."
                : "Manage products, search master list and review current stock."}
            </p>
          </div>

          {formOpen ? (
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-black dark:border-zinc-700"
            >
              Close Product Form
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddForm}
              className="rounded-xl bg-black px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-black"
            >
              Add Product
            </button>
          )}
        </div>

        {formOpen ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <ProductForm
              productId={editingProductId}
              onSuccess={handleSuccess}
            />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Total Products
                </p>
                <p className="mt-3 text-2xl font-black">
                  {products.length}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Current Stock
                </p>
                <p className="mt-3 text-2xl font-black">
                  {totalQty}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Showing
                </p>
                <p className="mt-3 text-2xl font-black">
                  {filteredProducts.length}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-2xl font-black">
                    Product Master List
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Search by product, SKU, barcode, style no, brand or category.
                  </p>
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product, SKU, barcode, style no, brand, category..."
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-black dark:border-zinc-800 dark:bg-zinc-950 lg:max-w-md"
                />
              </div>

              {loading ? (
                <div className="rounded-2xl border p-6 text-zinc-500">
                  Loading products...
                </div>
              ) : (
                <ProductTable
                  refreshKey={refreshKey}
                  onEdit={openEditForm}
                />
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
