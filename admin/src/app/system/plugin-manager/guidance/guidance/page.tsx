"use client";

import { Info, RefreshCw } from "lucide-react";
import { useMemo } from "react";

import AdminCard from "@/components/ui/AdminCard";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminPage from "@/components/ui/AdminPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PluginTooltip from "@/components/plugin-platform/PluginTooltip";
import { usePluginTooltip } from "@/components/plugin-platform/PluginTooltipContext";

export default function PluginGuidancePage() {
  const { allGuidance, loading, refresh } =
    usePluginTooltip();

  const rows = useMemo(
    () => [...allGuidance.values()],
    [allGuidance]
  );

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin Manager / Guidance"
        title="Plugin Tooltip Guidance"
        description="Preview the reusable setup and operation guidance generated from lifecycle, configuration and health state."
        actions={
          <Button
            variant="outline"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((item) => (
          <AdminCard
            key={item.pluginKey}
            className="space-y-4 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-black text-white">
                  {item.pluginName}
                </h2>
                <p className="mt-1 font-mono text-xs text-white/35">
                  {item.pluginKey}
                </p>
              </div>
              <Badge>{item.guidanceState}</Badge>
            </div>

            <p className="text-sm text-white/55">
              {item.summary}
            </p>

            <PluginTooltip
              pluginKey={item.pluginKey}
              placement="right"
            >
              <Button variant="outline">
                <Info />
                Preview tooltip
              </Button>
            </PluginTooltip>
          </AdminCard>
        ))}
      </div>
    </AdminPage>
  );
}
