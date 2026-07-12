"use client";

import {
  BadgeCheck,
  Download,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  authorizeMarketplaceDownload,
  getMarketplaceCatalog,
  getMarketplaceRepositories,
  getMarketplaceVendors,
  type MarketplaceEntry,
  type MarketplaceRepository,
  type MarketplaceVendor,
} from "@/api/pluginPlatform.api";
import AdminCard from "@/components/ui/AdminCard";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminPage from "@/components/ui/AdminPage";
import AdminTable from "@/components/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function tone(decision: string): string {
  if (decision === "TRUSTED") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (decision === "TRUSTED_WITH_WARNING") return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  return "border-red-400/20 bg-red-400/10 text-red-200";
}

export default function PluginMarketplaceClient() {
  const [entries, setEntries] = useState<MarketplaceEntry[]>([]);
  const [vendors, setVendors] = useState<MarketplaceVendor[]>([]);
  const [repositories, setRepositories] = useState<MarketplaceRepository[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [catalog, vendorRows, repositoryRows] = await Promise.all([
        getMarketplaceCatalog(),
        getMarketplaceVendors(),
        getMarketplaceRepositories(),
      ]);
      setEntries(catalog);
      setVendors(vendorRows);
      setRepositories(repositoryRows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Marketplace load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function authorize(entry: MarketplaceEntry) {
    const reason = window.prompt("Enter the SUPER_ADMIN reason for authorizing this package download:")?.trim();
    if (!reason || reason.length < 5) {
      toast.error("Reason must contain at least 5 characters");
      return;
    }
    setLoading(true);
    try {
      const result = await authorizeMarketplaceDownload(entry.id, reason);
      toast.success(`Download authorized. SHA-256: ${result.packageSha256.slice(0, 16)}…`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download blocked");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin Manager / Marketplace"
        title="Signed Plugin Marketplace"
        description="Review trusted vendors, signing keys, repositories, release channels and package provenance. Authorized downloads still require the controlled installation workflow."
        actions={
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard className="p-5">
          <Store className="text-cyan-300" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/35">Packages</p>
          <p className="mt-2 text-3xl font-black text-white">{entries.length}</p>
        </AdminCard>
        <AdminCard className="p-5">
          <BadgeCheck className="text-emerald-300" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/35">Trusted vendors</p>
          <p className="mt-2 text-3xl font-black text-white">
            {vendors.filter((vendor) => vendor.status === "TRUSTED").length}
          </p>
        </AdminCard>
        <AdminCard className="p-5">
          <KeyRound className="text-amber-300" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/35">Trusted repositories</p>
          <p className="mt-2 text-3xl font-black text-white">
            {repositories.filter((repository) => repository.trusted).length}
          </p>
        </AdminCard>
      </div>

      {loading ? (
        <AdminCard className="flex min-h-40 items-center justify-center gap-3 p-8 text-white/55">
          <Loader2 className="animate-spin" />
          Loading marketplace trust data…
        </AdminCard>
      ) : null}

      <AdminTable>
        {entries.length ? (
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-4">Plugin</th>
                <th className="px-5 py-4">Version</th>
                <th className="px-5 py-4">Channel</th>
                <th className="px-5 py-4">Vendor</th>
                <th className="px-5 py-4">Repository</th>
                <th className="px-5 py-4">Trust</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {entries.map((entry) => {
                const allowed = ["TRUSTED", "TRUSTED_WITH_WARNING"].includes(entry.trustDecision);
                return (
                  <tr key={entry.id}>
                    <td className="px-5 py-4">
                      <p className="font-black text-white">{entry.name}</p>
                      <p className="font-mono text-xs text-white/35">{entry.pluginKey}</p>
                    </td>
                    <td className="px-5 py-4 text-white/60">{entry.version}</td>
                    <td className="px-5 py-4"><Badge variant="outline">{entry.channel}</Badge></td>
                    <td className="px-5 py-4 text-white/60">{entry.vendor?.name || "—"}</td>
                    <td className="px-5 py-4 text-white/60">{entry.repository?.name || "—"}</td>
                    <td className="px-5 py-4">
                      <Badge className={tone(entry.trustDecision)}>{entry.trustDecision}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        variant={allowed ? "default" : "destructive"}
                        disabled={!allowed || loading}
                        onClick={() => void authorize(entry)}
                      >
                        {allowed ? <Download /> : <ShieldAlert />}
                        {allowed ? "Authorize download" : "Blocked"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-sm text-white/45">No marketplace entries registered.</div>
        )}
      </AdminTable>
    </AdminPage>
  );
}
