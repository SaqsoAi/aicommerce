"use client";

import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

import KpiCard from "./cards/KpiCard";

type Props = {
  products: number;
  customers: number;
  orders: number;
  lowStock: number;
};

export default function StatsCards({
  products,
  customers,
  orders,
  lowStock,
}: Props) {
  return (
    <div
      className="
      grid
      gap-6

      sm:grid-cols-2
      xl:grid-cols-4
    "
    >
      <KpiCard
        title="Products"
        value={products}
        icon={Package}
      />

      <KpiCard
        title="Customers"
        value={customers}
        icon={Users}
      />

      <KpiCard
        title="Orders"
        value={orders}
        icon={ShoppingCart}
      />

      <KpiCard
        title="Low Stock"
        value={lowStock}
        icon={AlertTriangle}
      />
    </div>
  );
}