"use client";




import { getCustomerToken } from "@/lib/customer-auth";
import { useBrand } from "@/providers/BrandProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useCartStore } from "@/store/cart.store";
import { useAuth } from "@/providers/AuthProvider";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import MembershipCheckoutSummary from "@/components/checkout/MembershipCheckoutSummary";
import CheckoutHero from "@/components/checkout/luxury/CheckoutHero";
import CheckoutProgress from "@/components/checkout/luxury/CheckoutProgress";
import CheckoutTrustPanel from "@/components/checkout/luxury/CheckoutTrustPanel";
import CheckoutAiInsights from "@/components/checkout/luxury/CheckoutAiInsights";
import PaymentMethodSelector from "@/components/checkout/verification/PaymentMethodSelector";
import EmailVerificationGate from "@/components/checkout/verification/EmailVerificationGate";

import { createOrder } from "@/services/order.service";

const ONLINE_PAYMENT_METHODS = [
  "BKASH",
  "NAGAD",
  "CARD",
  "SSLCOMMERZ",
];


function getCheckoutErrorMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Order failed. Please check your information and try again."
  );
}
export default function CheckoutPage() {
  const { brand } = useBrand();
  const router = useRouter();
  const { user } = useAuth();
  const authToken = getCustomerToken();
  const authUserId = user?.id || user?._id || user?.userId || user?.customerId;

  const [selectedRewardRuleId, setSelectedRewardRuleId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showVerificationGate, setShowVerificationGate] = useState(false);

  const { items, clearCart } = useCartStore();

  const handleOrder = async (customer: any) => {
    try {
      if (!authUserId) {
        toast.error("Please login first");
        return;
      }

      const needsEmailVerification =
        ONLINE_PAYMENT_METHODS.includes(paymentMethod);

      if (needsEmailVerification && !user?.emailVerified) {
        setShowVerificationGate(true);
        toast.error("Please verify your email before online payment");
        return;
      }

      const customerPhone =
        customer?.phone ||
        customer?.mobile ||
        customer?.contactPhone ||
        user?.phone ||
        user?.mobile ||
        "";

      if (!customerPhone) {
        toast.error("Phone number is required to place order");
        return;
      }

      await createOrder({
        userId: String(authUserId || user?.id || user?._id || user?.userId || user?.customerId || "guest-checkout-user"),
        customer: {
          name: customer?.name || user?.name || "Customer",
          phone: String(customerPhone || customer?.phone || customer?.mobile || customer?.contactPhone || user?.phone || user?.mobile || "01700000000"),
          address: customer?.address || user?.addressLine1 || user?.address || "Address not provided",
          email: customer?.email || user?.email || "",
        },

        paymentMethod,

        rewardRuleId: selectedRewardRuleId || undefined,

        items: items.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      clearCart();

      toast.success("Order placed successfully");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(getCheckoutErrorMessage(error));
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#172033_0%,#070a12_42%,#030303_100%)] text-white">
        <div className="mx-auto w-full max-w-[1480px] space-y-5 px-4 pb-12 pt-[calc(var(--ai-header-h-mobile)+1rem)] sm:space-y-7 sm:px-6 sm:pt-[calc(var(--ai-header-h-tablet)+1.4rem)] lg:px-10 lg:pt-[calc(var(--ai-header-h-desktop)+1.6rem)]">
          <CheckoutHero />
          <div data-checkout-brand-panel className="rounded-[1.6rem] border border-slate-200 dark:border-white/10 bg-white/[0.08] p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:rounded-[1.6rem] sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.storeName} className="h-12 sm:h-14 w-14 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-lg" />
              ) : null}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45 sm:text-xs">{brand.storeName} Secure Checkout</p>
                <h2 className="mt-1 text-xl font-black sm:text-xl sm:text-2xl">Trusted checkout with brand support</h2>
                <p className="mt-1 text-sm font-semibold text-white/55">
                  {brand.contactPhone || brand.contactEmail || brand.address || "Premium support ready"}
                </p>
              </div>
            </div>
          </div>


          <CheckoutProgress />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:items-start xl:gap-5 lg:gap-7">
            <section className="min-w-0 space-y-5 sm:space-y-6">
              <div className="rounded-[1.6rem] border border-slate-200 dark:border-white/10 bg-white/[0.08] p-4 shadow-[0_20px_70px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:rounded-[1.6rem] sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/45 sm:text-xs">
                  Delivery Details
                </p>

                <h2 className="mt-3 text-xl font-black text-white sm:text-xl sm:text-2xl">
                  Where should we send your order?
                </h2>

                <div className="mt-5 sm:mt-6">
                  <CheckoutForm onSubmit={handleOrder} />
                </div>
              </div>

              <CheckoutTrustPanel />
            </section>

            <aside className="min-w-0 space-y-5 lg:sticky lg:top-[calc(var(--ai-header-h-desktop)+1rem)]">
              <CheckoutAiInsights items={items} />

              <PaymentMethodSelector
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />

              <MembershipCheckoutSummary
                items={items}
                selectedRewardRuleId={selectedRewardRuleId}
                setSelectedRewardRuleId={setSelectedRewardRuleId}
              />

              <OrderSummary items={items} />
            </aside>
          </div>
        </div>

        <EmailVerificationGate
          open={showVerificationGate}
          onClose={() => {
            setShowVerificationGate(false);
            setPaymentMethod("COD");
          }}
          email={user?.email}
        />
      </main>
    </ProtectedRoute>
  );
}
















