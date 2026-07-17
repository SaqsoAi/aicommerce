import { getAccountOrders } from "@/api/account.api";
import { AccountCard, AccountList, AccountNotice, AccountPageShell } from "../_components/AccountClientUi";

export default async function AccountOrdersPage() {
  let rows: any[] = [];
  let error = "";
  try {
    const data = await getAccountOrders();
    rows = Array.isArray(data) ? data : (data as any)?.orders || [];
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load orders";
  }

  return (
    <AccountPageShell active="Order History" eyebrow="Orders" title="Order History" description="Track order status, totals, and details from your account.">
      {error && <AccountNotice message={`Orders API fallback: ${error}`} />}
      <AccountCard title="Your Orders" subtitle="Real account orders integration.">
        <AccountList rows={rows} empty="No orders found." />
      </AccountCard>
    </AccountPageShell>
  );
}