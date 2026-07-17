"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getPluginRegistryHealth,
  getPluginRegistrySnapshot,
  invalidatePluginRegistryCache,
  resolvePluginRegistry,
  type PluginRegistryEntry,
  type PluginRegistryHealth,
  type PluginRegistrySnapshot,
  type PluginRegistryType,
} from "@/api/pluginPlatform.api";
import AdminCard from "@/components/ui/AdminCard";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminPage from "@/components/ui/AdminPage";
import AdminTable from "@/components/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES: PluginRegistryType[] = [
  "MENU",
  "PERMISSION",
  "WIDGET",
  "SETTING",
  "EVENT",
  "CAPABILITY",
];

function tone(enabled: boolean): string {
  return enabled
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-red-400/20 bg-red-400/10 text-red-200";
}

export default function PluginRegistryInspectorClient() {
  const [snapshot, setSnapshot] = useState<PluginRegistrySnapshot | null>(null);
  const [health, setHealth] = useState<PluginRegistryHealth | null>(null);
  const [entries, setEntries] = useState<PluginRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState("");
  const [role, setRole] = useState("");
  const [registryType, setRegistryType] = useState<"ALL" | PluginRegistryType>("ALL");
  const [query, setQuery] = useState("");

  async function load(refresh = false) {
    setLoading(true);
    try {
      const [nextSnapshot, nextHealth] = await Promise.all([
        getPluginRegistrySnapshot(refresh),
        getPluginRegistryHealth(refresh),
      ]);
      setSnapshot(nextSnapshot);
      setHealth(nextHealth);
      setEntries(nextSnapshot.entries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registry load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function resolve() {
    setLoading(true);
    try {
      const result = await resolvePluginRegistry({
        tenantId: tenantId.trim() || undefined,
        role: role.trim() || undefined,
        registryType: registryType === "ALL" ? undefined : registryType,
        refresh: true,
      });
      setEntries(result.entries);
      toast.success(`Resolved ${result.entries.length} registry entries`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registry resolution failed");
    } finally {
      setLoading(false);
    }
  }

  async function invalidate() {
    setLoading(true);
    try {
      const result = await invalidatePluginRegistryCache();
      toast.success(`${result.invalidated} registry cache entr${result.invalidated === 1 ? "y" : "ies"} invalidated`);
      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cache invalidation failed");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return entries;
    return entries.filter((entry) =>
      [
        entry.key,
        entry.pluginKey,
        entry.registryType,
        entry.adapterKey,
        entry.routeKey,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(value))
    );
  }, [entries, query]);

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin Manager / Registry"
        title="Runtime Registry Inspector"
        description="Inspect host-controlled menus, permissions, widgets, settings, events and capabilities. Registry metadata never loads arbitrary plugin code."
        actions={
          <>
            <Button variant="outline" onClick={() => void load(true)} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => void invalidate()} disabled={loading}>
              <ShieldCheck />
              Invalidate cache
            </Button>
          </>
        }
      />

      {loading ? (
        <AdminCard className="flex min-h-40 items-center justify-center gap-3 p-8 text-white/55">
          <Loader2 className="animate-spin" />
          Building registry snapshot…
        </AdminCard>
      ) : null}

      {health ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Health</p>
            <Badge className={`mt-3 ${tone(health.healthy)}`}>
              {health.healthy ? "HEALTHY" : "CONFLICTED"}
            </Badge>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Active plugins</p>
            <p className="mt-2 text-3xl font-black text-white">{health.plugins}</p>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Entries</p>
            <p className="mt-2 text-3xl font-black text-white">{health.enabledEntries}/{health.entries}</p>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Issues</p>
            <p className="mt-2 text-3xl font-black text-white">{health.errors + health.warnings}</p>
          </AdminCard>
        </div>
      ) : null}

      <AdminCard className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_220px_auto]">
        <Input value={tenantId} onChange={(event) => setTenantId(event.target.value)} placeholder="Tenant ID (optional)" />
        <Input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Role (optional)" />
        <Select value={registryType} onValueChange={(value) => setRegistryType(value as "ALL" | PluginRegistryType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All registry types</SelectItem>
            {TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => void resolve()} disabled={loading}>
          <Filter /> Resolve
        </Button>
      </AdminCard>

      <AdminCard className="p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={18} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search key, plugin, adapter or route…" className="pl-10" />
        </div>
      </AdminCard>

      {snapshot?.issues.length ? (
        <AdminCard className="space-y-3 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-300" />
            <h2 className="font-black text-white">Registry issues</h2>
          </div>
          {snapshot.issues.map((issue, index) => (
            <div key={`${issue.code}-${issue.registrationKey || index}`} className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
              <div className="flex items-center gap-2">
                {issue.severity === "ERROR" ? <XCircle className="text-red-300" size={18} /> : <AlertTriangle className="text-amber-300" size={18} />}
                <p className="font-black text-white">{issue.code}</p>
              </div>
              <p className="mt-2 text-sm text-white/60">{issue.message}</p>
              <p className="mt-2 font-mono text-xs text-white/35">{issue.pluginKey} · {issue.registrationKey || "—"}</p>
            </div>
          ))}
        </AdminCard>
      ) : null}

      <AdminTable>
        {filtered.length ? (
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Key</th>
                <th className="px-5 py-4">Plugin</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Adapter / Route</th>
                <th className="px-5 py-4">Permission</th>
                <th className="px-5 py-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {filtered.map((entry) => (
                <tr key={`${entry.registryType}:${entry.key}:${entry.pluginKey}`}>
                  <td className="px-5 py-4"><Badge>{entry.registryType}</Badge></td>
                  <td className="px-5 py-4 font-mono text-xs text-white/70">{entry.key}</td>
                  <td className="px-5 py-4 text-white/60">{entry.pluginKey}</td>
                  <td className="px-5 py-4 text-white/55">{entry.priority}</td>
                  <td className="px-5 py-4 font-mono text-xs text-white/45">{entry.adapterKey || entry.routeKey || "—"}</td>
                  <td className="px-5 py-4 font-mono text-xs text-white/45">{entry.permission || "—"}</td>
                  <td className="px-5 py-4">
                    <Badge className={tone(entry.enabled)}>
                      {entry.enabled ? <CheckCircle2 className="mr-1" size={14} /> : <XCircle className="mr-1" size={14} />}
                      {entry.enabled ? "ENABLED" : "BLOCKED"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-sm text-white/45">No registry entries match the current filters.</div>
        )}
      </AdminTable>

      {snapshot ? (
        <p className="break-all font-mono text-xs text-white/30">
          Snapshot {snapshot.version} · generated {new Date(snapshot.generatedAt).toLocaleString()}
        </p>
      ) : null}
    </AdminPage>
  );
}
