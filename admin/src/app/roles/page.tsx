"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function RolesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Role Management</h1>

        <div className="rounded-2xl border p-6">
          <p>SUPER_ADMIN controls all roles and permissions.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
