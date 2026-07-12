"use client";

import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  FileArchive,
  GitBranch,
  HeartPulse,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  approveInstallationPlan,
  createInstallationPlan,
  executePluginTransaction,
  listPlugins,
  validatePluginArchive,
  validatePluginManifest,
  type ArchiveValidationResult,
  type InstallationPlan,
  type ManifestValidationResult,
  type PluginSummary,
  type ValidationIssue,
} from "@/api/pluginPlatform.api";
import AdminCard from "@/components/ui/AdminCard";
import AdminEmpty from "@/components/ui/AdminEmpty";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminPage from "@/components/ui/AdminPage";
import AdminTable from "@/components/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type PluginManagerMode =
  | "overview"
  | "installed"
  | "install"
  | "updates"
  | "dependencies"
  | "health"
  | "settings";

const nav = [
  ["Transactions", "/system/plugin-manager/transactions"],
  ["Tenant Access", "/system/plugin-manager/access"],
  ["Registry", "/system/plugin-manager/registry"],
  ["Configuration", "/system/plugin-manager/configuration"],
  ["Health Orchestration", "/system/plugin-manager/health-orchestration"],
  ["Marketplace", "/system/plugin-manager/marketplace"],
  ["Guidance", "/system/plugin-manager/guidance"],
] as const;

function getStoredRole(): string {
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

function statusTone(status: string): string {
  const value = status.toUpperCase();
  if (["ACTIVE", "INSTALLED", "VALIDATED"].includes(value)) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }
  if (["FAILED", "ROLLBACK_REQUIRED"].includes(value)) {
    return "border-red-400/20 bg-red-400/10 text-red-200";
  }
  if (["PLANNED", "INSTALLING"].includes(value)) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  }
  return "border-white/10 bg-white/5 text-white/60";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.slice(value.indexOf(",") + 1) : value);
    };
    reader.readAsDataURL(file);
  });
}

function Issues({ issues }: { issues: ValidationIssue[] }) {
  if (!issues.length) return null;
  return (
    <div className="space-y-2">
      {issues.map((issue, index) => (
        <div
          key={`${issue.code}-${issue.path || ""}-${index}`}
          className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100"
        >
          <strong>{issue.code}</strong>
          {issue.path ? <span className="ml-2 text-red-200/70">{issue.path}</span> : null}
          <p className="mt-1 text-red-100/80">{issue.message}</p>
        </div>
      ))}
    </div>
  );
}

export default function PluginManagerClient({ mode }: { mode: PluginManagerMode }) {
  const [role, setRole] = useState("");
  const [plugins, setPlugins] = useState<PluginSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState("");
  const [archive, setArchive] = useState<File | null>(null);
  const [archiveResult, setArchiveResult] = useState<ArchiveValidationResult | null>(null);
  const [archiveBase64, setArchiveBase64] = useState("");
  const [manifestText, setManifestText] = useState("");
  const [manifestResult, setManifestResult] = useState<ManifestValidationResult | null>(null);
  const [plan, setPlan] = useState<InstallationPlan | null>(null);
  const [working, setWorking] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setPlugins(await listPlugins());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load plugins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRole(getStoredRole());
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return plugins;
    return plugins.filter((plugin) =>
      [plugin.name, plugin.pluginKey, plugin.vendorKey, plugin.status]
        .filter(Boolean)
        .some((entry) => String(entry).toLowerCase().includes(value))
    );
  }, [plugins, query]);

  if (role && role !== "SUPER_ADMIN") {
    return (
      <AdminPage>
        <AdminHeader
          eyebrow="Restricted system area"
          title="SUPER_ADMIN access required"
          description="Plugin installation and platform lifecycle operations are not available to tenant or store administrators."
        />
        <AdminCard className="p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 text-amber-300" />
            <div>
              <h2 className="text-lg font-black text-white">Access denied</h2>
              <p className="mt-2 text-sm text-white/55">
                Sign in with an authorized SUPER_ADMIN account. This client-side guard complements
                the server-side SUPER_ADMIN permission middleware.
              </p>
            </div>
          </div>
        </AdminCard>
      </AdminPage>
    );
  }

  const active = plugins.filter((plugin) => plugin.status === "ACTIVE").length;
  const unhealthy = plugins.filter((plugin) =>
    plugin.healthChecks?.some((check) => String(check.status).toUpperCase() === "FAILED")
  ).length;
  const planned = plugins.filter((plugin) => plugin.status === "PLANNED").length;

  async function handleArchive(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setArchive(file);
    setArchiveResult(null);
    setPlan(null);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Only .zip plugin packages are accepted");
      return;
    }
    setWorking(true);
    try {
      const encoded = await fileToBase64(file);
      setArchiveBase64(encoded);
      const result = await validatePluginArchive(encoded);
      setArchiveResult(result);

      if (result.success && result.manifest) {
        const formattedManifest = JSON.stringify(result.manifest, null, 2);
        setManifestText(formattedManifest);
        setManifestResult({
          success: true,
          manifest: result.manifest,
          issues: [],
        });
        toast.success("ZIP and embedded manifest validation passed");
      } else if (result.success) {
        setManifestResult(null);
        toast.success("Archive security validation passed");
      } else {
        setManifestResult(null);
        toast.error("Archive validation failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Archive validation failed");
    } finally {
      setWorking(false);
    }
  }

  async function validateManifest() {
    setWorking(true);
    setManifestResult(null);
    setPlan(null);
    try {
      const parsed = JSON.parse(manifestText) as Record<string, unknown>;
      const result = await validatePluginManifest(parsed);
      setManifestResult(result);
      result.success ? toast.success("Manifest validation passed") : toast.error("Manifest validation failed");
    } catch (error) {
      const issue = {
        code: "PKG_MANIFEST_JSON",
        message: error instanceof Error ? error.message : "Manifest JSON is invalid",
      };
      setManifestResult({ success: false, issues: [issue] });
      toast.error(issue.message);
    } finally {
      setWorking(false);
    }
  }

  async function executeApprovedPlan() {
    if (!plan || !archiveBase64) {
      toast.error("A validated archive and installation plan are required");
      return;
    }

    const reason = window.prompt(
      "Enter the SUPER_ADMIN reason for approving and executing this installation plan:"
    )?.trim();

    if (!reason || reason.length < 5) {
      toast.error("Reason must contain at least 5 characters");
      return;
    }

    setWorking(true);
    try {
      await approveInstallationPlan(plan.fingerprint, reason);
      const transaction = await executePluginTransaction({
        planFingerprint: plan.fingerprint,
        archiveBase64,
        reason,
      });
      toast.success("Installation transaction started");
      window.location.assign(
        `/system/plugin-manager/transactions/${encodeURIComponent(transaction.id)}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to execute installation transaction"
      );
    } finally {
      setWorking(false);
    }
  }

  async function generatePlan() {
    if (!archiveResult?.success || !archiveResult.sha256) {
      toast.error("Validate the plugin ZIP first");
      return;
    }
    try {
      const manifest = JSON.parse(manifestText) as Record<string, unknown>;
      setWorking(true);
      const result = await createInstallationPlan({
        manifest,
        packageSha256: archiveResult.sha256,
      });
      if (!result.success || !result.plan) {
        setManifestResult({ success: false, issues: result.issues || [] });
        toast.error("Installation plan was rejected");
        return;
      }
      setPlan(result.plan);
      toast.success("Immutable installation plan created");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create installation plan");
    } finally {
      setWorking(false);
    }
  }

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin platform"
        title="Plugin Manager"
        description="Validate declarative plugin packages, review compatibility and dependencies, create immutable installation plans, and monitor platform-owned plugin health."
        actions={
          <>
            <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/system/plugin-manager/install">
                <UploadCloud />
                Install Plugin
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-2">
        {nav.map(([label, href]) => (
          <Button key={href} asChild variant={mode.toLowerCase() === label.toLowerCase() ? "default" : "ghost"}>
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </div>

      {mode === "install" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <AdminCard className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <FileArchive className="text-cyan-300" />
              <div>
                <h2 className="font-black text-white">1. Validate plugin ZIP</h2>
                <p className="text-sm text-white/45">Archive remains non-executable and is checked by the server foundation.</p>
              </div>
            </div>
            <Input type="file" accept=".zip,application/zip" onChange={handleArchive} disabled={working} />
            {archive ? <p className="text-xs text-white/50">{archive.name} · {(archive.size / 1024 / 1024).toFixed(2)} MiB</p> : null}
            {archiveResult ? (
              <div className={`rounded-2xl border p-4 ${archiveResult.success ? "border-emerald-400/20 bg-emerald-400/10" : "border-red-400/20 bg-red-400/10"}`}>
                <div className="flex items-center gap-2 font-bold text-white">
                  {archiveResult.success ? <CheckCircle2 className="text-emerald-300" /> : <XCircle className="text-red-300" />}
                  {archiveResult.success ? "Archive validation passed" : "Archive validation failed"}
                </div>
                {archiveResult.sha256 ? <p className="mt-2 break-all font-mono text-xs text-white/55">SHA-256: {archiveResult.sha256}</p> : null}
                <p className="mt-2 text-xs text-white/50">{archiveResult.entries?.length || 0} declared archive entries inspected</p>
              </div>
            ) : null}
            <Issues issues={archiveResult?.issues || []} />
          </AdminCard>

          <AdminCard className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-cyan-300" />
              <div>
                <h2 className="font-black text-white">2. Validate manifest and plan</h2>
                <p className="text-sm text-white/45">
                  Selecting a valid plugin ZIP automatically loads its embedded plugin.manifest.json.
                  Manual JSON selection remains available only as a fallback.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] p-3 text-xs text-cyan-100/75">
              {manifestResult?.success
                ? "Embedded manifest loaded and validated from the selected ZIP."
                : "Choose a plugin ZIP in Step 1. The embedded manifest will appear below automatically."}
            </div>
            <Input
              type="file"
              accept=".json,application/json"
              aria-label="Optional manual manifest fallback"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void file.text().then(setManifestText);
              }}
            />
            <Textarea
              value={manifestText}
              onChange={(event) => setManifestText(event.target.value)}
              placeholder='{"schemaVersion":"1.0","pluginKey":"vendor.plugin",...}'
              className="min-h-64 font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={validateManifest} disabled={working || !manifestText.trim()}>
                {working ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                Validate Manifest
              </Button>
              <Button
                onClick={generatePlan}
                disabled={working || !manifestResult?.success || !archiveResult?.success}
              >
                <GitBranch />
                Create Installation Plan
              </Button>
            </div>
            <Issues issues={manifestResult?.issues || []} />
          </AdminCard>

          {plan ? (
            <AdminCard className="space-y-4 p-6 xl:col-span-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-300" />
                <div>
                  <h2 className="font-black text-white">Installation plan created</h2>
                  <p className="text-sm text-white/45">Planning does not install or execute the package.</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Plugin", plan.pluginKey],
                  ["Version", plan.version],
                  ["Files", String(plan.files.length)],
                  ["Dependencies", String(plan.dependencies.length)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-black/15 p-4">
                    <p className="text-xs uppercase tracking-wider text-white/35">{label}</p>
                    <p className="mt-1 break-all font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <p className="break-all rounded-xl bg-black/20 p-3 font-mono text-xs text-white/55">
                Fingerprint: {plan.fingerprint}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void executeApprovedPlan()} disabled={working || !archiveBase64}>
                  <ShieldCheck />
                  Approve & Execute Transaction
                </Button>
                <Button asChild variant="outline">
                  <Link href="/system/plugin-manager/transactions">
                    Transaction Monitor
                  </Link>
                </Button>
              </div>
              {(plan.requiresRestart || plan.requiresRebuild) ? (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  This plan requires {plan.requiresRestart ? "application restart" : ""}
                  {plan.requiresRestart && plan.requiresRebuild ? " and " : ""}
                  {plan.requiresRebuild ? "reviewed rebuild" : ""}. No runtime code is loaded from the archive.
                </div>
              ) : null}
            </AdminCard>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(
              [
                { label: "Registered", value: plugins.length, icon: Package },
                { label: "Active", value: active, icon: CheckCircle2 },
                { label: "Planned", value: planned, icon: GitBranch },
                { label: "Unhealthy", value: unhealthy, icon: HeartPulse },
              ] as Array<{
                label: string;
                value: number;
                icon: typeof Package;
              }>
            ).map(({ label, value, icon: CardIcon }) => (
              <AdminCard key={label} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-black text-white">{value}</p>
                  </div>
                  <CardIcon className="text-cyan-300" />
                </div>
              </AdminCard>
            ))}
          </div>

          <AdminCard className="p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={18} />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search plugin key, vendor, status..."
                className="pl-10"
              />
            </div>
          </AdminCard>

          {loadError ? (
            <AdminCard className="border-red-400/20 p-6">
              <div className="flex gap-3 text-red-100">
                <AlertTriangle />
                <div>
                  <h2 className="font-black">Plugin API unavailable</h2>
                  <p className="mt-1 text-sm text-red-100/70">{loadError}</p>
                </div>
              </div>
            </AdminCard>
          ) : null}

          <AdminTable>
            {loading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-white/55">
                <Loader2 className="animate-spin" /> Loading plugin registry…
              </div>
            ) : filtered.length ? (
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-5 py-4">Plugin</th>
                    <th className="px-5 py-4">Vendor</th>
                    <th className="px-5 py-4">Version</th>
                    <th className="px-5 py-4">Scope</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {filtered.map((plugin) => {
                    const failedHealth = plugin.healthChecks?.filter(
                      (check) => String(check.status).toUpperCase() === "FAILED"
                    ).length || 0;
                    return (
                      <tr key={plugin.id} className="hover:bg-white/[0.025]">
                        <td className="px-5 py-4">
                          <Link
                            href={`/system/plugin-manager/${encodeURIComponent(plugin.pluginKey)}`}
                            className="font-black text-white hover:text-cyan-200"
                          >
                            {plugin.name}
                          </Link>
                          <p className="mt-1 font-mono text-xs text-white/40">{plugin.pluginKey}</p>
                        </td>
                        <td className="px-5 py-4 text-white/60">{plugin.vendorKey || "—"}</td>
                        <td className="px-5 py-4 text-white/60">{plugin.versions?.[0]?.version || "—"}</td>
                        <td className="px-5 py-4 text-white/60">{plugin.tenantScope || "—"}</td>
                        <td className="px-5 py-4">
                          <Badge className={statusTone(plugin.status)}>{plugin.status}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <span className={failedHealth ? "text-red-300" : "text-emerald-300"}>
                            {failedHealth ? `${failedHealth} failed` : "Healthy"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <AdminEmpty
                title="No plugins found"
                description="Validated plugins and generated installation plans will appear here."
              />
            )}
          </AdminTable>

          {["updates", "dependencies", "health", "settings"].includes(mode) ? (
            <AdminCard className="p-6">
              <div className="flex items-start gap-3">
                {mode === "dependencies" ? <GitBranch className="text-cyan-300" /> :
                 mode === "health" ? <Activity className="text-cyan-300" /> :
                 mode === "settings" ? <Settings2 className="text-cyan-300" /> :
                 <RefreshCw className="text-cyan-300" />}
                <div>
                  <h2 className="font-black text-white">
                    {mode === "dependencies" ? "Dependency registry" :
                     mode === "health" ? "Plugin health center" :
                     mode === "settings" ? "Plugin platform settings" :
                     "Available updates"}
                  </h2>
                  <p className="mt-2 text-sm text-white/50">
                    This view uses the P3 read APIs. Activation, upgrade, rollback, uninstall,
                    tenant assignment and editable settings remain disabled until their approved
                    server lifecycle endpoints are implemented.
                  </p>
                </div>
              </div>
            </AdminCard>
          ) : null}
        </>
      )}
    </AdminPage>
  );
}
