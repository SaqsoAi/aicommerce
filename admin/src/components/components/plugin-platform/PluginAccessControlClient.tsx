"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  evaluatePluginAccess,
  getTenantPluginAccessMatrix,
  invalidatePluginAccessCache,
  type PluginEffectiveAccess,
} from "@/api/pluginPlatform.api";
import AdminCard from "@/components/ui/AdminCard";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminPage from "@/components/ui/AdminPage";
import AdminTable from "@/components/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function tone(allowed: boolean): string {
  return allowed
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-red-400/20 bg-red-400/10 text-red-200";
}

export default function PluginAccessControlClient() {
  const [tenantId, setTenantId] = useState("");
  const [pluginKey, setPluginKey] = useState("");
  const [results, setResults] = useState<PluginEffectiveAccess[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadMatrix() {
    if (!tenantId.trim()) {
      toast.error("Tenant ID is required");
      return;
    }
    setLoading(true);
    try {
      setResults(await getTenantPluginAccessMatrix(tenantId.trim()));
      toast.success("Effective access evaluated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  }

  async function evaluateOne() {
    if (!tenantId.trim() || !pluginKey.trim()) {
      toast.error("Plugin key and tenant ID are required");
      return;
    }
    setLoading(true);
    try {
      const result = await evaluatePluginAccess(pluginKey.trim(), tenantId.trim(), true);
      setResults([result]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  }

  async function invalidate() {
    setLoading(true);
    try {
      const result = await invalidatePluginAccessCache({
        pluginKey: pluginKey.trim() || undefined,
        tenantId: tenantId.trim() || undefined,
      });
      toast.success(`${result.invalidated} cache entr${result.invalidated === 1 ? "y" : "ies"} invalidated`);
      if (tenantId.trim()) await loadMatrix();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cache invalidation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin Manager / Tenant Access"
        title="Tenant Plugin Availability"
        description="Explain effective access from global state, tenant assignment, subscription, entitlements, feature flags, dependencies and required configuration."
        actions={
          <Button variant="outline" onClick={() => void invalidate()} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Invalidate cache
          </Button>
        }
      />

      <AdminCard className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto_auto]">
        <Input
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
          placeholder="Tenant ID"
        />
        <Input
          value={pluginKey}
          onChange={(event) => setPluginKey(event.target.value)}
          placeholder="Plugin key (optional for matrix)"
        />
        <Button onClick={() => void evaluateOne()} disabled={loading}>
          <Search /> Evaluate plugin
        </Button>
        <Button variant="outline" onClick={() => void loadMatrix()} disabled={loading}>
          <ShieldCheck /> Tenant matrix
        </Button>
      </AdminCard>

      {loading ? (
        <AdminCard className="flex min-h-44 items-center justify-center gap-3 p-8 text-white/55">
          <Loader2 className="animate-spin" />
          Evaluating access gates…
        </AdminCard>
      ) : null}

      {!loading && results.map((result) => (
        <AdminCard key={`${result.pluginKey}:${result.tenantId}`} className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">{result.pluginKey}</h2>
              <p className="mt-1 font-mono text-xs text-white/40">{result.tenantId}</p>
            </div>
            <Badge className={tone(result.allowed)}>
              {result.allowed ? "ALLOWED" : "DENIED"}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {result.reasons.map((reason) => (
              <div
                key={reason.code}
                className={`rounded-xl border p-4 ${
                  reason.allowed
                    ? "border-emerald-400/15 bg-emerald-400/[0.06]"
                    : "border-red-400/15 bg-red-400/[0.06]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {reason.allowed ? (
                    <CheckCircle2 className="text-emerald-300" size={18} />
                  ) : (
                    <XCircle className="text-red-300" size={18} />
                  )}
                  <p className="font-black text-white">{reason.code}</p>
                </div>
                <p className="mt-2 text-sm text-white/55">{reason.message}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/30">
            Evaluated {new Date(result.evaluatedAt).toLocaleString()} · cache TTL{" "}
            {result.cacheTtlSeconds}s
          </p>
        </AdminCard>
      ))}

      {!loading && !results.length ? (
        <AdminCard className="p-8">
          <div className="flex gap-3 text-white/55">
            <AlertTriangle />
            <p>Enter a tenant ID to evaluate effective plugin availability.</p>
          </div>
        </AdminCard>
      ) : null}
    </AdminPage>
  );
}
