"use client";

import Link from "next/link";

import { useAuth } from "@/providers/AuthProvider";

export default function Sidebar() {
const { role } = useAuth();
const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

return ( <aside className="w-64 min-h-screen bg-white border-r p-6"> <h2 className="text-xl font-bold mb-6">
Dashboard </h2>


  <div className="flex flex-col gap-4">
    <Link href="/dashboard">
      Overview
    </Link>

    {(role === "SUPER_ADMIN" ||
      role === "ADMIN") && (
      <>
        <a href={`${adminUrl}/products`}>
          Products
        </a>

        <a href={`${adminUrl}/orders`}>
          Orders
        </a>

        <a href={`${adminUrl}/analytics`}>
          Analytics
        </a>
      </>
    )}

    {role === "SUPER_ADMIN" && (
      <a href={`${adminUrl}/super-admin/users`}>
        Users
      </a>
    )}

    {role === "CUSTOMER" && (
      <Link href="/orders">
        My Orders
      </Link>
    )}
  </div>
</aside>


);
}


