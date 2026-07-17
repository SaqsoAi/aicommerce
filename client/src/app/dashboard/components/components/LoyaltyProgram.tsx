import { SaqsoCard } from "@/components/saqso";

export default function LoyaltyProgram() {
  return (
    <SaqsoCard>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Loyalty
      </p>
      <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
        Silver Member
      </h2>
      <div className="mt-5 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-3 w-[45%] rounded-full bg-zinc-950 dark:bg-white" />
      </div>
      <p className="mt-3 text-sm text-zinc-500">
        120 points earned. Continue shopping to unlock Gold.
      </p>
    </SaqsoCard>
  );
}


