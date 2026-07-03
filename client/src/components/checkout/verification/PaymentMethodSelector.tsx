"use client";

import { Banknote, CheckCircle2, CreditCard, Smartphone, WalletCards } from "lucide-react";

type PaymentMethodSelectorProps = {
  value?: string;
  selected?: string;
  selectedMethod?: string;
  paymentMethod?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  setPaymentMethod?: (value: string) => void;
  disabled?: boolean;
  emailVerified?: boolean;
};

const methods = [
  {
    id: "COD",
    title: "Cash on Delivery",
    description: "Pay when your order arrives at your address.",
    icon: Banknote,
  },
  {
    id: "BKASH",
    title: "bKash",
    description: "Pay securely using your bKash mobile wallet.",
    icon: Smartphone,
  },
  {
    id: "NAGAD",
    title: "Nagad",
    description: "Complete payment with Nagad mobile wallet.",
    icon: WalletCards,
  },
  {
    id: "CARD",
    title: "Card Payment",
    description: "Pay using debit or credit card.",
    icon: CreditCard,
  },
];

export function PaymentMethodSelector(props: PaymentMethodSelectorProps) {
  const selected =
    props.value ||
    props.selected ||
    props.selectedMethod ||
    props.paymentMethod ||
    "COD";

  function choose(value: string) {
    if (props.disabled) return;
    props.onChange?.(value);
    props.onSelect?.(value);
    props.setPaymentMethod?.(value);
  }

  return (
    <div className="grid gap-4 sm:gap-5">
      {methods.map((method) => {
        const Icon = method.icon;
        const active = selected === method.id;

        return (
          <button
            key={method.id}
            type="button"
            disabled={props.disabled}
            onClick={() => choose(method.id)}
            className={[
              "group w-full rounded-[1.35rem] border p-4 text-left transition-all duration-300 sm:p-5",
              "bg-[#0b0b0d] text-white shadow-[0_16px_45px_rgba(0,0,0,0.28)]",
              "dark:bg-white/5",
              active
                ? "border-rose-400/70 ring-2 ring-rose-400/20"
                : "border-white/10 hover:border-rose-300/50",
              props.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:-translate-y-0.5",
            ].join(" ")}
          >
            <div className="flex items-start gap-4">
              <div
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                  active
                    ? "border-rose-300/40 bg-rose-500 text-white"
                    : "border-white/10 bg-white/10 text-white/80",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-black tracking-tight text-white sm:text-lg">
                    {method.title}
                  </h3>

                  {active ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-rose-300" />
                  ) : null}
                </div>

                <p className="mt-1.5 text-sm font-medium leading-6 text-white/60">
                  {method.description}
                </p>

                {props.emailVerified === false && method.id !== "COD" ? (
                  <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200">
                    Email verification may be required for online payment.
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default PaymentMethodSelector;
