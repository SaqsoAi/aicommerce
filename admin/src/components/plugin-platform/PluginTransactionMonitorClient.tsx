"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
  History,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  acknowledgePluginMigrationReview,
  getPluginTransaction,
  listPluginTransactions,
  type PluginTransactionSummary,
} from "@/api/pluginPlatform.api";
import AdminCard from "@/components/ui/AdminCard";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminPage from "@/components/ui/AdminPage";
import AdminTable from "@/components/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ACTIVE = new Set([
  "PREPARING",
  "VALIDATING",
  "BACKING_UP",
  "APPLYING_FILES",
  "VERIFYING",
  "COMMITTING",
  "ROLLING_BACK",
]);

function displayDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

function tone(status: string): string {
  const value = status.toUpperCase();
  if (value === "SUCCEEDED") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (value === "ROLLED_BACK") return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  if (["FAILED", "ROLLING_BACK"].includes(value)) return "border-red-400/20 bg-red-400/10 text-red-200";
  if (value === "MIGRATION_REVIEW_REQUIRED") return "border-violet-400/20 bg-violet-400/10 text-violet-100";
  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
}

function progressFor(status: string): number {
  const stages: Record<string, number> = {
    PREPARING: 8,
    VALIDATING: 18,
    BACKING_UP: 35,
    APPLYING_FILES: 58,
    MIGRATION_REVIEW_REQUIRED: 60,
    VERIFYING: 75,
    COMMITTING: 90,
    SUCCEEDED: 100,
    FAILED: 100,
    ROLLING_BACK: 70,
    ROLLED_BACK: 100,
  };
  return stages[status] ?? 0;
}

export default function PluginTransactionMonitorClient({
  transactionId,
}: {
  transactionId?: string;
}) {
  const [transaction, setTransaction] = useState<PluginTransactionSummary | null>(null);
  const [transactions, setTransactions] = useState<PluginTransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      if (transactionId) {
        setTransaction(await getPluginTransaction(transactionId));
      } else {
        setTransactions(await listPluginTransactions());
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load plugin transactions"
      );
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!transactionId || !transaction || !ACTIVE.has(transaction.status)) return;
    const timer = window.setInterval(() => void load(), 2000);
    return () => window.clearInterval(timer);
  }, [load, transaction, transactionId]);

  const verifiedFiles = useMemo(
    () =>
      transaction?.fileOperations?.filter((item) =>
        ["VERIFIED", "ROLLED_BACK"].includes(item.status)
      ).length || 0,
    [transaction?.fileOperations]
  );

  async function submitReview() {
    if (!transaction || reason.trim().length < 5) return;
    setWorking(true);
    try {
      await acknowledgePluginMigrationReview(transaction.id, reason.trim());
      toast.success("Migration review acknowledgement recorded");
      setReviewOpen(false);
      setReason("");
      await load();
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Migration acknowledgement failed"
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin Manager / Transactions"
        title={transactionId ? "Installation Transaction" : "Transaction Monitor"}
        description={
          transactionId
            ? "Monitor staging, backup, file application, verification, commit and rollback events."
            : "Review recent plugin installation transactions and recovery outcomes."
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/system/plugin-manager">Plugin Manager</Link>
            </Button>
            <Button variant="outline" onClick={() => void load()} disabled={loading || working}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </>
        }
      />

      {error ? (
        <AdminCard className="border-red-400/20 p-6">
          <div className="flex gap-3 text-red-100">
            <AlertTriangle />
            <div>
              <h2 className="font-black">Transaction API unavailable</h2>
              <p className="mt-1 text-sm text-red-100/70">{error}</p>
            </div>
          </div>
        </AdminCard>
      ) : null}

      {loading ? (
        <AdminCard className="flex min-h-52 items-center justify-center gap-3 p-8 text-white/55">
          <Loader2 className="animate-spin" />
          Loading transaction state…
        </AdminCard>
      ) : transactionId && transaction ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Status</p>
              <Badge className={`mt-3 ${tone(transaction.status)}`}>{transaction.status}</Badge>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Plugin</p>
              <p className="mt-2 font-black text-white">{transaction.plugin?.name || "—"}</p>
              <p className="mt-1 font-mono text-xs text-white/35">
                {transaction.plugin?.pluginKey || "—"}
              </p>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Files verified</p>
              <p className="mt-2 text-2xl font-black text-white">
                {verifiedFiles}/{transaction.fileOperations?.length || 0}
              </p>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Started</p>
              <p className="mt-2 text-sm font-bold text-white">{displayDate(transaction.startedAt)}</p>
            </AdminCard>
          </div>

          <AdminCard className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-white">Transaction progress</h2>
                <p className="mt-1 text-sm text-white/45">
                  Active transactions refresh automatically every two seconds.
                </p>
              </div>
              <span className="text-sm font-black text-white">
                {progressFor(transaction.status)}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-cyan-300 transition-all duration-500"
                style={{ width: `${progressFor(transaction.status)}%` }}
              />
            </div>
            <p className="break-all font-mono text-xs text-white/35">
              Transaction ID: {transaction.id}
            </p>
          </AdminCard>

          {transaction.status === "MIGRATION_REVIEW_REQUIRED" ? (
            <AdminCard className="border-violet-400/20 p-6">
              <div className="flex items-start gap-3">
                <Database className="mt-1 text-violet-300" />
                <div className="flex-1">
                  <h2 className="font-black text-white">Database migration review required</h2>
                  <p className="mt-2 text-sm text-white/55">
                    The engine stopped before file mutation. This UI does not execute Prisma
                    migration deploy. Acknowledgement only records the review decision.
                  </p>
                  <div className="mt-4 grid gap-2 text-xs text-white/40">
                    <p>Plan: {transaction.migrationGate?.migrationPlanPath || "—"}</p>
                    <p>Rollback: {transaction.migrationGate?.rollbackPlanPath || "—"}</p>
                    <p>Deploy executed: {String(transaction.migrationGate?.deployExecuted || false)}</p>
                  </div>
                  <Button className="mt-5" onClick={() => setReviewOpen(true)}>
                    <ShieldCheck />
                    Record migration review
                  </Button>
                </div>
              </div>
            </AdminCard>
          ) : null}

          {transaction.errorMessage ? (
            <AdminCard className="border-red-400/20 p-6">
              <div className="flex gap-3 text-red-100">
                <XCircle />
                <div>
                  <h2 className="font-black">{transaction.errorCode || "Transaction failed"}</h2>
                  <p className="mt-2 text-sm text-red-100/70">{transaction.errorMessage}</p>
                  <p className="mt-3 text-xs text-red-100/45">
                    Rollback status: {transaction.status}
                  </p>
                </div>
              </div>
            </AdminCard>
          ) : null}

          {transaction.status === "SUCCEEDED" && transaction.plugin ? (
            <AdminCard className="border-emerald-400/20 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 text-emerald-300" />
                <div className="flex-1">
                  <h2 className="font-black text-white">Installation transaction committed</h2>
                  <p className="mt-2 text-sm text-white/55">
                    File hashes, ownership ledger and installation registry were committed.
                    Activation remains a separate controlled lifecycle action.
                  </p>
                  <Button asChild className="mt-5">
                    <Link
                      href={`/system/plugin-manager/${encodeURIComponent(
                        transaction.plugin.pluginKey
                      )}`}
                    >
                      Open activation controls
                    </Link>
                  </Button>
                </div>
              </div>
            </AdminCard>
          ) : null}

          <AdminTable>
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <FileCheck2 className="text-cyan-300" />
                <h2 className="font-black text-white">File-operation timeline</h2>
              </div>
            </div>
            {transaction.fileOperations?.length ? (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Owner</th>
                    <th className="px-5 py-4">Destination</th>
                    <th className="px-5 py-4">Operation</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {transaction.fileOperations.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 text-white/40">{item.sequence}</td>
                      <td className="px-5 py-4 text-white/60">{item.owner}</td>
                      <td className="px-5 py-4 font-mono text-xs text-white/60">
                        {item.destinationPath}
                      </td>
                      <td className="px-5 py-4 text-white/55">{item.operation}</td>
                      <td className="px-5 py-4">
                        <Badge className={tone(item.status)}>{item.status}</Badge>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-white/35">
                        {(item.appliedSha256 || item.expectedSha256).slice(0, 16)}…
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-sm text-white/45">
                File operations are not available for this state.
              </div>
            )}
          </AdminTable>

          <AdminTable>
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <History className="text-cyan-300" />
                <h2 className="font-black text-white">Transaction logs</h2>
              </div>
            </div>
            {transaction.logs?.length ? (
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-5 py-4">Time</th>
                    <th className="px-5 py-4">Level</th>
                    <th className="px-5 py-4">Event</th>
                    <th className="px-5 py-4">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {transaction.logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-5 py-4 text-white/40">{displayDate(log.createdAt)}</td>
                      <td className="px-5 py-4">{log.level}</td>
                      <td className="px-5 py-4 font-bold text-white">{log.event}</td>
                      <td className="px-5 py-4 text-white/55">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-sm text-white/45">No transaction logs recorded.</div>
            )}
          </AdminTable>
        </>
      ) : !transactionId ? (
        <AdminTable>
          {transactions.length ? (
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Plugin</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Files</th>
                  <th className="px-5 py-4">Completed</th>
                  <th className="px-5 py-4">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 text-white/45">{displayDate(item.createdAt)}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{item.plugin?.name || "—"}</p>
                      <p className="font-mono text-xs text-white/35">
                        {item.plugin?.pluginKey || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={tone(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-white/55">
                      {item.fileOperations?.length || 0}
                    </td>
                    <td className="px-5 py-4 text-white/45">
                      {displayDate(item.completedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Button asChild variant="outline">
                        <Link href={`/system/plugin-manager/transactions/${item.id}`}>
                          Monitor
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-sm text-white/45">No plugin transactions found.</div>
          )}
        </AdminTable>
      ) : null}

      <Dialog open={reviewOpen} onOpenChange={(open) => !working && setReviewOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record migration review</DialogTitle>
            <DialogDescription>
              This records an acknowledgement only. It does not execute database migration deploy.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Review reason (minimum 5 characters)"
            className="min-h-28"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={working}>
              Cancel
            </Button>
            <Button
              onClick={() => void submitReview()}
              disabled={working || reason.trim().length < 5}
            >
              {working ? <Loader2 className="animate-spin" /> : <Database />}
              Record acknowledgement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
