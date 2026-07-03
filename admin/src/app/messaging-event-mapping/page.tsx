"use client";

import { useState } from "react";
import { createBusinessEvent } from "@/services/messagingQueue.service";

const events = ["ORDER_PLACED","ORDER_CONFIRMED","ORDER_SHIPPED","ORDER_DELIVERED","MEMBERSHIP_EARNED","MEMBERSHIP_UPGRADED","REWARD_EARNED","REWARD_REDEEMED","ABANDONED_CART"];

export default function MessagingEventMappingPage() {
  const [eventKey, setEventKey] = useState("ORDER_PLACED");
  const [entityType, setEntityType] = useState("ORDER");
  const [receiver, setReceiver] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [entityId, setEntityId] = useState("");
  const [loading, setLoading] = useState(false);

  const createTestEvent = async () => {
    if (!receiver.trim()) { alert("Receiver required"); return; }
    setLoading(true);
    try {
      await createBusinessEvent({
        eventKey,
        entityType,
        entityId: entityId || undefined,
        receiver,
        channels: ["SMS", "WHATSAPP"],
        payloadJson: { customerName, orderId: entityId, phone: receiver, whatsapp: receiver },
      });
      alert("Event queued");
    } finally { setLoading(false); }
  };

  return (
    <main className="space-y-6 p-6 text-zinc-900 dark:text-zinc-100">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-black">Messaging Event Mapping</h1>
        <p className="mt-2 text-sm text-zinc-500">Map business events to templates. Template key format: SMS_ORDER_PLACED / WHATSAPP_ORDER_PLACED.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <select value={eventKey} onChange={(e) => setEventKey(e.target.value)} className="rounded-xl border p-3 dark:bg-zinc-900">
            {events.map(e => <option key={e}>{e}</option>)}
          </select>
          <input value={entityType} onChange={(e) => setEntityType(e.target.value)} className="rounded-xl border p-3 dark:bg-zinc-900" placeholder="ORDER / MEMBERSHIP / REWARD" />
          <input value={entityId} onChange={(e) => setEntityId(e.target.value)} className="rounded-xl border p-3 dark:bg-zinc-900" placeholder="Entity ID" />
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="rounded-xl border p-3 dark:bg-zinc-900" placeholder="Customer name" />
          <input value={receiver} onChange={(e) => setReceiver(e.target.value)} className="rounded-xl border p-3 dark:bg-zinc-900 md:col-span-2" placeholder="Receiver 8801XXXXXXXXX" />
        </div>

        <button disabled={loading} onClick={createTestEvent} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white">
          Create Test Queue Event
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((e) => (
          <div key={e} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="font-black">{e}</p>
            <p className="mt-2 text-sm text-zinc-500">SMS_{e}</p>
            <p className="text-sm text-zinc-500">WHATSAPP_{e}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
