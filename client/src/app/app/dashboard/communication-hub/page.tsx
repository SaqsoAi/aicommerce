"use client";

import { useEffect, useState } from "react";
import { getCustomerOmnichannelTimeline } from "@/services/omnichannel.service";

export default function CommunicationHubPage() {
  const [timeline, setTimeline] = useState<any>({});

  useEffect(() => {
    getCustomerOmnichannelTimeline().then(setTimeline);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-500">
            Communication Hub
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Unified Communication Timeline
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            View your notification, message and business event communication history.
          </p>
        </div>

        <pre className="overflow-auto rounded-3xl border border-zinc-200 bg-white p-5 text-xs shadow dark:border-zinc-800 dark:bg-zinc-950">
          {JSON.stringify(timeline, null, 2)}
        </pre>
      </section>
    </main>
  );
}
