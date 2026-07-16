import { AccountCard, AccountNotice, AccountPageShell } from "../_components/AccountClientUi";
import ProfileRewardClient from "./ProfileRewardClient";

export default function AccountSettingsPage() {
  return <AccountPageShell active="Settings" eyebrow="Customer Settings" title="Account Settings" description="Manage your persisted profile and login identity.">
    <AccountCard title="Profile & Identity"><ProfileRewardClient /></AccountCard>
    <AccountNotice message="Password changes, connected social accounts, and notification preferences are managed through verified provider flows. Unconnected controls are intentionally hidden." />
  </AccountPageShell>;
}
