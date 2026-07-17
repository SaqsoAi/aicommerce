"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierTable from "@/components/suppliers/SupplierTable";

import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  type SupplierPayload,
} from "@/services/supplier.service";

type Supplier = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  contactPerson?: string | null;
  active?: boolean;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data || []);
    } catch (error) {
      console.error("Supplier load failed", error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers =
    useMemo(() => {
      const q = search.toLowerCase();

      return suppliers.filter((item) => {
        return (
          item.name
            ?.toLowerCase()
            .includes(q) ||
          item.companyName
            ?.toLowerCase()
            .includes(q) ||
          item.email
            ?.toLowerCase()
            .includes(q) ||
          item.phone
            ?.toLowerCase()
            .includes(q)
        );
      });
    }, [suppliers, search]);

  const handleCreate = async (
    data: SupplierPayload
  ) => {
    await createSupplier(data);
    await loadSuppliers();
  };

  const handleDelete = async (
    id: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this supplier?"
      )
    ) {
      return;
    }

    await deleteSupplier(id);
    await loadSuppliers();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">
              Supplier Management
            </h1>

            <p className="mt-2 text-zinc-500">
              Manage vendor, factory and supply chain contacts.
            </p>
          </div>

          <SupplierForm onSubmit={handleCreate} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search suppliers..."
            className="
            w-full
            rounded-2xl
            border
            border-zinc-200
            dark:border-zinc-800
            bg-white
            dark:bg-zinc-900
            p-4
            text-zinc-900
            dark:text-zinc-100
          "
          />

          {loading ? (
            <div className="text-zinc-500">
              Loading suppliers...
            </div>
          ) : (
            <SupplierTable
              suppliers={filteredSuppliers}
              onDelete={handleDelete}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
