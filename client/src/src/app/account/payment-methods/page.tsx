import { AccountCard, AccountNotice, AccountPageShell } from "../_components/AccountClientUi";

export default function PaymentMethodsPage() {
  return <AccountPageShell active="Payment Methods" eyebrow="Payments" title="Payment Methods" description="Payment credentials are securely handled by the selected gateway during checkout.">
    <AccountCard title="Saved Methods"><AccountNotice message="No tokenized payment method is saved. Raw card or mobile-banking credentials are never stored in your customer profile." /></AccountCard>
  </AccountPageShell>;
}
