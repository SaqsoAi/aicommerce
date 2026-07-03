"use client";

import { useEffect, useState } from "react";

import HeroForm from "./HeroForm";
import HeroList from "./HeroList";

import type { Hero } from "./types";

export default function HeroPage() {
  const [heroes, setHeroes] =
    useState<Hero[]>([]);

  const API =
    process.env.NEXT_PUBLIC_API_URL;

  const fetchHeroes = async () => {
    try {
      const res = await fetch(
        `${API}/heroes`
      );

      const data =
        await res.json();

      setHeroes(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">
          Hero Management
        </h1>

        <button
          onClick={fetchHeroes}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      <HeroForm
        onSuccess={fetchHeroes}
      />

      <HeroList
        heroes={heroes}
        onRefresh={fetchHeroes}
      />
    </div>
  );
}