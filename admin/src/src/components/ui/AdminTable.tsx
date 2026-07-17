import * as React from "react";

export default function AdminTable({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl",
        className,
      ].join(" ")}
      {...props}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
