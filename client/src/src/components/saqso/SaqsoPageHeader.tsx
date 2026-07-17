import { ReactNode } from "react";
import SaqsoCard from "./SaqsoCard";

export default function SaqsoPageHeader({
  eyebrow = "SAQSOBUILD",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    /* HEADER_GLASS_V3_ACTIVE_MARKER */
    <SaqsoCard className="relative overflow-hidden p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_35%)]" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            {eyebrow}
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 dark:text-white md:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>

        {action && <div>{action}</div>}
      </div>
    </SaqsoCard>
  );
}


