import * as React from "react";

type AdminPageProps = React.HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export default function AdminPage({
  eyebrow,
  title,
  description,
  className = "",
  children,
  ...props
}: AdminPageProps) {
  return (
    <section className={["min-h-screen space-y-6 text-white", className].join(" ")} {...props}>
      {(eyebrow || title || description) && (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          {eyebrow && (
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300/80">
              {eyebrow}
            </p>
          )}
          {title && <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>}
          {description && <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/48">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
