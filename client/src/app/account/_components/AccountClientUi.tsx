"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";

export const accountNavItems = [
  { label: "Overview", href: "/account", icon: "home" },
  { label: "Order History", href: "/account/orders", icon: "box" },
  { label: "Wishlist", href: "/account/wishlist", icon: "heart" },
  { label: "Style Profile", href: "/account/style-profile", icon: "user" },
  { label: "Rewards", href: "/account/rewards", icon: "gift" },
  { label: "Addresses", href: "/account/addresses", icon: "pin" },
  { label: "Payment Methods", href: "/account/payment-methods", icon: "card" },
  { label: "Settings", href: "/account/settings", icon: "gear" },
];

export function AccountGlyph({ icon }: { icon: string }) {
  return <i className={"account-glyph account-glyph-" + icon} aria-hidden="true" />;
}

export function AccountPageShell({
  title,
  eyebrow,
  description,
  active,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  active: string;
  children: ReactNode;
}) {
  return (
    <main className="account-shell min-h-screen bg-black px-4 py-24 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        {(title || eyebrow || description) && (
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-amber-300/30 via-white/[0.04] to-white/[0.02] p-6 shadow-2xl md:p-8">
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-200">{eyebrow}</p>}
            {title && <h1 className="mt-3 text-3xl font-black md:text-5xl">{title}</h1>}
            {description && <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{description}</p>}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="account-sidebar order-2 rounded-[28px] border border-white/10 bg-white/[0.04] p-3 lg:order-none lg:sticky lg:top-24 lg:self-start lg:p-4">
            <nav className="space-y-2">
              {accountNavItems.map((item) => {
                const isActive = active === item.label;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={"account-sidebar-link " + (isActive ? "account-sidebar-link-active" : "")}
                  >
                    <span className="account-sidebar-icon"><AccountGlyph icon={item.icon} /></span>
                    <b>{item.label}</b>
                  </Link>
                );
              })}
            </nav>

            <div className="account-sidebar-bottom account-sidebar-utility">
              <div className="account-member-card">
                <div className="flex items-center gap-2">
                  <span className="account-mini-crown"><AccountGlyph icon="gift" /></span>
                  <p className="text-sm font-black text-amber-100">ISRA Member</p>
                </div>
                <p className="mt-2 text-xs text-zinc-300">View member tier, benefits, points, and upgrade progress.</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-amber-300 to-rose-500" />
                </div>
                <Link href="/account/membership" className="mt-4 inline-flex w-full justify-center rounded-full bg-rose-600 px-4 py-3 text-sm font-black text-white">
                  View Benefits
                </Link>
              </div>

              <div className="account-help-card">
                <p className="text-sm font-black">Need Help?</p>
                <p className="mt-2 text-xs text-zinc-400">Live chat, WhatsApp, call, or email support.</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Link href="/account/support" className="account-help-pill">Chat</Link>
                  <Link href="/account/support" className="account-help-pill">WhatsApp</Link>
                  <Link href="/account/support" className="account-help-pill">Call</Link>
                  <Link href="/account/support" className="account-help-pill">Email</Link>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/backend/auth/logout", { method: "POST" }).catch(() => undefined);
                  ["token", "customerToken", "accessToken", "user", "customer", "role"].forEach((key) => localStorage.removeItem(key));
                  window.location.assign("/login");
                }}
                className="account-signout mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-200 hover:bg-white/10"
              >
                <span className="account-sidebar-icon"><AccountGlyph icon="signout" /></span>
                <b>Sign Out</b>
              </button>
            </div>
          </aside>

          <section className="order-1 space-y-4 lg:order-none lg:space-y-6">{children}</section>
        </div>
      </section>
    </main>
  );
}

export function AccountCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl">
      <div className="mb-5">
        <h2 className="text-2xl font-black">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function AccountList({ rows, empty }: { rows: Array<Record<string, any>>; empty?: string }) {
  if (!rows.length) {
    return <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">{empty || "No data found."}</div>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="rounded-2xl border border-white/10 bg-black/50 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(row).slice(0, 6).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">{key}</p>
                <p className="mt-1 break-words text-sm font-bold text-zinc-200">{String(value ?? "-")}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AccountMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

export function AccountNotice({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
      {message}
    </div>
  );
}

export function AccountForm({
  title,
  fields,
  submitLabel,
  onComplete,
}: {
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    options?: string[];
  }>;
  submitLabel: string;
  onComplete?: (data: Record<string, FormDataEntryValue>) => void | Promise<void>;
}) {
  const [status, setStatus] = useState("Ready");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!onComplete) {
      setStatus("This setting is not connected yet.");
      return;
    }
    setStatus("Saving...");
    Promise.resolve(onComplete(data))
      .then(() => setStatus("Saved"))
      .catch((error) => setStatus(error instanceof Error ? error.message : "Save failed"));
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
      <h3 className="text-xl font-black">{title}</h3>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
              {field.label}
            </span>

            {field.options ? (
              <select
                name={field.name}
                className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-300"
              >
                {field.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="account-form-submit rounded-full px-6 py-3 text-sm font-black">
          {submitLabel}
        </button>
        <p className="text-xs text-zinc-500">{status}</p>
      </div>
    </form>
  );
}

export function ProfileCompletionRewardPopup({
  open,
  points,
  balance,
  onClose,
}: {
  open: boolean;
  points: number;
  balance?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="account-reward-popup-backdrop" role="dialog" aria-modal="true">
      <div className="account-reward-popup">
        <div className="account-reward-burst">★</div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">Profile Completed</p>
        <h2 className="mt-3 text-3xl font-black">You earned {points} Style Points!</h2>
        <p className="mt-3 text-sm text-zinc-300">
          Your profile is complete. {balance ? `Your new balance is ${balance.toLocaleString("en-BD")} style points.` : "Your reward has been added to your account."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account/rewards" className="rounded-full bg-white px-5 py-3 text-sm font-black text-black">
            View Rewards
          </Link>
          <Link href="/shop" className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white">
            Continue Shopping
          </Link>
          <button onClick={onClose} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

