"use client";




import AccountRealDataDashboard from "@/components/account/AccountRealDataDashboard";
import CustomerAccountSidebarWidgets from "@/components/account/CustomerAccountSidebarWidgets";
import CustomerAccountRealDataSections from "@/components/account/CustomerAccountRealDataSections";
import { useBrand } from "@/providers/BrandProvider";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
} from "lucide-react";

type AccountUser = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

const menu = [
  { label: "Overview", icon: Home, active: true },
  { label: "Order History", icon: Box },
  { label: "Wishlist", icon: Heart },
  { label: "Style Profile", icon: User },
  { label: "Rewards", icon: Gift },
  { label: "Addresses", icon: MapPin },
  { label: "Payment Methods", icon: CreditCard },
  { label: "Settings", icon: Settings },
];

const quick = [
  { label: "Track Orders", sub: "View order status", icon: Package, tone: "text-blue-400 bg-blue-500/10" },
  { label: "My Wishlist", sub: "12 saved items", icon: Heart, tone: "text-pink-400 bg-pink-500/10" },
  { label: "Size Guide", sub: "Find perfect fit", icon: Tag, tone: "text-green-400 bg-green-500/10" },
  { label: "Style Quiz", sub: "Update preferences", icon: Sparkles, tone: "text-violet-400 bg-violet-500/10" },
  { label: "My Rewards", sub: "Redeem points", icon: Gift, tone: "text-orange-400 bg-orange-500/10" },
  { label: "Get Help", sub: "24/7 support", icon: HelpCircle, tone: "text-sky-400 bg-sky-500/10" },
];

export default function AccountPage() {
  const { brand } = useBrand();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/login?returnUrl=/account";
      return;
    }

    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { setUser(null); }
    }

    setReady(true);
  }, []);

  const name = user?.name || "Sarah Johnson";
  const initials = useMemo(() => {
    return name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  }, [name]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  if (!ready) {
    return (
      <main className="account-real-data-dashboard-hide-old flex min-min-min-h-screen items-center justify-center bg-[#070707] text-white">
      <div data-account-brand-panel className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-200 dark:border-white/10 dark:bg-white/[0.045]">
        <div className="flex items-center gap-4">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.storeName} className="h-12 w-12 rounded-2xl bg-white object-contain p-1" />
          ) : null}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-zinc-500">{brand.storeName} Account</p>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {brand.contactPhone || brand.contactEmail || "Premium account support ready"}
            </p>
          </div>
        </div>
      </div>

        <p className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/[0.05] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/60">
          Loading ${brand.storeName} Account
        </p>
      </main>
    );
  }

  return (
    <main className="account-real-data-dashboard-hide-old min-min-min-h-screen bg-[#070707] pb-24 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-4 sm:px-6 lg:px-4 sm:px-6 lg:px-8 lg:px-4 sm:px-6 lg:px-4 sm:px-6 lg:px-4 sm:px-6 lg:px-4 sm:px-6 lg:px-4 sm:px-6 lg:px-10">
        <section className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-gradient-to-r from-[#27231e] to-[#8a714c] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white text-2xl font-black text-black">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-black md:text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl">Welcome back, {name}!</h1>
                <p className="mt-1 text-sm font-medium text-white/75">Member since March 2022</p>
                <p data-account-brand-note className="mt-1 text-xs font-bold text-white/55">{brand.storeName} member support: {brand.contactPhone || brand.contactEmail || "Ready"}</p>
              </div>
            </div>

            <div className="flex gap-6 md:text-right">
              <div>
                <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-black">2,450</p>
                <p className="text-sm text-white/75">Style Points</p>
              </div>
              <div className="border-l border-white/20 pl-6">
                <p className="text-lg font-black">Gold</p>
                <p className="text-sm text-white/75">Member Tier</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.22)] lg:block">
            <div className="space-y-1">
              {menu.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={[
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition",
                      item.active ? "text-white" : "text-slate-600 dark:text-white/70 hover:bg-white/[0.07] hover:text-white",
                    ].join(" ")}
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              })}
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-white/70 hover:bg-white/[0.07] hover:text-white">
                <LogOut size={17} />
                Sign Out
              </button>
<CustomerAccountSidebarWidgets />
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Quick Actions</h2>
                <Link href="/shop" className="text-sm font-bold text-white/55 hover:text-white">View All</Link>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-3 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {quick.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/[0.04] p-4 text-center transition hover:-translate-y-1 hover:bg-white/[0.07]">
                      <div className={["mx-auto flex h-10 w-10 items-center justify-center rounded-xl", item.tone].join(" ")}>
                        <Icon size={20} />
                      </div>
                      <p className="mt-3 text-sm font-black">{item.label}</p>
                      <p className="mt-1 text-xs text-white/45">{item.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Recent Orders</h2>
                  <Link href="/orders" className="text-sm font-bold text-white/55 hover:text-white">View All Orders</Link>
                </div>

                <div className="mt-5 space-y-3">
                  {[["#SH2024001","Delivered","2 items Ã‚Â· $189.99"],["#SH2024002","Shipped","3 items Ã‚Â· $299.50"],["#SH2024003","Processing","1 item Ã‚Â· $125.00"]].map((order) => (
                    <div key={order[0]} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-[#111114] border border-white/10 text-white shadow-[0_16px_45px_rgba(225,29,72,0.35)] dark:bg-[#18181b] text-white border border-white/10 dark:bg-black dark:text-white dark:text-white/20 p-4">
                      <div>
                        <p className="font-black">Order {order[0]}</p>
                        <p className="mt-1 text-sm text-slate-400 dark:text-white/60">{order[2]}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">{order[1]}</span>
                        <ChevronRight size={18} className="text-white/35" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black">My Wishlists</h2>
                    <p className="text-sm text-white/45">6 items saved</p>
                  </div>
                  <button className="text-sm font-bold text-slate-600 dark:text-white/70">+ New List</button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 lg:grid-cols-3">
                  {["Saved Wishlist","Saved Wishlist","Special Occasions"].map((x) => (
                    <div key={x} className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#111114] border border-white/10 text-white shadow-[0_16px_45px_rgba(225,29,72,0.35)] dark:bg-[#18181b] text-white border border-white/10 dark:bg-black dark:text-white dark:text-white/20 p-4">
                      <Heart size={16} className="ml-auto text-white/70" />
                      <p className="mt-5 font-black">{x}</p>
                      <p className="mt-2 text-xs text-white/45">Real wishlist data will appear here</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">Recommended for You</h2>
                  <p className="text-sm text-white/45">Based on your style profile and purchase history</p>
                </div>
                <Link href="/shop" className="text-sm font-bold text-white/55 hover:text-white">View All</Link>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 lg:grid-cols-3">
                {["Cashmere Turtleneck","Midi Wrap Dress","Leather Ankle Boots"].map((x) => (
                  <div key={x}>
                    <div className="aspect-[4/3] rounded-xl border border-slate-200 dark:border-white/10 bg-white/[0.07]" />
                    <p className="mt-3 font-black">{x}</p>
                    <p className="text-sm text-white/45">Luxury Essentials</p>
                    <p className="mt-1 font-black">$149.99</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}










