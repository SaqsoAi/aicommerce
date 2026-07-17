import { AccountCard, AccountForm, AccountPageShell } from "../_components/AccountClientUi";

export default function AccountSupportPage() {
  return (
    <AccountPageShell active="Settings" eyebrow="Support" title="Contact Support" description="Create a support request for order, payment, delivery, account, or wishlist help.">
      <AccountCard title="Support Ticket">
        <AccountForm
          title="Contact Support"
          submitLabel="Submit Request"
          fields={[
            { name: "topic", label: "Topic", options: ["Order", "Payment", "Delivery", "Account", "Wishlist", "Rewards"] },
            { name: "subject", label: "Subject", placeholder: "How can we help?" },
            { name: "message", label: "Message", placeholder: "Describe the issue" },
            { name: "priority", label: "Priority", options: ["Normal", "High", "Urgent"] },
          ]}
        />
      </AccountCard>
    </AccountPageShell>
  );
}