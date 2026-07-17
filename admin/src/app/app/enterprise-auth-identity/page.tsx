"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Dashboard = {
  activeSessions: number;
  trustedDevices: number;
  loginEvents: number;
  twoFactorEnabled: number;
  securityEvents: number;
};

export default function EnterpriseAuthIdentityPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    fetch(`${API}/enterprise-auth-identity/dashboard`, { headers })
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(() => setData(null));
  }, []);

  const cards = [
    ["Active Sessions", data?.activeSessions ?? 0],
    ["Trusted Devices", data?.trustedDevices ?? 0],
    ["Login Events", data?.loginEvents ?? 0],
    ["2FA Enabled", data?.twoFactorEnabled ?? 0],
    ["Security Events", data?.securityEvents ?? 0],
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            PHASE-4.0I-P
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Enterprise Authentication & Identity Platform
          </h1>

          <p className="mt-2 text-slate-400">
            Sessions, refresh tokens, trusted devices, login history, 2FA,
            magic links, password reset, and security policies.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          {cards.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-bold">{value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Identity Control Center</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              "Session Manager",
              "Device Manager",
              "2FA Manager",
              "Login History",
              "Security Policies",
              "Force Logout",
              "Magic Link",
              "Password Reset",
              "Security Events",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
