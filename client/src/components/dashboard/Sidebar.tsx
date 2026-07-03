"use client";

import Link from "next/link";

import { useAuth } from "@/providers/AuthProvider";

export default function Sidebar() {
const { role } = useAuth();

return ( <aside className="w-64 min-h-screen bg-white border-r p-6"> <h2 className="text-xl font-bold mb-6">
Dashboard </h2>


  <div className="flex flex-col gap-4">
    <Link href="/dashboard">
      Overview
    </Link>

    {(role === "SUPER_ADMIN" ||
      role === "ADMIN") && (
      <>
        <Link href="/admin/products">
          Products
        </Link>

        <Link href="/admin/orders">
          Orders
        </Link>

        <Link href="/admin/analytics">
          Analytics
        </Link>
      </>
    )}

    {role === "SUPER_ADMIN" && (
      <Link href="/admin/users">
        Users
      </Link>
    )}

    {role === "CUSTOMER" && (
      <Link href="/customer/orders">
        My Orders
      </Link>
    )}
  </div>
</aside>


);
}


