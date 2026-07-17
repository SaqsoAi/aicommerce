"use client";

import DashboardLayout from "./DashboardLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminEmpty from "@/components/ui/AdminEmpty";

interface Props {
  title: string;
  description?: string;
}

export default function PageContainer({
  title,
  description,
}: Props) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <AdminHeader
            title={title}
            description={description}
          />

          <div
            className="
            bg-white
            dark:bg-zinc-900
            border
            border-zinc-200
            dark:border-zinc-800
            rounded-2xl
            p-6
          "
          >
            <AdminEmpty
              title={`${title} Module`}
              description="This module is planned and ready for implementation."
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}