"use client";

type ProductEngineWidgetProps = {
  computed?: {
    basePrice: number;
    finalPrice: number;
    discountAmount: number;
    stockStatus: string;
    variantStock: number;
  };
  aiMeta?: {
    aiTitle?: string;
    aiDescription?: string;
    aiTags?: string[];
  } | null;
};

export default function ProductEngineWidget({
  computed,
  aiMeta,
}: ProductEngineWidgetProps) {
  if (!computed && !aiMeta) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-600">
            AI Product Intelligence
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            {aiMeta?.aiTitle || "Smart Product Summary"}
          </h3>
          {aiMeta?.aiDescription ? (
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {aiMeta.aiDescription}
            </p>
          ) : null}
        </div>

        {computed ? (
          <div className="rounded-2xl bg-slate-100 p-4 text-sm dark:bg-slate-900">
            <p className="font-semibold text-slate-950 dark:text-white">
              Stock: {computed.stockStatus}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Available: {computed.variantStock}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Price: {computed.finalPrice}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}