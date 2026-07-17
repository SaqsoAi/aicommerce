"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { useEffect, useState } from "react";

import {
  createMembershipTier,
  getMembershipCards,
  getMembershipClaims,
  getMembershipTiers,
  issueMembershipCard,
} from "@/services/membership.service";

export default function MembershipPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    minOrderAmount: "",
    discountPercent: "",
    sortOrder: "",
  });

  const loadData = async () => {
    setTiers(await getMembershipTiers());
    setClaims(await getMembershipClaims());
    setCards(await getMembershipCards());
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout>
      {" "}
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-4xl font-bold">Membership Engine</h1>

          <p className="text-zinc-500">
            Manage tiers, customer claims, random membership cards and WhatsApp
            instructions.
          </p>
        </div>

        <section className="rounded-3xl border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-5 text-2xl font-bold">Create Membership Tier</h2>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              placeholder="Tier Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-2xl border p-4 dark:bg-zinc-950"
            />

            <input
              placeholder="Min Invoice Amount"
              value={form.minOrderAmount}
              onChange={(e) =>
                setForm({ ...form, minOrderAmount: e.target.value })
              }
              className="rounded-2xl border p-4 dark:bg-zinc-950"
            />

            <input
              placeholder="Discount %"
              value={form.discountPercent}
              onChange={(e) =>
                setForm({ ...form, discountPercent: e.target.value })
              }
              className="rounded-2xl border p-4 dark:bg-zinc-950"
            />

            <input
              placeholder="Sort Order"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="rounded-2xl border p-4 dark:bg-zinc-950"
            />
          </div>

          <button
            onClick={async () => {
              await createMembershipTier(form);
              setForm({
                name: "",
                minOrderAmount: "",
                discountPercent: "",
                sortOrder: "",
              });
              await loadData();
            }}
            className="mt-5 rounded-2xl bg-black px-6 py-3 text-white dark:bg-white dark:text-black"
          >
            Add Tier
          </button>
        </section>

        <section className="rounded-3xl border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-5 text-2xl font-bold">Membership Tiers</h2>

          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Min Invoice</th>
                  <th className="p-4 text-left">Discount</th>
                  <th className="p-4 text-left">Active</th>
                </tr>
              </thead>

              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="border-b">
                    <td className="p-4">{tier.name}</td>
                    <td className="p-4">Tk {tier.minOrderAmount}</td>
                    <td className="p-4">{tier.discountPercent}%</td>
                    <td className="p-4">{tier.active ? "YES" : "NO"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-5 text-2xl font-bold">Membership Claims</h2>

          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Tier</th>
                  <th className="p-4 text-left">Invoice</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} className="border-b">
                    <td className="p-4">{claim.userId}</td>
                    <td className="p-4">{claim.tier?.name}</td>
                    <td className="p-4">Tk {claim.invoiceAmount}</td>
                    <td className="p-4">{claim.status}</td>
                    <td className="p-4">
                      {claim.status === "PENDING" && (
                        <button
                          onClick={async () => {
                            const whatsapp = prompt(
                              "Customer WhatsApp Number?",
                            );
                            const res = await issueMembershipCard(
                              claim.id,
                              whatsapp || undefined,
                            );

                            alert(
                              res.data?.whatsappInstruction || "Card issued",
                            );
                            await loadData();
                          }}
                          className="rounded-xl bg-green-600 px-4 py-2 text-white"
                        >
                          Issue Card
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-5 text-2xl font-bold">Issued Cards</h2>

          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">Card</th>
                  <th className="p-4 text-left">Tier</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">WhatsApp</th>
                </tr>
              </thead>

              <tbody>
                {cards.map((card) => (
                  <tr key={card.id} className="border-b">
                    <td className="p-4 font-bold">{card.cardNumber}</td>
                    <td className="p-4">{card.tier?.name}</td>
                    <td className="p-4">{card.status}</td>
                    <td className="p-4">{card.sentToWhatsapp || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>{" "}
    </DashboardLayout>
  );
}
