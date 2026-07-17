"use client";

type AuditLog = {
  id?: string;
  action?: string;
  module?: string;
  description?: string;
  userId?: string;
  ipAddress?: string;
  createdAt?: string;
};

export default function AuditTable({ logs, data }: { logs?: AuditLog[]; data?: AuditLog[] }) {
  const rows = logs || data || []; if (!rows.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((log, index) => (
              <tr key={log.id || index} className="text-slate-700 dark:text-slate-200">
                <td className="whitespace-nowrap px-4 py-3">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-3">{log.module || "-"}</td>
                <td className="px-4 py-3 font-medium">{log.action || "-"}</td>
                <td className="px-4 py-3">{log.description || "-"}</td>
                <td className="px-4 py-3">{log.ipAddress || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

