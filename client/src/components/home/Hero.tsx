"use client";

import { motion } from "framer-motion";

import {
useBrand,
} from "@/providers/BrandProvider";

import {
fadeInUp,
} from "@/lib/animations";

export default function Hero() {
const { brand } =
useBrand();

return ( <section className="h-screen flex items-center justify-center relative overflow-hidden">

```
  <div className="absolute inset-0">
    <img
      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
      className="w-full h-full object-cover"
      alt="Hero Banner"
    />
  </div>

  <div className="absolute inset-0 bg-black/50" />

  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    className="relative z-10 text-center text-white px-4"
  >
    <h1
      className="
      text-4xl
      tablet:text-5xl
      laptop:text-6xl
      desktop:text-7xl
      font-bold
      leading-tight
    "
    >
      Luxury Fashion
      <br />
      Redefined
    </h1>

    <p className="mt-4 text-lg">
      Welcome to {brand.storeName}
    </p>

    <p
      className="
      mt-6
      text-base
      tablet:text-lg
      laptop:text-xl
    "
    >
      AI Powered Modern Ecommerce
    </p>

    <button className="mt-8 bg-white text-black px-8 py-4 rounded-full">
      Shop Now
    </button>
  </motion.div>

</section>


);
}


