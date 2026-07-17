"use client";

import { useEffect, useState } from "react";

export default function FlashSaleCard() {
  const [timeLeft, setTimeLeft] =
    useState(3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, []);

  return (
    <div className="bg-red-500 text-white p-6 rounded-2xl">
      <h2 className="text-2xl font-bold">
        Flash Sale
      </h2>

      <p className="mt-3 text-4xl font-bold">
        {timeLeft}s
      </p>
    </div>
  );
}