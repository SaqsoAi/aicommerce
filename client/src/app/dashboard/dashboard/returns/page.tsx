"use client";

import Link from "next/link";

export default function ReturnsPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-bold mb-6">Return Center</h1>

      <div className="rounded-xl border p-6">
        <p>Customer Return Requests</p>

        <div className="mt-4">
          <Link
            href="/orders"
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            View Orders
          </Link>
        </div>
      </div>
    </main>
  );
}


