import type { ReactNode } from "react";

import { PluginTooltipProvider } from "@/components/plugin-platform/PluginTooltipContext";

export default function PluginManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PluginTooltipProvider>
      {children}
    </PluginTooltipProvider>
  );
}
