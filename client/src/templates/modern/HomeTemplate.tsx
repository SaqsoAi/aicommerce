import HeroRenderer from "@/components/heroes/HeroRenderer";

export default function ModernHome() {
  return (
    <HeroRenderer
      hero={{
        id: "modern-hero",
        title: "Modern Collection",
        subtitle: "Minimal & Clean Design",
        type: "banner",
        active: true,
      }}
    />
  );
}


