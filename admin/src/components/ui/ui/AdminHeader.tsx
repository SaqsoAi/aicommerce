import * as React from "react";

type AdminHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function AdminHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
  ...props
}: AdminHeaderProps) {
  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between",
        className,
      ].join(" ")}
      {...props}
    >
      <div>
        {eyebrow && <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300/80">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/48">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
