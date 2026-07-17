"use client";

import { useEffect, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

type ReviewSummaryData = {
  totalReviews: number;
  averageRating: number;
  positive: number;
  neutral: number;
  negative: number;
  summary: string;
};

export default function ReviewSummary({
  productId,
}: {
  productId: string;
}) {
  const [data, setData] =
    useState<ReviewSummaryData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API}/ai-review/products/${productId}/summary`
        );

        const json = await res.json();

        if (json?.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Review summary error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      load();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="rounded-xl border p-4 text-sm text-zinc-500">
        Loading AI review summary...
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-lg font-bold">
        AI Review Summary
      </h3>

      <p className="mt-2 text-sm text-zinc-500">
        {data.summary}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Reviews</p>
          <p className="font-bold">{data.totalReviews}</p>
        </div>

        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Rating</p>
          <p className="font-bold">{data.averageRating}/5</p>
        </div>

        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Positive</p>
          <p className="font-bold">{data.positive}</p>
        </div>

        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Negative</p>
          <p className="font-bold">{data.negative}</p>
        </div>
      </div>
    </div>
  );
}
