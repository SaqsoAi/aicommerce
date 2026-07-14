"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  endDate: string;
}

export default function HeroCountdown({
  endDate,
}: Props) {
  const [timeLeft, setTimeLeft] =
    useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const end =
        new Date(endDate).getTime();

      const now = Date.now();

      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(
        distance /
          (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (distance %
          (1000 *
            60 *
            60 *
            24)) /
          (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (distance %
          (1000 * 60 * 60)) /
          (1000 * 60)
      );

      const seconds = Math.floor(
        (distance %
          (1000 * 60)) /
          1000
      );

      setTimeLeft(
        `${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [endDate]);

  return (
    <motion.div
      className="text-center text-4xl font-bold"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{
        duration: 0.3,
      }}
    >
      {timeLeft}
    </motion.div>
  );
}

