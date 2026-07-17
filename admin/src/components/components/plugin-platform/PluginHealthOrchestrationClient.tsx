"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PauseCircle,
  RefreshCw,
  ShieldAlert,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getPluginPlatformHealthSnapshot,
  quarantinePluginByHealthPolicy,
  runOrchestratedPluginHealth,
  type PluginHealthOrchestrationResult,
  type PluginPlatformHealthSnapshot,
} from "@/api/pluginPlatform.api";
import AdminCard from "@/components/ui/AdminCard";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminPage from "@/components/ui/AdminPage";
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

function tone(status: string): string {
  if (status === "HEALTHY" || status === "PASS") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "DEGRADED" || status === "WARN") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }
  if (status === "INACTIVE") {
    return "border-white/10 bg-white/5 text-white/60";
  }
  return "border-red-400/20 bg-red-400/10 text-red-200";
}

export default function PluginHealthOrchestrationClient() {
  const [snapshot, setSnapshot] =
    useState<PluginPlatformHealthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] =
    useState<PluginHealthOrchestrationResult | null>(null);
  const [action, setAction] =
    useState<"run" | "quarantine" | null>(null);
  const [reason, setReason] = useState("");

  async function load(refresh = false) {
    setLoading(true);
    try {
      setSnapshot(
        await getPluginPlatformHealthSnapshot(refresh)
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Health snapshot failed"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function execute() {
    if (!selected || !action || reason.trim().length < 5) {
      return;
    }

    setLoading(true);
    try {
      if (action === "run") {
        await runOrchestratedPluginHealth(
          selected.pluginKey,
          reason.trim()
        );
        toast.success("Health orchestration completed");
      } else {
        await quarantinePluginByHealthPolicy(
          selected.pluginKey,
          reason.trim()
        );
        toast.success("Plugin quarantined and tenant access disabled");
      }

      setAction(null);
      setSelected(null);
      setReason("");
      await load(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Health action failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin Manager / Health"
        title="Health Orchestration"
        description="Correlate declared checks, dependencies, registry integrity, transactions, configuration and tenant impact. Scheduled execution remains disabled until a canonical host scheduler is approved."
        actions={
          <Button
            variant="outline"
            onClick={() => void load(true)}
            disabled={loading}
          >
            <RefreshCw
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        }
      />

      {snapshot ? (
        <>
          <AdminCard className="border-amber-400/20 p-5">
            <div className="flex gap-3 text-amber-100">
              <AlertTriangle />
              <div>
                <h2 className="font-black">
                  Scheduler: manual only
                </h2>
                <p className="mt-1 text-sm text-amber-100/70">
                  {snapshot.scheduler.reason}
                </p>
              </div>
            </div>
          </AdminCard>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Total", snapshot.summary.total],
              ["Healthy", snapshot.summary.healthy],
              ["Degraded", snapshot.summary.degraded],
              ["Unhealthy", snapshot.summary.unhealthy],
              [
                "Quarantine",
                snapshot.summary.quarantineRecommended,
              ],
            ].map(([label, value]) => (
              <AdminCard
                key={String(label)}
                className="p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                  {String(label)}
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  {String(value)}
                </p>
              </AdminCard>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {snapshot.plugins.map((plugin) => (
              <AdminCard
                key={plugin.pluginKey}
                className="space-y-5 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white">
                      {plugin.pluginName}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-white/35">
                      {plugin.pluginKey}
                    </p>
                  </div>
                  <Badge className={tone(plugin.healthStatus)}>
                    {plugin.healthStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <p className="text-xs text-white/35">Score</p>
                    <p className="mt-1 text-xl font-black text-white">
                      {plugin.score}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <p className="text-xs text-white/35">Failures</p>
                    <p className="mt-1 text-xl font-black text-white">
                      {plugin.consecutiveFailureEstimate}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <p className="text-xs text-white/35">Tenants</p>
                    <p className="mt-1 text-xl font-black text-white">
                      {plugin.affectedTenantCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {plugin.signals.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-3"
                    >
                      {item.status === "PASS" ? (
                        <CheckCircle2
                          className="mt-0.5 text-emerald-300"
                          size={18}
                        />
                      ) : item.status === "WARN" ? (
                        <AlertTriangle
                          className="mt-0.5 text-amber-300"
                          size={18}
                        />
                      ) : (
                        <XCircle
                          className="mt-0.5 text-red-300"
                          size={18}
                        />
                      )}
                      <div>
                        <p className="font-bold text-white">
                          {item.category}
                        </p>
                        <p className="mt-1 text-sm text-white/50">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {plugin.recommendations.map((item) => (
                    <div
                      key={`${item.code}-${item.message}`}
                      className="rounded-xl border border-white/10 p-3"
                    >
                      <p className="font-bold text-white">
                        {item.code}
                      </p>
                      <p className="mt-1 text-sm text-white/50">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelected(plugin);
                      setAction("run");
                    }}
                  >
                    <Activity />
                    Run health
                  </Button>

                  {plugin.healthStatus ===
                  "QUARANTINE_RECOMMENDED" ? (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelected(plugin);
                        setAction("quarantine");
                      }}
                    >
                      <PauseCircle />
                      Quarantine
                    </Button>
                  ) : null}
                </div>
              </AdminCard>
            ))}
          </div>

          <AdminCard className="p-5">
            <div className="flex items-center gap-3 text-white/60">
              <Users />
              <p>
                Total affected tenant assignments:{" "}
                {snapshot.summary.affectedTenants}
              </p>
            </div>
          </AdminCard>
        </>
      ) : loading ? (
        <AdminCard className="flex min-h-48 items-center justify-center gap-3 p-8 text-white/55">
          <Loader2 className="animate-spin" />
          Evaluating plugin health…
        </AdminCard>
      ) : null}

      <Dialog
        open={Boolean(action)}
        onOpenChange={(open) => {
          if (!open && !loading) {
            setAction(null);
            setSelected(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === "quarantine" ? (
                <ShieldAlert className="text-red-400" />
              ) : (
                <Activity className="text-cyan-300" />
              )}
              {action === "quarantine"
                ? "Confirm plugin quarantine"
                : "Run orchestrated health"}
            </DialogTitle>
            <DialogDescription>
              {action === "quarantine"
                ? "This manually changes the plugin to INACTIVE and disables current tenant assignments. It does not delete files or data."
                : "This runs controlled host health checks and records an audit event."}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Required reason (minimum 5 characters)"
            className="min-h-28"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={
                action === "quarantine"
                  ? "destructive"
                  : "default"
              }
              onClick={() => void execute()}
              disabled={
                loading || reason.trim().length < 5
              }
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : action === "quarantine" ? (
                <PauseCircle />
              ) : (
                <Activity />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
