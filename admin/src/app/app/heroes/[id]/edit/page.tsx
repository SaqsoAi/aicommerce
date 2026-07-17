"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import HeroForm from "../../HeroForm";

import type { Hero } from "../../types";

export default function EditHeroPage() {
  const params = useParams();

  const [hero, setHero] =
    useState<Hero | null>(null);

  const [loading, setLoading] =
    useState(true);

  const API =
    process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(
          `${API}/heroes/${params.id}`
        );

        const data =
          await res.json();

        setHero(data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="p-6">
        Hero not found
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Edit Hero
      </h1>

      <HeroForm
        hero={hero}
        isEdit
      />
    </div>
  );
}