"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Brain,
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  Rocket,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const kpis = [
  { label: "Revenue Today", value: "৳ 284,500", trend: "+18.4%", icon: TrendingUp },
  { label: "Orders", value: "1,248", trend: "+9.2%", icon: ShoppingCart },
  { label: "Customers", value: "42,890", trend: "+12.7%", icon: Users },
  { label: "Products Live", value: "8,416", trend: "+4.1%", icon: Package },
];

const activities = [
  "New hero draft created for SaqsoBuild homepage",
  "12 products need low-stock attention",
  "AI generated 42 product descriptions",
  "Membership tier rule updated",
];

const quickActions = [
  { label: "Create Product", icon: Package },
  { label: "Upload Media", icon: Boxes },
  { label: "AI Generate", icon: Sparkles },
  { label: "Review Orders", icon: ShoppingCart },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-8">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
              <Rocket size={14} />
              Enterprise Command Center
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
              Welcome back, Super Admin
            </h1>

            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500 dark:text-white/50 md:text-base">
              Monitor sales, operations, AI automation, inventory health, customer growth and website studio performance from one executive dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
              Publish Update
            </button>
            <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
              Open Reports
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Icon size={20} />
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600">
                  {item.trend}
                </span>
              </div>
              <p className="mt-5 text-sm font-bold text-slate-500 dark:text-white/45">{item.label}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">{item.value}</h2>
            </div>
          );
        })}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.9fr)] 2xl:gap-5">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Business Overview</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-white/45">Revenue, orders and customer movement</p>
            </div>
            <BarChart3 className="text-cyan-500" />
          </div>

          <div className="mt-8 flex h-72 items-end gap-3">
            {[52, 72, 44, 88, 63, 92, 76, 96, 84, 104, 93, 118].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-2xl bg-slate-950/90 transition hover:bg-cyan-500 dark:bg-white/80 dark:hover:bg-cyan-400"
                  style={{ height: `${h * 1.6}px` }}
                />
                <span className="text-[10px] font-black text-slate-400">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-white to-white p-6 shadow-sm dark:from-cyan-400/10 dark:via-white/[0.04] dark:to-white/[0.02] dark:border-cyan-400/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white">
              <Brain size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black">AI Insights</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-white/45">Smart recommendations</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Hero image score can improve by 14% with subject-aware crop.",
              "Inventory forecast predicts Black XL will sell out in 3 days.",
              "AI recommends promoting premium jackets this week.",
            ].map((text) => (
              <div key={text} className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70">
                <Sparkles size={16} className="mb-2 text-cyan-500" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:gap-5">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-xl font-black">Quick Actions</h2>
          <div className="mt-5 grid gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left font-black transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                  <span className="flex items-center gap-3">
                    <Icon size={18} className="text-cyan-500" />
                    {action.label}
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-xl font-black">Recent Activity</h2>
          <div className="mt-5 space-y-4">
            {activities.map((item) => (
              <div key={item} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                <p className="text-sm font-semibold leading-6 text-slate-600 dark:text-white/60">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-xl font-black">System Health</h2>
          <div className="mt-5 space-y-3">
            {[
              { label: "Server API", ok: true },
              { label: "Admin Build", ok: true },
              { label: "Hero Upload Auth", ok: false },
              { label: "AI Engine", ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <span className="font-black">{item.label}</span>
                {item.ok ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:gap-5">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <Clock3 className="text-cyan-500" />
          <h3 className="mt-4 text-lg font-black">Order Pipeline</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-white/45">Pending: 86 · Processing: 142 · Delivered: 1,020</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <CreditCard className="text-cyan-500" />
          <h3 className="mt-4 text-lg font-black">Payment Status</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-white/45">Successful payment ratio is 97.4%</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <Activity className="text-cyan-500" />
          <h3 className="mt-4 text-lg font-black">Runtime Status</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-white/45">Admin shell is stable. Dashboard route active.</p>
        </div>
      </section>
    </main>
  );
}

