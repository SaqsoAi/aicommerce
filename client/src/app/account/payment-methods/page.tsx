import { AccountCard, AccountForm, AccountList, AccountPageShell } from "../_components/AccountClientUi";

export default function PaymentMethodsPage() {
  return (
    <AccountPageShell active="Payment Methods" eyebrow="Payments" title="Payment Methods" description="Manage payment preferences. Gateway tokenization can be added in a later payment phase.">
      <AccountCard title="Payment Preference">
        <AccountForm
          title="Add Payment Reference"
          submitLabel="Save Payment Method"
          fields={[
            { name: "method", label: "Method", options: ["Cash on Delivery", "Card", "Mobile Banking", "Bank Transfer"] },
            { name: "provider", label: "Provider", placeholder: "bKash / Visa / Bank" },
            { name: "label", label: "Label", placeholder: "Primary" },
            { name: "status", label: "Status", options: ["ACTIVE", "INACTIVE"] },
          ]}
        />
      </AccountCard>
      <AccountCard title="Saved Methods">
        <AccountList rows={[
          { Method: "Cash on Delivery", Label: "Default", Status: "ACTIVE" },
        ]} />
      </AccountCard>
    </AccountPageShell>
  );
}