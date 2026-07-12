"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  History,
  Loader2,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Save,
  Settings2,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  activatePlugin,
  deactivatePlugin,
  getPlugin,
  getPluginHistory,
  rollbackPlugin,
  runPluginHealth,
  setPluginSetting,
  setPluginTenantAccess,
  uninstallPlugin,
  upgradePlugin,
  type PluginSettingDefinition,
  type PluginSummary,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type LifecycleAction = "activate" | "deactivate" | "upgrade" | "rollback" | "uninstall";

interface ActionState {
  action: LifecycleAction;
  title: string;
  description: string;
  targetVersion?: string;
}

function roleFromStorage(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    return String(
      user?.role ||
        localStorage.getItem("role") ||
        localStorage.getItem("userRole") ||
        ""
    ).toUpperCase();
  } catch {
    return "";
  }
}

function statusClass(status: string): string {
  const value = status.toUpperCase();
  if (value === "ACTIVE") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (["INSTALLED", "INACTIVE", "VALIDATED"].includes(value)) {
    return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
  }
  if (["FAILED", "ROLLBACK_REQUIRED", "UNINSTALLED"].includes(value)) {
    return "border-red-400/20 bg-red-400/10 text-red-200";
  }
  return "border-amber-400/20 bg-amber-400/10 text-amber-100";
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

function parseSettingValue(definition: PluginSettingDefinition, raw: string): unknown {
  const type = String(definition.type || "TEXT").toUpperCase();
  if (type === "BOOLEAN") return raw === "true";
  if (type === "NUMBER") {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error("A valid number is required");
    return value;
  }
  if (type === "JSON") {
    return JSON.parse(raw);
  }
  return raw;
}

export default function PluginLifecycleClient({ pluginKey }: { pluginKey: string }) {
  const [role, setRole] = useState("");
  const [plugin, setPlugin] = useState<PluginSummary | null>(null);
  const [historyData, setHistoryData] = useState<PluginSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [action, setAction] = useState<ActionState | null>(null);
  const [reason, setReason] = useState("");
  const [version, setVersion] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [tenantEnabled, setTenantEnabled] = useState("true");
  const [tenantConfig, setTenantConfig] = useState("{}");
  const [tenantReason, setTenantReason] = useState("");
  const [settingKey, setSettingKey] = useState("");
  const [settingScope, setSettingScope] = useState("GLOBAL");
  const [settingTenantId, setSettingTenantId] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [settingReason, setSettingReason] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [detail, history] = await Promise.all([
        getPlugin(pluginKey),
        getPluginHistory(pluginKey),
      ]);
      setPlugin(detail);
      setHistoryData(history);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load plugin");
    } finally {
      setLoading(false);
    }
  }, [pluginKey]);

  useEffect(() => {
    setRole(roleFromStorage());
    void refresh();
  }, [refresh]);

  const selectedSetting = useMemo(
    () => plugin?.settings?.find((item) => item.settingKey === settingKey),
    [plugin?.settings, settingKey]
  );

  const alternateVersions = useMemo(
    () =>
      (plugin?.versions || []).filter(
        (item) => item.version !== plugin?.currentVersion
      ),
    [plugin?.currentVersion, plugin?.versions]
  );

  async function executeAction() {
    if (!plugin || !action) return;
    if (reason.trim().length < 5) {
      toast.error("Reason must contain at least 5 characters");
      return;
    }

    setWorking(true);
    try {
      if (action.action === "activate") {
        await activatePlugin(plugin.pluginKey, reason);
      } else if (action.action === "deactivate") {
        await deactivatePlugin(plugin.pluginKey, reason);
      } else if (action.action === "upgrade") {
        await upgradePlugin(plugin.pluginKey, version, reason);
      } else if (action.action === "rollback") {
        await rollbackPlugin(plugin.pluginKey, version, reason);
      } else {
        await uninstallPlugin(plugin.pluginKey, reason);
      }

      toast.success(`${action.title} completed`);
      setAction(null);
      setReason("");
      setVersion("");
      await refresh();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Lifecycle action failed");
    } finally {
      setWorking(false);
    }
  }

  async function executeHealth() {
    if (!plugin) return;
    setWorking(true);
    try {
      await runPluginHealth(plugin.pluginKey);
      toast.success("Health checks completed");
      await refresh();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Health check failed");
    } finally {
      setWorking(false);
    }
  }

  async function saveTenantAccess() {
    if (!plugin || !tenantId.trim()) {
      toast.error("Tenant ID is required");
      return;
    }
    if (tenantReason.trim().length < 5) {
      toast.error("Reason must contain at least 5 characters");
      return;
    }

    setWorking(true);
    try {
      const configuration = tenantConfig.trim() ? JSON.parse(tenantConfig) : {};
      await setPluginTenantAccess({
        pluginKey: plugin.pluginKey,
        tenantId: tenantId.trim(),
        enabled: tenantEnabled === "true",
        configuration,
        reason: tenantReason,
      });
      toast.success("Tenant access updated");
      setTenantReason("");
      await refresh();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Tenant update failed");
    } finally {
      setWorking(false);
    }
  }

  async function saveSetting() {
    if (!plugin || !selectedSetting) {
      toast.error("Select a registered setting");
      return;
    }
    if (settingScope === "TENANT" && !settingTenantId.trim()) {
      toast.error("Tenant ID is required for tenant settings");
      return;
    }
    if (settingReason.trim().length < 5) {
      toast.error("Reason must contain at least 5 characters");
      return;
    }

    setWorking(true);
    try {
      await setPluginSetting({
        pluginKey: plugin.pluginKey,
        settingKey: selectedSetting.settingKey,
        scope: settingScope,
        tenantId: settingScope === "TENANT" ? settingTenantId.trim() : undefined,
        value: parseSettingValue(selectedSetting, settingValue),
        reason: settingReason,
      });
      toast.success("Plugin setting saved");
      setSettingReason("");
      await refresh();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Setting update failed");
    } finally {
      setWorking(false);
    }
  }

  if (role && role !== "SUPER_ADMIN") {
    return (
      <AdminPage>
        <AdminHeader
          eyebrow="Restricted system area"
          title="SUPER_ADMIN access required"
          description="Plugin lifecycle actions are restricted to the platform owner."
        />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin Manager / Lifecycle"
        title={plugin?.name || pluginKey}
        description={plugin?.description || "Manage the controlled lifecycle of this plugin."}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/system/plugin-manager">Back to plugins</Link>
            </Button>
            <Button variant="outline" onClick={() => void refresh()} disabled={loading || working}>
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
              <h2 className="font-black">Plugin details unavailable</h2>
              <p className="mt-1 text-sm text-red-100/70">{error}</p>
            </div>
          </div>
        </AdminCard>
      ) : null}

      {loading ? (
        <AdminCard className="flex min-h-56 items-center justify-center gap-3 p-8 text-white/55">
          <Loader2 className="animate-spin" />
          Loading lifecycle data…
        </AdminCard>
      ) : plugin ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Status</p>
              <Badge className={`mt-3 ${statusClass(plugin.status)}`}>{plugin.status}</Badge>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Version</p>
              <p className="mt-2 text-xl font-black text-white">{plugin.currentVersion || "Not installed"}</p>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Tenant scope</p>
              <p className="mt-2 text-xl font-black text-white">{plugin.tenantScope || "—"}</p>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Vendor</p>
              <p className="mt-2 text-xl font-black text-white">{plugin.vendorKey || "—"}</p>
            </AdminCard>
          </div>

          <AdminCard className="space-y-5 p-6">
            <div>
              <h2 className="text-lg font-black text-white">Lifecycle controls</h2>
              <p className="mt-1 text-sm text-white/45">
                Every mutation is server-authorized, reason-gated and audit logged.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["INSTALLED", "INACTIVE"].includes(plugin.status) ? (
                <Button onClick={() => setAction({
                  action: "activate",
                  title: "Activate plugin",
                  description: "Enable this plugin globally after dependency and health validation.",
                })}>
                  <PlayCircle /> Activate
                </Button>
              ) : null}
              {plugin.status === "ACTIVE" ? (
                <Button variant="outline" onClick={() => setAction({
                  action: "deactivate",
                  title: "Deactivate plugin",
                  description: "Disable the plugin globally. Active dependants may block this action.",
                })}>
                  <PauseCircle /> Deactivate
                </Button>
              ) : null}
              {alternateVersions.length ? (
                <Button variant="outline" onClick={() => {
                  setVersion(alternateVersions[0]?.version || "");
                  setAction({
                    action: "upgrade",
                    title: "Change plugin version",
                    description: "Move to another registered version. The plugin will become inactive.",
                  });
                }}>
                  <ArrowDownToLine /> Upgrade
                </Button>
              ) : null}
              {alternateVersions.length ? (
                <Button variant="outline" onClick={() => {
                  setVersion(alternateVersions[0]?.version || "");
                  setAction({
                    action: "rollback",
                    title: "Rollback plugin",
                    description: "Restore a registered previous version and record a rollback event.",
                  });
                }}>
                  <RotateCcw /> Rollback
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => void executeHealth()} disabled={working}>
                <Activity /> Run health
              </Button>
              {plugin.status !== "ACTIVE" && plugin.status !== "UNINSTALLED" ? (
                <Button variant="destructive" onClick={() => setAction({
                  action: "uninstall",
                  title: "Uninstall plugin",
                  description: "Remove plugin availability while preserving plugin business data.",
                })}>
                  <Trash2 /> Uninstall
                </Button>
              ) : null}
            </div>
          </AdminCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminCard className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Users className="text-cyan-300" />
                <div>
                  <h2 className="font-black text-white">Tenant assignment</h2>
                  <p className="text-sm text-white/45">Assign or revoke plugin availability for a tenant.</p>
                </div>
              </div>
              <Input value={tenantId} onChange={(event) => setTenantId(event.target.value)} placeholder="Tenant ID" />
              <Select value={tenantEnabled} onValueChange={setTenantEnabled}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                className="min-h-28 font-mono text-xs"
                value={tenantConfig}
                onChange={(event) => setTenantConfig(event.target.value)}
                placeholder='{"featureMode":"standard"}'
              />
              <Textarea
                value={tenantReason}
                onChange={(event) => setTenantReason(event.target.value)}
                placeholder="Reason for tenant access change"
              />
              <Button onClick={() => void saveTenantAccess()} disabled={working}>
                <Save /> Save tenant access
              </Button>
            </AdminCard>

            <AdminCard className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Settings2 className="text-cyan-300" />
                <div>
                  <h2 className="font-black text-white">Plugin settings</h2>
                  <p className="text-sm text-white/45">Only registered setting definitions can be saved.</p>
                </div>
              </div>
              <Select value={settingKey} onValueChange={(value) => {
                setSettingKey(value);
                const definition = plugin.settings?.find((item) => item.settingKey === value);
                setSettingScope(definition?.scope || "GLOBAL");
              }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a setting" /></SelectTrigger>
                <SelectContent>
                  {(plugin.settings || []).map((item) => (
                    <SelectItem key={item.id} value={item.settingKey}>
                      {item.label || item.settingKey}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={settingScope} onValueChange={setSettingScope}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                </SelectContent>
              </Select>
              {settingScope === "TENANT" ? (
                <Input value={settingTenantId} onChange={(event) => setSettingTenantId(event.target.value)} placeholder="Tenant ID" />
              ) : null}
              <Textarea
                value={settingValue}
                onChange={(event) => setSettingValue(event.target.value)}
                placeholder="Setting value"
              />
              <Textarea
                value={settingReason}
                onChange={(event) => setSettingReason(event.target.value)}
                placeholder="Reason for setting change"
              />
              <Button onClick={() => void saveSetting()} disabled={working || !selectedSetting}>
                <Save /> Save setting
              </Button>
            </AdminCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminCard className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <Activity className="text-cyan-300" />
                <h2 className="font-black text-white">Health checks</h2>
              </div>
              <div className="space-y-3">
                {(plugin.healthChecks || []).length ? plugin.healthChecks?.map((check, index) => {
                  const state = String(check.lastStatus || check.status || "PENDING").toUpperCase();
                  return (
                    <div key={check.id || check.checkKey || index} className="rounded-xl border border-white/10 bg-black/15 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-white">{check.checkKey || check.key || "Health check"}</p>
                        <Badge className={statusClass(state)}>{state}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-white/45">{check.lastMessage || check.message || "Not executed"}</p>
                      <p className="mt-2 text-xs text-white/30">{formatDate(check.checkedAt)}</p>
                    </div>
                  );
                }) : <p className="text-sm text-white/45">No health checks registered.</p>}
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <History className="text-cyan-300" />
                <h2 className="font-black text-white">Version history</h2>
              </div>
              <div className="space-y-3">
                {(historyData?.versions || plugin.versions || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/15 p-4">
                    <div>
                      <p className="font-bold text-white">{item.version}</p>
                      <p className="text-xs text-white/35">{formatDate(item.createdAt)}</p>
                    </div>
                    {item.version === plugin.currentVersion ? <Badge>Current</Badge> : null}
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>

          <AdminTable>
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Clock3 className="text-cyan-300" />
                <h2 className="font-black text-white">Audit timeline</h2>
              </div>
            </div>
            {(historyData?.auditEvents || plugin.auditEvents || []).length ? (
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-5 py-4">Time</th>
                    <th className="px-5 py-4">Action</th>
                    <th className="px-5 py-4">Outcome</th>
                    <th className="px-5 py-4">Reason</th>
                    <th className="px-5 py-4">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {(historyData?.auditEvents || plugin.auditEvents || []).map((event) => (
                    <tr key={event.id}>
                      <td className="px-5 py-4 text-white/45">{formatDate(event.createdAt)}</td>
                      <td className="px-5 py-4 font-bold text-white">{event.action}</td>
                      <td className="px-5 py-4">
                        <Badge className={statusClass(event.outcome)}>{event.outcome}</Badge>
                      </td>
                      <td className="px-5 py-4 text-white/55">{event.reason || "—"}</td>
                      <td className="px-5 py-4 font-mono text-xs text-white/40">{event.actorId || "system"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-sm text-white/45">No lifecycle audit events recorded.</div>
            )}
          </AdminTable>
        </>
      ) : null}

      <Dialog open={Boolean(action)} onOpenChange={(open) => {
        if (!open && !working) {
          setAction(null);
          setReason("");
          setVersion("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="text-amber-400" />
              {action?.title}
            </DialogTitle>
            <DialogDescription>{action?.description}</DialogDescription>
          </DialogHeader>

          {action && ["upgrade", "rollback"].includes(action.action) ? (
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select target version" /></SelectTrigger>
              <SelectContent>
                {alternateVersions.map((item) => (
                  <SelectItem key={item.id} value={item.version}>{item.version}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Required reason (minimum 5 characters)"
            className="min-h-28"
          />

          {action?.action === "uninstall" ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
              The server preserves plugin business data. Physical file removal remains controlled by the approved installer workflow.
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={working}>Cancel</Button>
            <Button
              variant={action?.action === "uninstall" ? "destructive" : "default"}
              onClick={() => void executeAction()}
              disabled={working || reason.trim().length < 5 || (
                Boolean(action && ["upgrade", "rollback"].includes(action.action)) && !version
              )}
            >
              {working ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Confirm action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
