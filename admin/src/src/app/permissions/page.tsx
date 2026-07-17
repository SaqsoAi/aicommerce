"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PermissionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Permission Matrix</h1>

        <div className="rounded-2xl border p-6">
          <p>Configure role-based access control.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
