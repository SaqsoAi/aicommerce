"use client";

import type { Hero } from "@/types/hero";

import HeroSlider from "./HeroSlider";
import HeroBanner from "./HeroBanner";
import HeroVideo from "./HeroVideo";
import HeroCountdown from "./HeroCountdown";

interface Props {
  hero?: Hero | null;
}

export default function HeroRenderer({
  hero,
}: Props) {
  if (!hero || !hero.active) {
    return null;
  }

  const type = hero.type?.toLowerCase();

  if (!type) return null;

  switch (type) {
    case "slider":
      return <HeroSlider hero={hero} />;

    case "banner":
      return <HeroBanner hero={hero} />;

    case "video":
      return <HeroVideo hero={hero} />;

    case "countdown":
      return (
        <HeroCountdown
          endDate={hero.endDate ?? ""}
        />
      );

    default:
      return <HeroBanner hero={hero} />;
  }
}

