import HeroRenderer from "@/components/heroes/HeroRenderer";

export default function LuxuryHome() {
  return (
    <HeroRenderer
      hero={{
        id: "luxury-hero",
        title: "Luxury Collection",
        subtitle: "Premium Lifestyle",
        type: "banner",
        active: true,
      }}
    />
  );
}

