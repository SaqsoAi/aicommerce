import { Inbox } from "lucide-react";

export default function AdminEmpty({
  title = "No data found",
  description = "There is nothing to show here yet.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/[0.035] p-8 text-center text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-cyan-300">
        <Inbox size={24} />
      </div>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-semibold text-white/45">{description}</p>
    </div>
  );
}
