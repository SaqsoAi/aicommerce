import * as React from "react";

type AdminCardProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

export default function AdminCard({ className = "", glow = false, ...props }: AdminCardProps) {
  return (
    <div
      className={[
        "rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.065]",
        glow ? "ring-1 ring-cyan-400/20 shadow-cyan-950/20" : "",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
