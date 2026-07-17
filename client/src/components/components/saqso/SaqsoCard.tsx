import { ReactNode } from "react";

export default function SaqsoCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-zinc-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl transition hover:shadow-xl dark:border-white/10 dark:bg-zinc-950/80 ${className}`}
    >
      {children}
    </div>
  );
}


