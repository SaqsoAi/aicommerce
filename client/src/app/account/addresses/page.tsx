import { getAccountAddresses } from "@/api/account.api";
import { AccountCard, AccountList, AccountNotice, AccountPageShell } from "../_components/AccountClientUi";

export default async function AccountAddressesPage() {
  let rows: any[] = [];
  let error = "";
  try {
    const data = await getAccountAddresses();
    rows = Array.isArray(data) ? data : [];
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load addresses";
  }

  return (
    <AccountPageShell active="Addresses" eyebrow="Addresses" title="Address Book" description="Manage delivery addresses and default shipping location.">
      {error && <AccountNotice message={`Address API fallback: ${error}`} />}
      <AccountCard title="Saved Addresses" subtitle="Loaded from account address API when database tables are ready.">
        <AccountList rows={rows} empty="No addresses found." />
      </AccountCard>
    </AccountPageShell>
  );
}