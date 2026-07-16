import { getAccountAddresses } from "@/api/account.api";
import { AccountCard, AccountNotice, AccountPageShell } from "../_components/AccountClientUi";
import AddressManager from "./AddressManager";

export default async function AccountAddressesPage() {
  let rows: any[] = []; let error = "";
  try { rows = await getAccountAddresses(); } catch (err) { error = err instanceof Error ? err.message : "Unable to load addresses"; }
  return <AccountPageShell active="Addresses" eyebrow="Addresses" title="Address Book" description="Manage delivery addresses and your default shipping location.">
    {error ? <AccountNotice message={error} /> : null}
    <AccountCard title="Saved Addresses"><AddressManager initialAddresses={rows} /></AccountCard>
  </AccountPageShell>;
}
