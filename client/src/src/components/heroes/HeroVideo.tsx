"use client";

import type { Hero } from "@/types/hero";

type Props = {
  hero: Hero;
};

export default function HeroVideo({
  hero,
}: Props) {
  return (
    <div>
      <h1>{hero.title}</h1>

      {hero.video && (
        <video
          controls
          className="w-full"
        >
          <source src={hero.video} />
        </video>
      )}
    </div>
  );
}

