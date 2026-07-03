"use client";

const steps = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

type Props = {
  status?: string;
  timeline?: any[];
};

export default function OrderTracker({
  status = "PENDING",
  timeline = [],
}: Props) {
  const activeIndex =
    Math.max(
      0,
      steps.indexOf(status)
    );

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-5 text-xl font-black">
        Order Tracking
      </h2>

      <div className="grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => {
          const active =
            index <= activeIndex;

          return (
            <div
              key={step}
              className="flex items-center gap-3 md:block"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"
                }`}
              >
                {index + 1}
              </div>

              <p
                className={`mt-0 text-sm font-bold md:mt-3 ${
                  active
                    ? "text-zinc-950 dark:text-white"
                    : "text-zinc-400"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-3">
        {timeline.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No timeline updates yet.
          </p>
        ) : (
          timeline.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"
            >
              <p className="font-bold">
                {item.status}
              </p>
              <p className="text-sm text-zinc-500">
                {item.message}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


