"use client";

const steps = ["Cart", "Details", "Benefits", "Payment"];

export function CheckoutProgress() {
  return (
    <section className="w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#050506] px-4 py-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] sm:px-6">
      <div className="flex w-full items-start justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {index < steps.length - 1 ? (
              <span className="absolute left-1/2 top-4 h-px w-full bg-white/10 sm:top-5" />
            ) : null}

            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-300/40 bg-gradient-to-br from-rose-600 to-amber-500 text-[11px] font-black text-white shadow-lg shadow-rose-950/30 sm:h-10 sm:w-10">
              {index + 1}
            </span>

            <div className="relative z-10 mt-2 min-w-0">
              <p className="hidden text-[9px] font-black uppercase tracking-[0.18em] text-white/35 sm:block">
                Step {index + 1}
              </p>
              <p className="truncate text-[10px] font-black text-white sm:text-xs">
                {step}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CheckoutProgress;
