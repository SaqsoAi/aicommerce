"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AIChatPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            AI Chat Assistant
          </h1>

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
            <p>
              AI Shopping Assistant
              will be connected in
              PHASE 4.8.16.11.5
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}