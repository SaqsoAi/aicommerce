import PluginTransactionMonitorClient from "@/components/plugin-platform/PluginTransactionMonitorClient";

export default async function PluginTransactionPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  return <PluginTransactionMonitorClient transactionId={transactionId} />;
}
