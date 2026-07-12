"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  listPluginGuidance,
  type PluginGuidance,
} from "@/api/pluginPlatform.api";

interface PluginTooltipContextValue {
  loading: boolean;
  guidance: ReadonlyMap<string, PluginGuidance>;
  refresh: () => Promise<void>;
  getGuidance: (pluginKey: string) => PluginGuidance | undefined;
}

const PluginTooltipContext =
  createContext<PluginTooltipContextValue | null>(null);

export function PluginTooltipProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PluginGuidance[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listPluginGuidance());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const guidance = useMemo(
    () =>
      new Map(
        items.map((item) => [item.pluginKey, item])
      ),
    [items]
  );

  const value = useMemo<PluginTooltipContextValue>(
    () => ({
      loading,
      guidance,
      refresh,
      getGuidance: (pluginKey) =>
        guidance.get(pluginKey),
    }),
    [guidance, loading, refresh]
  );

  return (
    <PluginTooltipContext.Provider value={value}>
      {children}
    </PluginTooltipContext.Provider>
  );
}

export function usePluginTooltip(pluginKey?: string) {
  const context = useContext(PluginTooltipContext);

  if (!context) {
    throw new Error(
      "usePluginTooltip must be used within PluginTooltipProvider"
    );
  }

  return {
    loading: context.loading,
    refresh: context.refresh,
    guidance: pluginKey
      ? context.getGuidance(pluginKey)
      : undefined,
    allGuidance: context.guidance,
  };
}
