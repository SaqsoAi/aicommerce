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
  getStorePluginVisibility,
  type StorePluginVisibilityDocument,
  type StorePluginVisibilityItem,
} from "@/api/plugin-visibility.api";

interface PluginVisibilityContextValue {
  loading: boolean;
  document: StorePluginVisibilityDocument | null;
  refresh: () => Promise<void>;
  isPluginEnabled: (pluginKey: string) => boolean;
  plugin: (
    pluginKey: string
  ) => StorePluginVisibilityItem | undefined;
}

const PluginVisibilityContext =
  createContext<PluginVisibilityContextValue | null>(
    null
  );

export function PluginVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [document, setDocument] =
    useState<StorePluginVisibilityDocument | null>(
      null
    );

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setDocument(await getStorePluginVisibility());
    } catch {
      // Authenticated tenant context may not yet exist.
      // Deny by default rather than exposing plugins.
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<PluginVisibilityContextValue>(
    () => ({
      loading,
      document,
      refresh,
      isPluginEnabled: (pluginKey) =>
        document?.plugins.some(
          (item) =>
            item.pluginKey === pluginKey &&
            item.enabled === true &&
            item.effectiveAccess === true
        ) || false,
      plugin: (pluginKey) =>
        document?.plugins.find(
          (item) => item.pluginKey === pluginKey
        ),
    }),
    [document, loading, refresh]
  );

  return (
    <PluginVisibilityContext.Provider value={value}>
      {children}
    </PluginVisibilityContext.Provider>
  );
}

export function usePluginVisibility() {
  const value = useContext(PluginVisibilityContext);

  if (!value) {
    throw new Error(
      "usePluginVisibility must be used inside PluginVisibilityProvider"
    );
  }

  return value;
}
