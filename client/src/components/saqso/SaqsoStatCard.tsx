import SaqsoCard from "./SaqsoCard";

export default function SaqsoStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <SaqsoCard>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>

      <h3 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
        {value}
      </h3>

      {hint && <p className="mt-2 text-xs text-zinc-500">{hint}</p>}
    </SaqsoCard>
  );
}


