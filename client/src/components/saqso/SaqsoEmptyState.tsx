import SaqsoCard from "./SaqsoCard";
import SaqsoButton from "./SaqsoButton";

export default function SaqsoEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <SaqsoCard className="p-10 text-center">
      <h3 className="text-2xl font-black text-zinc-950 dark:text-white">
        {title}
      </h3>

      {description && (
        <p className="mx-auto mt-3 max-w-md text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}

      {actionLabel && actionHref && (
        <div className="mt-6">
          <SaqsoButton href={actionHref}>{actionLabel}</SaqsoButton>
        </div>
      )}
    </SaqsoCard>
  );
}


