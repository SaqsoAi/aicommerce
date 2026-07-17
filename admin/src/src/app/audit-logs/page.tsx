"use client";

import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import AuditTable
from "@/components/audit/AuditTable";

import {
  getAuditLogs,
} from "@/services/audit-log.service";

export default function AuditLogsPage() {
  const [logs, setLogs] =
    useState<any[]>([]);

  useEffect(() => {
    getAuditLogs()
      .then((res) =>
        setLogs(res.data)
      )
      .catch(console.error);
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            Audit Logs
          </h1>

          <AuditTable
            data={logs}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
