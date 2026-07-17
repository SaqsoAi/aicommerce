"use client";

import HeroEditor from "./HeroEditor";
import type { Hero } from "./types";

type Props = {
  heroes: Hero[];
  onRefresh: () => void;
};

export default function HeroList({
  heroes,
  onRefresh,
}: Props) {
  if (!heroes.length) {
    return (
      <div className="text-gray-500">
        No heroes found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {heroes.map((hero) => (
        <HeroEditor
          key={hero.id}
          hero={hero}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}