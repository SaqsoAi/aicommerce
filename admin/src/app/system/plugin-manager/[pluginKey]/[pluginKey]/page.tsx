import PluginLifecycleClient from "@/components/plugin-platform/PluginLifecycleClient";

export default async function PluginLifecyclePage({
  params,
}: {
  params: Promise<{ pluginKey: string }>;
}) {
  const { pluginKey } = await params;
  return <PluginLifecycleClient pluginKey={decodeURIComponent(pluginKey)} />;
}
