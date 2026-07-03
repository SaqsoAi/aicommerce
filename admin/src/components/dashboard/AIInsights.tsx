"use client";

export default function AIInsights() {
  return (
    <div
      className="
      bg-white
      dark:bg-zinc-900

      border
      border-zinc-200
      dark:border-zinc-800

      rounded-3xl

      p-6
    "
    >
      <h2
        className="
        text-xl
        font-bold
        mb-4
      "
      >
        AI Insights
      </h2>

      <div className="space-y-3">
        <div>
          Top selling products trend
          increasing
        </div>

        <div>
          Low stock alert detected
        </div>

        <div>
          Customer retention stable
        </div>
      </div>
    </div>
  );
}