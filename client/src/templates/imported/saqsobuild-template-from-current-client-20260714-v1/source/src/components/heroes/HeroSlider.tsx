"use client";

import type { Hero } from "@/types/hero";

type Props = {
  hero: Hero;
};

export default function HeroSlider({
  hero,
}: Props) {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold">
        {hero.title}
      </h1>

      {hero.subtitle && (
        <p className="mt-2 text-gray-600">
          {hero.subtitle}
        </p>
      )}
    </div>
  );
}

