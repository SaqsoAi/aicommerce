"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

type Props = {
  hero: any;
};

export default function HeroBanner({
  hero,
}: Props) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full"
    >
      <h1 className="text-4xl font-bold">
        {hero?.title}
      </h1>

      {hero?.subtitle && (
        <p className="mt-4 text-lg text-gray-600">
          {hero.subtitle}
        </p>
      )}

      {hero?.description && (
        <p className="mt-2 text-gray-500">
          {hero.description}
        </p>
      )}
    </motion.div>
  );
}

