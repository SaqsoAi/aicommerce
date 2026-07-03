"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 6500 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 9000 },
  { month: "May", revenue: 12000 },
  { month: "Jun", revenue: 17000 },
];

export default function RevenueChart() {
  return (
    <div
      className="
      border
      border-zinc-200
      dark:border-zinc-800
      
      rounded-3xl
      
      p-6
      
      bg-white
      dark:bg-zinc-900
      
      shadow-sm
    "
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Revenue Analytics
        </h2>

        <p className="text-zinc-500 mt-1">
          Monthly sales performance
        </p>
      </div>

      <div className="h-[420px] min-w-0">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <XAxis dataKey="month" />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
